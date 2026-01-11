"use server";
import * as z from "zod";
import prisma from "@/lib/db";
import { CreateInventoryItemSchema } from "@/schemas/inventory";
import { currentUser } from "@/lib/auth";
import { checkPermissions, PERMISSIONS } from "@/lib/permissions";
import { logActivity } from "./activities";
import { revalidatePath } from "next/cache";

export const createInventoryItem = async (
    workspaceId: string,
    values: z.infer<typeof CreateInventoryItemSchema>
) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    const { isAllowed } = await checkPermissions(user.id, workspaceId, [...PERMISSIONS.INVENTORY.CREATE]);
    if (!isAllowed) return { error: "Permission denied" };

    const validatedFields = CreateInventoryItemSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Invalid fields" };

    try {
        const item = await prisma.inventoryItem.create({
            data: {
                ...validatedFields.data,
                workspaceId
            }
        });
        return { success: "Item created", itemId: item.id };
    } catch {
        return { error: "Failed to create item" };
    }
}

export const updateInventoryItem = async (
    workspaceId: string,
    itemId: string,
    values: z.infer<typeof CreateInventoryItemSchema>
) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    const validatedFields = CreateInventoryItemSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Invalid fields" };

    try {
        await prisma.inventoryItem.update({
            where: { id: itemId, workspaceId },
            data: { ...validatedFields.data }
        });
        return { success: "Item updated" };
    } catch {
        return { error: "Failed to update item" };
    }
}

export const deleteInventoryItem = async (
    workspaceId: string,
    itemId: string
) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    try {
        await prisma.inventoryItem.delete({
            where: { id: itemId, workspaceId }
        });
        return { success: "Item deleted" };
    } catch {
        return { error: "Failed to delete item" };
    }
}

export const allocateInventoryItem = async (
    workspaceId: string,
    itemId: string,
    projectId: string,
    quantity: number
) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    try {
        const item = await prisma.inventoryItem.findUnique({
            where: { id: itemId, workspaceId }
        });

        if (!item) return { error: "Item not found" };
        if (item.quantity < quantity) return { error: "Insufficient stock" };

        await prisma.$transaction([
            prisma.inventoryAllocation.create({
                data: {
                    itemId,
                    projectId,
                    quantity
                }
            }),
            prisma.inventoryItem.update({
                where: { id: itemId },
                data: {
                    quantity: {
                        decrement: quantity
                    }
                }
            })
        ]);

        revalidatePath(`/${workspaceId}/projects/${projectId}`);
        revalidatePath(`/${workspaceId}/finance?tab=inventory`);
        return { success: "Item allocated" };
    } catch {
        return { error: "Failed to allocate item" };
    }
}

