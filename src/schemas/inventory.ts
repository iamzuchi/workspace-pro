import * as z from "zod";

export const CreateInventoryItemSchema = z.object({
    name: z.string().min(1, "Name is required"),
    sku: z.string().optional(),
    category: z.string().optional(),
    quantity: z.coerce.number().min(0, "Quantity must be positive"),
    unitCost: z.coerce.number().min(0, "Cost must be positive"),
    lowStockThreshold: z.coerce.number().min(0).optional(),
    image: z.string().optional(),
    workSiteId: z.string().optional(),
});
export const AllocateToProjectSchema = z.object({
    projectId: z.string().min(1, "Project is required"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    notes: z.string().optional(),
});

export const AssignToMemberSchema = z.object({
    teamMemberId: z.string().min(1, "Team member is required"),
    projectId: z.string().min(1, "Project is required"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    notes: z.string().optional(),
});

export const RecordTaskUsageSchema = z.object({
    taskId: z.string().min(1, "Task is required"),
    teamMemberInventoryId: z.string().min(1, "Source inventory is required"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    notes: z.string().optional(),
});
