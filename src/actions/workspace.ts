"use server";

import * as z from "zod";
import prisma from "@/lib/db";
import { UpdateWorkspaceSchema } from "@/schemas/workspace";
import { currentUser } from "@/lib/auth";
import { checkPermissions, PERMISSIONS } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export const getWorkspaces = async (userId: string) => {
    try {
        const workspaces = await prisma.workspace.findMany({
            where: {
                members: {
                    some: {
                        userId
                    }
                }
            },
            include: {
                _count: {
                    select: {
                        members: true,
                        projects: true
                    }
                }
            },
            orderBy: {
                updatedAt: "desc"
            }
        });

        return workspaces;
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const updateWorkspace = async (
    workspaceId: string,
    values: z.infer<typeof UpdateWorkspaceSchema>
) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    const { isAllowed } = await checkPermissions(user.id, workspaceId, [...PERMISSIONS.WORKSPACE.UPDATE]);
    if (!isAllowed) return { error: "Permission denied" };

    const validatedFields = UpdateWorkspaceSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Invalid fields" };

    const { name, description, address, currency, themeColor } = validatedFields.data;

    try {
        await prisma.workspace.update({
            where: { id: workspaceId },
            data: {
                name,
                description,
                address,
                currency,
                themeColor,
            }
        });

        revalidatePath(`/${workspaceId}`);
        revalidatePath(`/${workspaceId}/settings`);
        revalidatePath(`/workspaces`);
        return { success: "Workspace updated successfully" };
    } catch (error) {
        console.error("[UPDATE_WORKSPACE_ERROR]", error);
        return { error: "Failed to update workspace" };
    }
};

export const updateWorkspaceLogo = async (
    workspaceId: string,
    logoPath: string | null
) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    const { isAllowed } = await checkPermissions(user.id, workspaceId, [...PERMISSIONS.WORKSPACE.UPDATE]);
    if (!isAllowed) return { error: "Permission denied" };

    try {
        await prisma.workspace.update({
            where: { id: workspaceId },
            data: { logo: logoPath }
        });

        revalidatePath(`/${workspaceId}`);
        revalidatePath(`/${workspaceId}/settings`);
        revalidatePath(`/workspaces`);
        
        return { success: "Logo updated successfully", logoPath };
    } catch (error) {
        console.error("[UPDATE_LOGO_ERROR]", error);
        return { error: "Failed to update logo" };
    }
};

export const getWorkspaceById = async (workspaceId: string) => {
    try {
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            select: {
                id: true,
                name: true,
                description: true,
                logo: true,
                address: true,
                currency: true,
                themeColor: true,
                _count: {
                    select: {
                        members: true,
                        projects: true,
                        invoices: true
                    }
                }
            }
        });

        return workspace;
    } catch (error) {
        console.error(error);
        return null;
    }
};

export const deleteWorkspace = async (workspaceId: string) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { ownerId: true }
    });

    if (!workspace) return { error: "Workspace not found" };
    if (workspace.ownerId !== user.id) return { error: "Only the workspace owner can delete it" };

    try {
        await prisma.workspace.delete({
            where: { id: workspaceId }
        });

        revalidatePath("/workspaces");
        return { success: "Workspace deleted successfully" };
    } catch (error) {
        console.error(error);
        return { error: "Failed to delete workspace" };
    }
};

