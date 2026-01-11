import * as z from "zod";

export const CreateInventoryItemSchema = z.object({
    name: z.string().min(1, "Name is required"),
    sku: z.string().optional(),
    category: z.string().optional(),
    quantity: z.coerce.number().min(0, "Quantity must be positive"),
    unitCost: z.coerce.number().min(0, "Cost must be positive"),
    lowStockThreshold: z.coerce.number().min(0).optional(),
    image: z.string().optional(),
});
