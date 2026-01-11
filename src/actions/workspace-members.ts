"use server";

import prisma from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { Role } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { v4 as uuidv4 } from "uuid";
import { checkPermissions, PERMISSIONS } from "@/lib/permissions";

export const getWorkspaceMembers = async (workspaceId: string) => {
    const user = await currentUser();
    if (!user) return [];

    const members = await prisma.workspaceMember.findMany({
        where: { workspaceId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true,
                }
            }
        }
    });

    return members;
};


export const updateMemberRole = async (workspaceId: string, memberId: string, role: Role) => {
    const user = await currentUser();
    if (!user || !user.id) return { error: "Unauthorized" };

    const { isAllowed } = await checkPermissions(user.id, workspaceId, [...PERMISSIONS.WORKSPACE.MANAGE_MEMBERS]);
    if (!isAllowed) return { error: "Permission denied" };

    try {
        await prisma.workspaceMember.update({
            where: { id: memberId },
            data: { role }
        });

        revalidatePath(`/${workspaceId}/settings`);
        return { success: "Role updated" };
    } catch {
        return { error: "Failed to update role" };
    }
};

export const inviteMember = async (workspaceId: string, email: string, role: Role) => {
    const user = await currentUser();
    if (!user || !user.id) return { error: "Unauthorized" };

    const { isAllowed } = await checkPermissions(user.id, workspaceId, [...PERMISSIONS.WORKSPACE.MANAGE_MEMBERS]);
    if (!isAllowed) return { error: "Permission denied" };

    const token = uuidv4();
    const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

    try {
        await prisma.workspaceInvite.create({
            data: {
                workspaceId,
                email,
                role,
                token,
                expires
            }
        });

        revalidatePath(`/${workspaceId}/settings`);
        return { success: "Invite sent", inviteLink: `${process.env.NEXTAUTH_URL}/invite/${token}` };
    } catch (error: any) {
        if (error.code === 'P2002') {
            return { error: "User already invited" };
        }
        return { error: "Failed to invite member" };
    }
};

export const removeMember = async (workspaceId: string, memberId: string) => {
    const user = await currentUser();
    if (!user || !user.id) return { error: "Unauthorized" };

    const { isAllowed } = await checkPermissions(user.id, workspaceId, [...PERMISSIONS.WORKSPACE.MANAGE_MEMBERS]);
    if (!isAllowed) return { error: "Permission denied" };

    // Prevent removing the last admin (logic simplified for now: can't remove self)
    const memberToRemove = await prisma.workspaceMember.findUnique({
        where: { id: memberId }
    });

    if (memberToRemove?.userId === user.id) {
        return { error: "You cannot remove yourself" };
    }

    try {
        await prisma.workspaceMember.delete({
            where: { id: memberId }
        });

        revalidatePath(`/${workspaceId}/settings`);
        return { success: "Member removed" };
    } catch {
        return { error: "Failed to remove member" };
    }
};
