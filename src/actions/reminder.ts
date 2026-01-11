"use server";

import prisma from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const createReminder = async (
    workspaceId: string,
    resourceType: "TASK" | "PROJECT",
    resourceId: string,
    frequency: "DAILY" | "WEEKLY"
) => {
    const user = await currentUser();
    if (!user) return { error: "Unauthorized" };

    try {
        await prisma.reminder.create({
            data: {
                taskId: resourceType === "TASK" ? resourceId : undefined,
                projectId: resourceType === "PROJECT" ? resourceId : undefined,
                frequency,
                lastSentAt: new Date(), // Set to now so it doesn't fire immediately, or maybe null to fire immediately? Let's say null.
            }
        });

        revalidatePath(`/${workspaceId}`);
        return { success: "Reminder set successfully" };
    } catch (error) {
        console.error("Failed to create reminder:", error);
        return { error: "Failed to create reminder" };
    }
};

export const checkReminders = async () => {
    try {
        const reminders = await prisma.reminder.findMany({
            include: {
                task: true,
                project: {
                    include: {
                        workspace: true
                    }
                },
            }
        });

        const now = new Date();
        let sentCount = 0;

        for (const reminder of reminders) {
            // Check if resource is still active (incomplete)
            const isTaskComplete = reminder.task?.status === "COMPLETED";
            // For projects, maybe check status too?
            const isProjectComplete = reminder.project?.status === "COMPLETED";

            if (isTaskComplete || isProjectComplete) continue;

            // Check frequency
            const lastSent = reminder.lastSentAt ? new Date(reminder.lastSentAt) : new Date(0);
            const diffHours = (now.getTime() - lastSent.getTime()) / (1000 * 60 * 60);

            let shouldSend = false;
            if (reminder.frequency === "DAILY" && diffHours >= 24) shouldSend = true;
            if (reminder.frequency === "WEEKLY" && diffHours >= 168) shouldSend = true;

            if (shouldSend) {
                // Send Notification
                const userId = reminder.task?.assignedUserId || reminder.project?.workspace?.ownerId; // Fallback?

                // For Tasks, notify assignee
                if (reminder.taskId && reminder.task?.assignedUserId) {
                    await prisma.notification.create({
                        data: {
                            userId: reminder.task.assignedUserId,
                            title: "Task Reminder",
                            message: `Reminder: Task "${reminder.task.title}" is still ${reminder.task.status}.`,
                            type: "WARNING",
                            link: `/${reminder.task.workspaceId}/projects/${reminder.task.projectId}?taskId=${reminder.taskId}`,
                        }
                    });
                }

                // Update lastSentAt
                await prisma.reminder.update({
                    where: { id: reminder.id },
                    data: { lastSentAt: now }
                });
                sentCount++;
            }
        }
        return { success: true, sentCount };
    } catch (error) {
        console.error("Failed to check reminders:", error);
        return { error: "Failed to process reminders" };
    }
};
