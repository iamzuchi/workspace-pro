"use server";

import prisma from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activities";

export const addProjectMember = async (workspaceId: string, projectId: string, userId: string, role: string = "MEMBER") => {
    const user = await currentUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const member = await prisma.projectMember.create({
            data: {
                projectId,
                userId,
                role,
            },
            include: {
                user: true
            }
        });

        await logActivity(workspaceId, projectId, "ADDED_MEMBER", `User ${member.user.name} added to project.`);

        if (userId !== user.id) {
            await prisma.notification.create({
                data: {
                    userId,
                    title: "Added to Project",
                    message: `You have been added to the project members.`,
                    type: "INFO",
                    link: `/${workspaceId}/projects/${projectId}`,
                }
            });
        }

        revalidatePath(`/${workspaceId}/projects/${projectId}`);
        return { success: "Member added", member };
    } catch {
        return { error: "Failed to add member" };
    }
};

export const removeProjectMember = async (workspaceId: string, projectId: string, userId: string) => {
    const user = await currentUser();
    if (!user) return { error: "Unauthorized" };

    try {
        await prisma.projectMember.delete({
            where: {
                projectId_userId: {
                    projectId,
                    userId,
                }
            }
        });

        revalidatePath(`/${workspaceId}/projects/${projectId}`);
        return { success: "Member removed" };
    } catch {
        return { error: "Failed to remove member" };
    }
};

export const getProjectMembers = async (projectId: string) => {
    return await prisma.projectMember.findMany({
        where: { projectId },
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
};

export const getContractors = async (workspaceId: string) => {
    return await prisma.contractor.findMany({
        where: { workspaceId }
    });
};
