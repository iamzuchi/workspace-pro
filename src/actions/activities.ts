"use server";

import prisma from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const postComment = async (workspaceId: string, projectId: string, content: string) => {
    const user = await currentUser();
    if (!user || !user.id) return { error: "Unauthorized" };

    try {
        const comment = await prisma.comment.create({
            data: {
                content,
                projectId,
                userId: user.id,
            }
        });

        // Log activity
        await logActivity(workspaceId, projectId, "COMMENTED", `User commented on project.`);

        revalidatePath(`/${workspaceId}/projects/${projectId}`);
        return { success: "Comment posted", comment };
    } catch {
        return { error: "Failed to post comment" };
    }
};

export const getComments = async (projectId: string) => {
    return await prisma.comment.findMany({
        where: { projectId },
        include: {
            user: {
                select: {
                    name: true,
                    image: true,
                }
            }
        },
        orderBy: { createdAt: "desc" },
    });
};

export const logActivity = async (
    workspaceId: string,
    projectId: string | null,
    action: string,
    details?: string,
    invoiceId?: string
) => {
    const user = await currentUser();
    if (!user || !user.id) return;

    await prisma.activity.create({
        data: {
            projectId,
            invoiceId,
            userId: user.id,
            action,
            details,
        }
    });
};

export const getActivities = async (projectId: string) => {
    return await prisma.activity.findMany({
        where: { projectId },
        include: {
            user: {
                select: {
                    name: true,
                    image: true,
                }
            }
        },
        orderBy: { createdAt: "desc" },
        take: 20,
    });
};
