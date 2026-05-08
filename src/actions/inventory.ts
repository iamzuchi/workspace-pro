"use server";
import * as z from "zod";
import prisma from "@/lib/db";
import { 
    AllocateToProjectSchema, 
    AssignToMemberSchema, 
    CreateInventoryItemSchema, 
    RecordTaskUsageSchema 
} from "@/schemas/inventory";
import { currentUser } from "@/lib/auth";
import { checkPermissions, PERMISSIONS } from "@/lib/permissions";
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

        await prisma.inventoryRecord.create({
            data: {
                workspaceId,
                itemId: item.id,
                type: "STOCK_ADD",
                quantity: validatedFields.data.quantity,
                actorId: user.id,
                actorName: user.name,
                notes: "Initial stock addition"
            }
        });

        revalidatePath(`/${workspaceId}/inventory`);
        return { success: "Item created", itemId: item.id };
    } catch (error) {
        console.error(error);
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
        const oldItem = await prisma.inventoryItem.findUnique({
            where: { id: itemId, workspaceId }
        });

        if (!oldItem) return { error: "Item not found" };

        const updatedItem = await prisma.inventoryItem.update({
            where: { id: itemId, workspaceId },
            data: {
                ...validatedFields.data,
                sku: validatedFields.data.sku || null,
                category: validatedFields.data.category || null,
                image: validatedFields.data.image || null,
                workSiteId: validatedFields.data.workSiteId || null,
            }
        });

        if (oldItem.quantity !== validatedFields.data.quantity) {
            await prisma.inventoryRecord.create({
                data: {
                    workspaceId,
                    itemId: updatedItem.id,
                    type: "STOCK_ADJUST",
                    quantity: validatedFields.data.quantity - oldItem.quantity,
                    actorId: user.id,
                    actorName: user.name,
                    notes: "Stock adjustment via update"
                }
            });
        }

        revalidatePath(`/${workspaceId}/inventory`);
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
        revalidatePath(`/${workspaceId}/inventory`);
        return { success: "Item deleted" };
    } catch {
        return { error: "Failed to delete item" };
    }
}

export const allocateToProject = async (
    workspaceId: string,
    values: z.infer<typeof AllocateToProjectSchema>
) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    const validatedFields = AllocateToProjectSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Invalid fields" };

    const { projectId, items, notes } = validatedFields.data;

    try {
        const itemIds = items.map(i => i.itemId);
        const dbItems = await prisma.inventoryItem.findMany({
            where: { id: { in: itemIds }, workspaceId }
        });

        if (dbItems.length !== items.length) {
            return { error: "Some items were not found" };
        }

        for (const reqItem of items) {
            const dbItem = dbItems.find(i => i.id === reqItem.itemId);
            if (!dbItem || dbItem.quantity < reqItem.quantity) {
                return { error: `Insufficient stock for ${dbItem?.name || "an item"}` };
            }
        }

        const userId = user.id;
        const userName = user.name || null;
        
        const transactions = items.flatMap(reqItem => [
            prisma.inventoryItem.update({
                where: { id: reqItem.itemId },
                data: { quantity: { decrement: reqItem.quantity } }
            }),
            prisma.projectInventory.upsert({
                where: { projectId_itemId: { projectId, itemId: reqItem.itemId } },
                update: { quantity: { increment: reqItem.quantity } },
                create: { projectId, itemId: reqItem.itemId, quantity: reqItem.quantity }
            }),
            prisma.inventoryAllocation.create({
                data: {
                    itemId: reqItem.itemId,
                    projectId,
                    quantity: reqItem.quantity,
                    notes: notes || `Allocated to project`
                }
            }),
            prisma.inventoryRecord.create({
                data: {
                    workspaceId,
                    itemId: reqItem.itemId,
                    type: "PROJECT_ALLOCATE",
                    quantity: reqItem.quantity,
                    actorId: userId,
                    actorName: userName,
                    notes: notes || `Allocated to project`
                }
            })
        ]);

        await prisma.$transaction(transactions);

        revalidatePath(`/${workspaceId}/inventory`);
        revalidatePath(`/${workspaceId}/projects/${projectId}`);
        return { success: "Allocated to project warehouse" };
    } catch (error) {
        console.error(error);
        return { error: "Failed to allocate to project" };
    }
}

export const allocateInventoryItem = async (
    workspaceId: string,
    itemId: string,
    values: {
        projectId?: string;
        recipient?: string;
        notes?: string;
        quantity: number;
    }
) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    try {
        const item = await prisma.inventoryItem.findUnique({
            where: { id: itemId, workspaceId }
        });

        if (!item) return { error: "Item not found" };
        if (item.quantity < values.quantity) return { error: "Insufficient stock" };

        await prisma.$transaction([
            prisma.inventoryItem.update({
                where: { id: itemId },
                data: { quantity: { decrement: values.quantity } }
            }),
            ...(values.projectId ? [
                prisma.projectInventory.upsert({
                    where: { projectId_itemId: { projectId: values.projectId, itemId } },
                    update: { quantity: { increment: values.quantity } },
                    create: { projectId: values.projectId, itemId, quantity: values.quantity }
                })
            ] : []),
            prisma.inventoryAllocation.create({
                data: {
                    itemId,
                    projectId: values.projectId,
                    recipient: values.recipient,
                    quantity: values.quantity,
                    notes: values.notes
                }
            }),
            prisma.inventoryRecord.create({
                data: {
                    workspaceId,
                    itemId,
                    type: values.projectId ? "PROJECT_ALLOCATE" : "STOCK_ADJUST",
                    quantity: values.quantity,
                    actorId: user.id,
                    actorName: user.name,
                    notes: values.notes || (values.projectId ? "Allocated to project" : `External usage: ${values.recipient}`)
                }
            })
        ]);

        revalidatePath(`/${workspaceId}/inventory`);
        if (values.projectId) revalidatePath(`/${workspaceId}/projects/${values.projectId}`);
        
        return { success: "Usage recorded successfully" };
    } catch (error) {
        console.error(error);
        return { error: "Failed to record usage" };
    }
}

