"use server";

import prisma from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";

import { Resend } from "resend";
import { InviteEmail } from "@/components/emails/invite-email";

const resend = new Resend(process.env.RESEND_API_KEY);

export const inviteMemberByEmail = async (workspaceId: string, email: string) => {
    const user = await currentUser();
    if (!user || !user.id) return { error: "Unauthorized" };

    // Check if user is admin or owner
    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        include: {
            members: {
                where: { userId: user.id }
            }
        }
    });

    if (!workspace) return { error: "Workspace not found" };

    const isOwner = workspace.ownerId === user.id;
    const member = workspace.members[0];
    const isAdmin = member?.role === "ADMIN";

    if (!isOwner && !isAdmin) {
        return { error: "Permission denied" };
    }

    // Check if email is already a member
    const existingMember = await prisma.workspaceMember.findFirst({
        where: {
            workspaceId,
            user: {
                email
            }
        }
    });

    if (existingMember) {
        return { error: "User is already a member of this workspace" };
    }

    try {
        // Check for existing pending invitation
        const existingInvite = await prisma.invitation.findFirst({
            where: {
                workspaceId,
                email,
                expiresAt: {
                    gt: new Date()
                }
            }
        });

        if (existingInvite) {
            return { error: "Invitation already sent to this email" };
        }

        const token = uuidv4();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

        await prisma.invitation.create({
            data: {
                workspaceId,
                email,
                token,
                expiresAt,
                role: "TEAM_MEMBER"
            }
        });

        // Send email
        const inviteLink = `${process.env.NEXTAUTH_URL}/invite/${token}`;

        await resend.emails.send({
            from: "WorkspacePro <onboarding@resend.dev>",
            to: email,
            subject: `Join ${workspace.name} on WorkspacePro`,
            react: InviteEmail({
                username: email,
                invitedByUsername: user.name || "A user",
                invitedByEmail: user.email || undefined,
                teamName: workspace.name,
                // teamImage: workspace.logo || "",
                inviteLink,
                inviteFromIp: "127.0.0.1", // Placeholder
                inviteFromLocation: "Earth", // Placeholder
            }) as React.ReactElement,
        });

        revalidatePath(`/${workspaceId}/settings`);
        return { success: "Invitation sent successfully", inviteLink };
    } catch (error) {
        console.error(error);
        return { error: "Failed to send invitation" };
    }
};

export const createInvitationLink = async (workspaceId: string) => {
    const user = await currentUser();
    if (!user || !user.id) return { error: "Unauthorized" };

    // Check if user is admin or owner
    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        include: {
            members: {
                where: { userId: user.id }
            }
        }
    });

    if (!workspace) return { error: "Workspace not found" };

    const isOwner = workspace.ownerId === user.id;
    const member = workspace.members[0];
    const isAdmin = member?.role === "ADMIN";

    if (!isOwner && !isAdmin) {
        return { error: "Unauthorized" };
    }

    try {
        // Check for existing active public invitation
        const existing = await prisma.invitation.findFirst({
            where: {
                workspaceId,
                email: null,
                expiresAt: {
                    gt: new Date()
                }
            }
        });

        if (existing) {
            return { success: "Invitation link retrieved", token: existing.token };
        }

        // Create new
        const token = uuidv4();
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // Expires in 7 days

        await prisma.invitation.create({
            data: {
                workspaceId,
                token,
                expiresAt,
                role: "TEAM_MEMBER"
            }
        });

        revalidatePath(`/${workspaceId}/settings`);
        return { success: "Invitation link created", token };
    } catch (error) {
        return { error: "Failed to create invitation" };
    }
};

export const revokeInvitation = async (workspaceId: string, token: string) => {
    const user = await currentUser();
    if (!user || !user.id) return { error: "Unauthorized" };

    try {
        await prisma.invitation.delete({
            where: { token }
        });

        revalidatePath(`/${workspaceId}/settings`);
        return { success: "Invitation revoked" };
    } catch {
        return { error: "Failed to revoke invitation" };
    }
};

export const getWorkspaceInvitations = async (workspaceId: string) => {
    return await prisma.invitation.findMany({
        where: {
            workspaceId,
            expiresAt: {
                gt: new Date()
            }
        },
        orderBy: { createdAt: "desc" }
    });
};

export const joinWorkspace = async (token: string) => {
    const user = await currentUser();
    if (!user || !user.id) return { error: "Unauthenticated", code: "UNAUTHENTICATED" };

    try {
        const invitation = await prisma.invitation.findUnique({
            where: { token },
            include: { workspace: true }
        });

        if (!invitation || invitation.expiresAt < new Date()) {
            return { error: "Invalid or expired invitation" };
        }

        // Check if already a member
        const existingMember = await prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId: invitation.workspaceId,
                    userId: user.id
                }
            }
        });

        if (existingMember) {
            return { success: "Already a member", workspaceId: invitation.workspaceId };
        }

        await prisma.workspaceMember.create({
            data: {
                workspaceId: invitation.workspaceId,
                userId: user.id,
                role: invitation.role
            }
        });

        // If it was a single-use invite (with email), delete it. 
        // If public (email null), keep it.
        if (invitation.email) {
            await prisma.invitation.delete({ where: { id: invitation.id } });
        }

        return { success: "Joined workspace", workspaceId: invitation.workspaceId };

    } catch (error) {
        console.error(error);
        return { error: "Failed to join workspace" };
    }
};

export const getInvitationDetails = async (token: string) => {
    try {
        const invitation = await prisma.invitation.findUnique({
            where: { token },
            include: {
                workspace: {
                    select: { name: true, logo: true, description: true }
                }
            }
        });

        if (!invitation || invitation.expiresAt < new Date()) {
            return { error: "Invitation invalid or expired" };
        }

        return { invitation };
    } catch {
        return { error: "Failed to fetch invitation" };
    }
};
