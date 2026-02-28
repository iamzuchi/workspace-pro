"use server";
import * as z from "zod";
import prisma from "@/lib/db";
import { AllocateInventorySchema, CreateInventoryItemSchema } from "@/schemas/inventory";
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
            data: {
                name: validatedFields.data.name,
                sku: validatedFields.data.sku || null,
                category: validatedFields.data.category || null,
                quantity: validatedFields.data.quantity,
                unitCost: validatedFields.data.unitCost,
                lowStockThreshold: validatedFields.data.lowStockThreshold ?? undefined,
                image: validatedFields.data.image || null,
            }
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
    values: z.infer<typeof AllocateInventorySchema>
) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    const validatedFields = AllocateInventorySchema.safeParse(values);
    if (!validatedFields.success) return { error: "Invalid fields" };

    const { projectId, quantity, recipient, notes } = validatedFields.data;

    try {
        const item = await prisma.inventoryItem.findUnique({
            where: { id: itemId, workspaceId }
        });

        if (!item) return { error: "Item not found" };
        if (Number(item.quantity) < quantity) return { error: "Insufficient stock" };

        await prisma.$transaction([
            prisma.inventoryAllocation.create({
                data: {
                    itemId,
                    projectId: projectId || null,
                    recipient: recipient || null,
                    notes: notes || null,
                    quantity
                } as any
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

        if (projectId) {
            revalidatePath(`/${workspaceId}/projects/${projectId}`);
        }
        revalidatePath(`/${workspaceId}/inventory`);
        revalidatePath(`/${workspaceId}/finance?tab=inventory`);
        return { success: "Item usage recorded" };
    } catch (error) {
        console.error(error);
        return { error: "Failed to record inventory usage" };
    }
}

export const updateInventoryAllocation = async (
    workspaceId: string,
    allocationId: string,
    values: { quantity: number }
) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    if (values.quantity < 1) return { error: "Quantity must be at least 1" };

    try {
        const allocation = await prisma.inventoryAllocation.findUnique({
            where: { id: allocationId },
            include: { item: true }
        });

        if (!allocation) return { error: "Allocation not found" };

        const quantityDiff = values.quantity - allocation.quantity;

        // Check if increasing allocation and if sufficient stock
        if (quantityDiff > 0 && Number(allocation.item.quantity) < quantityDiff) {
            return { error: "Insufficient stock available for increase" };
        }

        await prisma.$transaction([
            prisma.inventoryAllocation.update({
                where: { id: allocationId },
                data: { quantity: values.quantity }
            }),
            prisma.inventoryItem.update({
                where: { id: allocation.itemId },
                data: {
                    quantity: {
                        decrement: quantityDiff
                    }
                }
            })
        ]);

        if (allocation.projectId) {
            revalidatePath(`/${workspaceId}/projects/${allocation.projectId}`);
        }
        revalidatePath(`/${workspaceId}/inventory`);
        return { success: "Allocation updated successfully" };
    } catch (error) {
        console.error(error);
        return { error: "Failed to update allocation" };
    }
}
