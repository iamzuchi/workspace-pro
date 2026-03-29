"use server";
import * as z from "zod";
import prisma from "@/lib/db";
import { CreatePaymentSchema } from "@/schemas/payment";
import { currentUser } from "@/lib/auth";
import { checkPermissions, PERMISSIONS } from "@/lib/permissions";
import { revalidatePath } from "next/cache";

export const createPayment = async (
    workspaceId: string,
    values: z.infer<typeof CreatePaymentSchema>
) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    const { isAllowed } = await checkPermissions(user.id, workspaceId, [...PERMISSIONS.INVOICES.UPDATE]);
    if (!isAllowed) return { error: "Permission denied" };

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
                workspaceId,
                type: "INCOMING" // Assuming payments recorded manually are incoming
            }
        });

        if (invoiceId) {
            // Update Invoice status check
            const invoice = await prisma.invoice.findUnique({
                where: { id: invoiceId },
                include: { payments: true }
            });

            if (invoice) {
                const totalPaid = invoice.payments.reduce((acc, p) => acc + Number(p.amount), 0);
                let newStatus = invoice.status;

                if (totalPaid >= Number(invoice.totalAmount)) {
                    newStatus = "PAID";
                } else if (totalPaid > 0) {
                    newStatus = "PARTIALLY_PAID" as any;
                }

                await prisma.invoice.update({
                    where: { id: invoiceId },
                    data: { 
                        status: newStatus,
                        paidAt: newStatus === "PAID" ? new Date() : invoice.paidAt
                    }
                });
            }
        }

        revalidatePath(`/${workspaceId}/finance`);
        if (invoiceId) revalidatePath(`/${workspaceId}/invoices/${invoiceId}`);

        return { success: "Payment recorded", paymentId: payment.id };
    } catch (error) {
        console.error(error);
        return { error: "Failed to record payment" };
    }
}

export const deletePayment = async (workspaceId: string, paymentId: string) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    const { isAllowed } = await checkPermissions(user.id, workspaceId, [...PERMISSIONS.INVOICES.UPDATE]);
    if (!isAllowed) return { error: "Permission denied" };

    try {
        const payment = await prisma.payment.findUnique({
            where: { id: paymentId, workspaceId },
        });

        if (!payment) return { error: "Payment not found" };

        await prisma.payment.delete({
            where: { id: paymentId }
        });

        if (payment.invoiceId) {
            const invoice = await prisma.invoice.findUnique({
                where: { id: payment.invoiceId },
                include: { payments: true }
            });

            if (invoice) {
                const totalPaid = invoice.payments.reduce((acc, p) => acc + Number(p.amount), 0);
                let newStatus = "SENT"; // Default back to SENT if not paid

                if (totalPaid >= Number(invoice.totalAmount)) {
                    newStatus = "PAID";
                } else if (totalPaid > 0) {
                    newStatus = "PARTIALLY_PAID" as any;
                } else if (totalPaid === 0) {
                    newStatus = "SENT"; 
                }

                await prisma.invoice.update({
                    where: { id: payment.invoiceId },
                    data: { 
                        status: newStatus as any,
                        paidAt: newStatus === "PAID" ? invoice.paidAt : null
                    }
                });
            }
        }

        revalidatePath(`/${workspaceId}/finance`);
        if (payment.invoiceId) revalidatePath(`/${workspaceId}/invoices/${payment.invoiceId}`);

        return { success: "Payment deleted successfully" };
    } catch (error) {
        console.error(error);
        return { error: "Failed to delete payment" };
    }
}
