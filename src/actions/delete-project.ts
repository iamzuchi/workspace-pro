"use server";

import prisma from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { checkPermissions, PERMISSIONS } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

export const deleteProject = async (
    workspaceId: string,
    projectId: string
) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    const { isAllowed } = await checkPermissions(user.id, workspaceId, [...PERMISSIONS.PROJECTS.DELETE]);
    if (!isAllowed) return { error: "Permission denied" };

    try {
        await prisma.project.delete({
            where: {
                id: projectId,
                workspaceId,
            },
        });

        revalidatePath(`/${workspaceId}/projects`);
        return { success: "Project deleted" };
    } catch {
        return { error: "Failed to delete project" };
    }
};
