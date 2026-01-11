"use server";

import prisma from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const saveDocument = async (workspaceId: string, data: { name: string; url: string; fileType?: string; size?: number; projectId?: string }) => {
    const user = await currentUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const document = await prisma.document.create({
            data: {
                workspaceId,
                name: data.name,
                url: data.url,
                fileType: data.fileType,
                size: data.size,
                projectId: data.projectId,
            }
        });

        revalidatePath(`/${workspaceId}/documents`);
        return { success: "Document saved", document };
    } catch {
        return { error: "Failed to save document" };
    }
};

export const getDocuments = async (workspaceId: string, projectId?: string) => {
    const user = await currentUser();
    if (!user) return [];

    const documents = await prisma.document.findMany({
        where: {
            workspaceId,
            projectId: projectId || undefined,
        },
        orderBy: {
            createdAt: "desc",
        },
    });

    return documents;
};

export const deleteDocument = async (workspaceId: string, documentId: string) => {
    const user = await currentUser();
    if (!user) return { error: "Unauthorized" };

    try {
        await prisma.document.delete({
            where: {
                id: documentId,
                workspaceId,
            }
        });

        revalidatePath(`/${workspaceId}/documents`);
        return { success: "Document deleted" };
    } catch {
        return { error: "Failed to delete document" };
    }
};
