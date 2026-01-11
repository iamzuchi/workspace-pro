"use server";
import * as z from "zod";
import prisma from "@/lib/db";
import { CreatePaymentSchema } from "@/schemas/payment";
import { currentUser } from "@/lib/auth";

export const createPayment = async (
    workspaceId: string,
    values: z.infer<typeof CreatePaymentSchema>
) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    const member = await prisma.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId,
                userId: user.id
            }
        }
    });

    if (!member) return { error: "Unauthorized" };

    const validatedFields = CreatePaymentSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Invalid fields" };

    const { invoiceId, amount, date, method, reference } = validatedFields.data;

    try {
        const payment = await prisma.payment.create({
            data: {
                amount,
                date,
                method,
                reference,
                invoiceId,
                workspaceId
            }
        });

        // Update Invoice status check
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId },
            include: { payments: true }
        });

        if (invoice) {
            const totalPaid = invoice.payments.reduce((acc, p) => acc + Number(p.amount), 0) + amount;
            if (totalPaid >= Number(invoice.totalAmount)) {
                await prisma.invoice.update({
                    where: { id: invoiceId },
                    data: { status: "PAID" }
                });
            } else if (totalPaid > 0 && invoice.status === "DRAFT") {
                await prisma.invoice.update({
                    where: { id: invoiceId },
                    data: { status: "SENT" } // Or PARTIAL
                });
            }
        }

        return { success: "Payment recorded", paymentId: payment.id };
    } catch {
        return { error: "Failed to record payment" };
    }
}
