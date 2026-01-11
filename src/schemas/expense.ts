import * as z from "zod";

export const CreateExpenseSchema = z.object({
    title: z.string().min(1, "Title is required"),
    category: z.string().min(1, "Category is required"),
    amount: z.coerce.number().positive("Amount must be positive"),
    date: z.date(),
    receiptUrl: z.string().optional(),
});
