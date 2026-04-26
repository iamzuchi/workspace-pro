"use server";
import * as z from "zod";
import prisma from "@/lib/db";
import { WorkSiteSchema } from "@/schemas/worksite";
import { currentUser } from "@/lib/auth";
import { checkPermissions, PERMISSIONS } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

export const createWorkSite = async (
    workspaceId: string,
    values: z.infer<typeof WorkSiteSchema>
) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    const { isAllowed } = await checkPermissions(user.id, workspaceId, [...PERMISSIONS.INVENTORY.CREATE]);
    if (!isAllowed) return { error: "Permission denied" };

    const validatedFields = WorkSiteSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Invalid fields" };

    try {
        await prisma.workSite.create({
            data: {
                ...validatedFields.data,
                workspaceId
            }
        });
        revalidatePath(`/${workspaceId}/inventory`);
        return { success: "Work site created" };
    } catch {
        return { error: "Failed to create work site" };
    }
}

export const updateWorkSite = async (
    workspaceId: string,
    workSiteId: string,
    values: z.infer<typeof WorkSiteSchema>
) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    const validatedFields = WorkSiteSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Invalid fields" };

    try {
        await prisma.workSite.update({
            where: { id: workSiteId, workspaceId },
            data: {
                name: validatedFields.data.name,
            }
        });
        revalidatePath(`/${workspaceId}/inventory`);
        return { success: "Work site updated" };
    } catch {
        return { error: "Failed to update work site" };
    }
}

export const deleteWorkSite = async (
    workspaceId: string,
    workSiteId: string
) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    try {
        await prisma.workSite.delete({
            where: { id: workSiteId, workspaceId }
        });
        revalidatePath(`/${workspaceId}/inventory`);
        return { success: "Work site deleted" };
    } catch {
        return { error: "Failed to delete work site" };
    }
}
