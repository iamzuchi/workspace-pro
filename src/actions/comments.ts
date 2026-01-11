"use server";

import prisma from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { logActivity } from "./activities";

export async function createComment(projectId: string, content: string) {
    const user = await currentUser();
    if (!user || !user.id) {
        throw new Error("Unauthorized");
    }

    if (!content.trim()) {
        throw new Error("Content is required");
    }

    const comment = await prisma.comment.create({
        data: {
            content,
            projectId,
            userId: user.id,
        },
    });

    await logActivity(user.id, projectId, "COMMENTED", "Added a new comment");

    revalidatePath(`/${process.env.NEXT_PUBLIC_URL_PREFIX}/${projectId}`); // Note: path might need adjustment based on route structure, using generic revalidate for now or better yet, just return
    return comment;
}

export async function getComments(projectId: string) {
    const user = await currentUser();
    if (!user) {
        throw new Error("Unauthorized");
    }

    const comments = await prisma.comment.findMany({
        where: {
            projectId,
        },
        include: {
            user: {
                select: {
                    name: true,
                    image: true,
                },
            },
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return comments;
}
