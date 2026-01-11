"use server";

import prisma from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { TaskStatus, TaskPriority } from "@prisma/client";
import { logActivity } from "./activities";

export const createTask = async (
    workspaceId: string,
    projectId: string,
    values: {
        title: string;
        description?: string;
        status?: TaskStatus;
        priority?: TaskPriority;
        dueDate?: Date;
        startDate?: Date;
        assignedUserId?: string;
    }
) => {
    const user = await currentUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const task = await prisma.task.create({
            data: {
                ...values,
                workspaceId,
                projectId,
            }
        });

        // Log activity
        await logActivity(workspaceId, projectId, "CREATED_TASK", `Task "${values.title}" created.`);

        // Create notification for assigned user if applicable
        if (values.assignedUserId && values.assignedUserId !== user.id) {
            await prisma.notification.create({
                data: {
                    userId: values.assignedUserId,
                    title: "New Task Assigned",
                    message: `You have been assigned to task: ${values.title}`,
                    type: "INFO",
                    link: `/${workspaceId}/projects/${projectId}`,
                }
            });
        }

        revalidatePath(`/${workspaceId}/projects/${projectId}`);
        return { success: "Task created", task };
    } catch (error) {
        console.error(error);
        return { error: "Failed to create task" };
    }
};

export const updateTask = async (
    workspaceId: string,
    projectId: string,
    taskId: string,
    values: Partial<{
        title: string;
        description: string;
        status: TaskStatus;
        priority: TaskPriority;
        dueDate: Date;
        startDate: Date;
        assignedUserId: string;
        completedAt: Date;
    }>
) => {
    const user = await currentUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const existingTask = await prisma.task.findUnique({ where: { id: taskId } });
        if (!existingTask) return { error: "Task not found" };

        // Check Permissions
        const member = await prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId: user.id!
                }
            }
        });

        const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });

        const isOwner = workspace?.ownerId === user.id;
        const isAdmin = member?.role === "ADMIN";
        const isManager = member?.role === "PROJECT_MANAGER";
        const isAssignee = existingTask.assignedUserId === user.id;

        if (!isOwner && !isAdmin && !isManager && !isAssignee) {
            return { error: "You do not have permission to edit this task" };
        }

        const task = await prisma.task.update({
            where: { id: taskId },
            data: values,
        });

        // Log activity if status changed
        if (values.status && values.status !== existingTask.status) {
            await logActivity(workspaceId, projectId, "UPDATED_TASK_STATUS", `Task "${task.title}" status changed to ${values.status}.`);
        }

        // Notify if newly assigned
        if (values.assignedUserId && values.assignedUserId !== existingTask.assignedUserId && values.assignedUserId !== user.id) {
            await prisma.notification.create({
                data: {
                    userId: values.assignedUserId,
                    title: "Task Assigned",
                    message: `You have been assigned to task: ${task.title}`,
                    type: "INFO",
                    link: `/${workspaceId}/projects/${projectId}`,
                }
            });
        }

        revalidatePath(`/${workspaceId}/projects/${projectId}`);
        return { success: "Task updated", task };
    } catch (error) {
        console.error(error);
        return { error: "Failed to update task" };
    }
};

export const deleteTask = async (workspaceId: string, projectId: string, taskId: string) => {
    const user = await currentUser();
    if (!user) return { error: "Unauthorized" };

    try {
        // Check Permissions
        const member = await prisma.workspaceMember.findUnique({
            where: {
                workspaceId_userId: {
                    workspaceId,
                    userId: user.id!
                }
            }
        });

        const workspace = await prisma.workspace.findUnique({ where: { id: workspaceId } });

        const isOwner = workspace?.ownerId === user.id;
        const isAdmin = member?.role === "ADMIN";
        const isManager = member?.role === "PROJECT_MANAGER";

        if (!isOwner && !isAdmin && !isManager) {
            return { error: "You do not have permission to delete this task" };
        }

        await prisma.task.delete({
            where: { id: taskId }
        });

        revalidatePath(`/${workspaceId}/projects/${projectId}`);
        return { success: "Task deleted" };
    } catch {
        return { error: "Failed to delete task" };
    }
};

export const getProjectTasks = async (projectId: string) => {
    console.log("DEBUG: Accessing prisma.task...");
    return await prisma.task.findMany({
        where: { projectId },
        include: {
            assignedUser: {
                select: {
                    name: true,
                    image: true,
                    email: true,
                }
            }
        },
        orderBy: { createdAt: "desc" },
    });
};
