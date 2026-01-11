import * as z from "zod";

export const InvoiceItemSchema = z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    unitPrice: z.coerce.number().min(0, "Price must be positive"),
});

export const CreateInvoiceSchema = z.object({
    projectId: z.string().optional(),
    contractorId: z.string().optional(),
    teamId: z.string().optional(),
    customerId: z.string().optional(), // If external
    recipientName: z.string().min(1, "Recipient name is required"),
    recipientEmail: z.string().email("Invalid email address"),
    notes: z.string().optional(),
    dueDate: z.date().optional(),
    items: z.array(InvoiceItemSchema).min(1, "At least one item is required"),
    taxRate: z.coerce.number().min(0).max(100).optional().default(0),
    currency: z.string().default("USD"),
});

