"use server";

import { currentUser } from "@/lib/auth";
import prisma from "@/lib/db";

export const getNotifications = async () => {
    const user = await currentUser();

    if (!user) {
        return [];
    }

    const notifications = await prisma.notification.findMany({
        where: {
            userId: user.id,
        },
        orderBy: {
            createdAt: "desc",
        },
        take: 10,
    });

    return notifications;
};

export const markNotificationAsRead = async (id: string) => {
    const user = await currentUser();

    if (!user) {
        return { error: "Unauthorized" };
    }

    await prisma.notification.update({
        where: {
            id,
            userId: user.id,
        },
        data: {
            read: true,
        },
    });

    return { success: "Notification marked as read" };
};