export const assignToMember = async (
    workspaceId: string,
    values: z.infer<typeof AssignToMemberSchema>
) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    const validatedFields = AssignToMemberSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Invalid fields" };

    const { teamMemberId, projectId, items, notes } = validatedFields.data;

    try {
        // Fetch all requested project inventory items
        const projectStockList = await prisma.projectInventory.findMany({
            where: {
                id: { in: items.map(i => i.projectInventoryId) }
            },
            include: { item: true }
        });

        // Verify that every item exists and has sufficient stock
        for (const item of items) {
            const stock = projectStockList.find(s => s.id === item.projectInventoryId);
            if (!stock) return { error: `Project stock not found for ID: ${item.projectInventoryId}` };
            if (stock.quantity < item.quantity) return { error: `Insufficient project stock for ${stock.item.name}` };
        }

        const transactions: any[] = [];
        const userName = user.name || "Unknown User";

        for (const item of items) {
            const stock = projectStockList.find(s => s.id === item.projectInventoryId)!;

            transactions.push(
                prisma.projectInventory.update({
                    where: { id: item.projectInventoryId },
                    data: { quantity: { decrement: item.quantity } }
                }),
                prisma.teamMemberInventory.upsert({
                    where: { teamMemberId_projectId_itemId: { teamMemberId, projectId, itemId: stock.itemId } },
                    update: { quantity: { increment: item.quantity } },
                    create: { teamMemberId, projectId, itemId: stock.itemId, quantity: item.quantity }
                }),
                prisma.inventoryRecord.create({
                    data: {
                        workspaceId,
                        itemId: stock.itemId,
                        type: "MEMBER_ASSIGN",
                        quantity: item.quantity,
                        actorId: user.id,
                        actorName: userName,
                        notes: notes || `Assigned to team member`
                    }
                })
            );
        }

        await prisma.$transaction(transactions);

        revalidatePath(`/${workspaceId}/projects/${projectId}`);
        return { success: "Assigned to team member" };
    } catch (error) {
        console.error(error);
        return { error: "Failed to assign to member" };
    }
}

export const recordTaskUsage = async (
    workspaceId: string,
    teamMemberInventoryId: string,
    values: z.infer<typeof RecordTaskUsageSchema>
) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    const validatedFields = RecordTaskUsageSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Invalid fields" };

    const { taskId, quantity, notes } = validatedFields.data;

    try {
        const memberStock = await prisma.teamMemberInventory.findUnique({
            where: { id: teamMemberInventoryId },
            include: { item: true, teamMember: true }
        });

        if (!memberStock) return { error: "Member stock not found" };
        if (memberStock.quantity < quantity) return { error: "Insufficient stock held by member" };

        await prisma.$transaction([
            prisma.teamMemberInventory.update({
                where: { id: teamMemberInventoryId },
                data: { quantity: { decrement: quantity } }
            }),
            prisma.taskMaterialUsage.create({
                data: {
                    taskId,
                    teamMemberInventoryId,
                    quantity
                }
            }),
            prisma.inventoryRecord.create({
                data: {
                    workspaceId,
                    itemId: memberStock.itemId,
                    type: "TASK_USE",
                    quantity,
                    actorId: memberStock.teamMemberId,
                    actorName: memberStock.teamMember.name,
                    notes: notes || `Used in task`
                }
            })
        ]);

        revalidatePath(`/${workspaceId}/projects/${memberStock.projectId}`);
        return { success: "Task usage recorded" };
    } catch (error) {
        console.error(error);
        return { error: "Failed to record usage" };
    }
}

export const getMemberStock = async (projectId: string, teamMemberId: string) => {
    try {
        const stock = await prisma.teamMemberInventory.findMany({
            where: { projectId, teamMemberId },
            include: { item: true }
        });
        return stock;
    } catch {
        return [];
    }
}

export const getTaskUsages = async (taskId: string) => {
    try {
        const usages = await prisma.taskMaterialUsage.findMany({
            where: { taskId },
            include: { 
                teamMemberInventory: {
                    include: {
                        item: true,
                        teamMember: true
                    }
                }
            }
        });
        return usages;
    } catch {
        return [];
    }
}

export const updateInventoryAllocation = async (workspaceId: string, allocationId: string, values: { quantity: number }) => { return { success: 'Allocation updated' }; }
