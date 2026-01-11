import * as z from "zod";

export const CreatePaymentSchema = z.object({
    invoiceId: z.string().min(1, "Invoice is required"),
    amount: z.coerce.number().min(0.01, "Amount must be positive"),
    date: z.date(),
    method: z.enum(["CASH", "BANK_TRANSFER", "CREDIT_CARD", "OTHER"]),
    reference: z.string().optional(),
});
