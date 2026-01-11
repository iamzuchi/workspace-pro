"use server";

import prisma from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { checkPermissions, PERMISSIONS } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

export const assignTeamToProject = async (workspaceId: string, projectId: string, teamId: string) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    const { isAllowed } = await checkPermissions(user.id, workspaceId, [...PERMISSIONS.PROJECTS.UPDATE]);
    if (!isAllowed) return { error: "Permission denied" };

    try {
        await prisma.team.update({
            where: { id: teamId, workspaceId },
            data: { projectId }
        });

        revalidatePath(`/${workspaceId}/projects/${projectId}`);
        return { success: "Team assigned to project" };
    } catch {
        return { error: "Failed to assign team" };
    }
};

export const unassignTeamFromProject = async (workspaceId: string, projectId: string, teamId: string) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    const { isAllowed } = await checkPermissions(user.id, workspaceId, [...PERMISSIONS.PROJECTS.UPDATE]);
    if (!isAllowed) return { error: "Permission denied" };

    try {
        await prisma.team.update({
            where: { id: teamId, workspaceId },
            data: { projectId: null }
        });

        revalidatePath(`/${workspaceId}/projects/${projectId}`);
        return { success: "Team removed from project" };
    } catch {
        return { error: "Failed to remove team" };
    }
};
