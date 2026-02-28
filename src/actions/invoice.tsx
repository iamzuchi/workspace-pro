"use server";

import * as z from "zod";
import prisma from "@/lib/db";
import { CreateInvoiceSchema, RecordPaymentSchema } from "@/schemas/invoice";
import { currentUser } from "@/lib/auth";
import { checkPermissions, PERMISSIONS } from "@/lib/permissions";
import { logActivity } from "./activities";
import { revalidatePath } from "next/cache";
import { InvoiceStatus } from "@prisma/client";
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoicePDF } from '@/components/invoice/invoice-pdf';
import React from "react";
import { Role } from "@prisma/client";

export const deleteInvoice = async (workspaceId: string, invoiceId: string) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    const member = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: user.id } }
    });

    if (member?.role !== Role.ADMIN) return { error: "Permission denied" };

    try {
        await prisma.invoice.delete({
            where: { id: invoiceId, workspaceId }
        });

        await logActivity(workspaceId, null, "DELETED_INVOICE", `Invoice ${invoiceId} deleted`);

        revalidatePath(`/${workspaceId}/finance`);
        return { success: "Invoice deleted" };
    } catch (error) {
        console.error(error);
        return { error: "Failed to delete invoice" };
    }
}

export const denyInvoiceDeletion = async (workspaceId: string, invoiceId: string) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    const member = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: user.id } }
    });

    if (member?.role !== Role.ADMIN) return { error: "Permission denied" };

    try {
        const invoice = await (prisma.invoice as any).update({
            where: { id: invoiceId, workspaceId },
            data: {
                deletionRequested: false,
                deletionRequestedById: null
            }
        });

        await logActivity(workspaceId, null, "DENIED_INVOICE_DELETION", `Deletion request for invoice ${invoice.number} denied`, invoiceId);

        revalidatePath(`/${workspaceId}/finance`);
        revalidatePath(`/${workspaceId}/invoices/${invoiceId}`);
        return { success: "Deletion request denied" };
    } catch (error) {
        console.error(error);
        return { error: "Failed to deny deletion request" };
    }
}

export const requestInvoiceDeletion = async (workspaceId: string, invoiceId: string) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    try {
        const invoice = await (prisma.invoice as any).update({
            where: { id: invoiceId, workspaceId },
            data: {
                deletionRequested: true,
                deletionRequestedById: user.id
            }
        });

        if (!invoice) return { error: "Invoice not found" };

        const admins = await prisma.workspaceMember.findMany({
            where: {
                workspaceId,
                role: Role.ADMIN
            },
            include: { user: true }
        });

        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId }
        });

        // Collect distinct admin user IDs (plus the owner if not strictly in the members list as admin)
        const NotificationRecipients = new Set(admins.map(m => m.userId));
        if (workspace?.ownerId) {
            NotificationRecipients.add(workspace.ownerId);
        }

        const notificationsList = Array.from(NotificationRecipients).map(adminId => ({
            userId: adminId,
            title: "Invoice Deletion Request",
            message: `User ${user.name || 'Unknown'} requested deletion of invoice ${invoice.number}`,
            link: `/${workspaceId}/invoices/${invoiceId}`,
            type: "WARNING"
        }));

        if (notificationsList.length > 0) {
            await prisma.notification.createMany({
                data: notificationsList
            });
        }

        await logActivity(workspaceId, null, "REQUESTED_INVOICE_DELETION", `User requested deletion of invoice ${invoice.number}`, invoiceId);
        revalidatePath(`/${workspaceId}/invoices/${invoiceId}`);
        return { success: "Deletion request sent to admins" };
    } catch (error) {
        console.error(error);
        return { error: "Failed to request deletion" };
    }
}

export const createInvoice = async (
    workspaceId: string,
    values: z.infer<typeof CreateInvoiceSchema>
) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    const { isAllowed } = await checkPermissions(user.id, workspaceId, [...PERMISSIONS.INVOICES.CREATE]);
    if (!isAllowed) return { error: "Permission denied" };

    const validatedFields = CreateInvoiceSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Invalid fields" };

    const {
        projectId,
        contractorId,
        teamId,
        dueDate,
        items,
        taxRate,
        recipientName,
        recipientEmail,
        notes,
        currency
    } = validatedFields.data;

    const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    try {
        const invoice = await prisma.invoice.create({
            data: {
                workspaceId,
                projectId: projectId || null,
                contractorId: contractorId || null,
                teamId: teamId || null,
                number: `INV-${Date.now()}`, // Simple generator
                dueDate,
                totalAmount,
                taxAmount,
                recipientName,
                recipientEmail,
                notes,
                currency,
                status: "DRAFT",
                items: {
                    create: items.map(item => ({
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        amount: item.quantity * item.unitPrice
                    }))
                }
            }
        });

        await logActivity(workspaceId, projectId || null, "CREATED_INVOICE", `Invoice #${invoice.number} created`, invoice.id);

        revalidatePath(`/${workspaceId}/finance`);
        return { success: "Invoice created", invoiceId: invoice.id };
    } catch (error) {
        console.error(error);
        return { error: "Failed to create invoice" };
    }
}

export const updateInvoice = async (
    workspaceId: string,
    invoiceId: string,
    values: z.infer<typeof CreateInvoiceSchema>
) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    const { isAllowed } = await checkPermissions(user.id, workspaceId, [...PERMISSIONS.INVOICES.UPDATE]);
    if (!isAllowed) return { error: "Permission denied" };

    const validatedFields = CreateInvoiceSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Invalid fields" };

    const {
        projectId,
        contractorId,
        dueDate,
        items,
        taxRate,
        recipientName,
        recipientEmail,
        notes,
        currency
    } = validatedFields.data;

    const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const taxAmount = subtotal * (taxRate / 100);
    const totalAmount = subtotal + taxAmount;

    try {
        const invoice = await prisma.invoice.update({
            where: { id: invoiceId, workspaceId },
            data: {
                projectId: projectId || null,
                contractorId: contractorId || null,
                dueDate,
                totalAmount,
                taxAmount,
                recipientName,
                recipientEmail,
                notes,
                currency,
                items: {
                    deleteMany: {}, // Simple implementation: replace all items
                    create: items.map(item => ({
                        description: item.description,
                        quantity: item.quantity,
                        unitPrice: item.unitPrice,
                        amount: item.quantity * item.unitPrice
                    }))
                }
            }
        });

        await logActivity(workspaceId, projectId || null, "UPDATED_INVOICE", `Invoice #${invoice.number} updated`, invoice.id);

        revalidatePath(`/${workspaceId}/finance`);
        revalidatePath(`/${workspaceId}/invoices/${invoiceId}`);
        return { success: "Invoice updated" };
    } catch (error) {
        console.error(error);
        return { error: "Failed to update invoice" };
    }
}


export const recordPayment = async (
    workspaceId: string,
    invoiceId: string,
    values: z.infer<typeof RecordPaymentSchema>
) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    const { isAllowed } = await checkPermissions(user.id, workspaceId, [...PERMISSIONS.INVOICES.UPDATE]);
    if (!isAllowed) return { error: "Permission denied" };

    const validatedFields = RecordPaymentSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Invalid fields" };

    const { amount, date, method, reference } = validatedFields.data;

    try {
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId, workspaceId },
            include: { payments: true }
        });

        if (!invoice) return { error: "Invoice not found" };

        const totalPaid = invoice.payments.reduce((acc, p) => acc + Number(p.amount), 0) + amount;
        let newStatus: InvoiceStatus = invoice.status;

        if (totalPaid >= Number(invoice.totalAmount)) {
            newStatus = "PAID";
        } else if (totalPaid > 0) {
            newStatus = "PARTIALLY_PAID" as any;
        }

        await prisma.$transaction([
            prisma.payment.create({
                data: {
                    workspaceId,
                    invoiceId,
                    amount,
                    date,
                    method,
                    reference,
                    type: "INCOMING",
                    projectId: invoice.projectId,
                    contractorId: invoice.contractorId,
                    teamId: invoice.teamId,
                }
            }),
            prisma.invoice.update({
                where: { id: invoiceId },
                data: {
                    status: newStatus,
                    paidAt: newStatus === "PAID" ? new Date() : invoice.paidAt
                }
            })
        ]);

        await logActivity(workspaceId, invoice.projectId, "RECORDED_PAYMENT", `Payment of ${amount} recorded for Invoice #${invoice.number}`, invoice.id);

        revalidatePath(`/${workspaceId}/finance`);
        revalidatePath(`/${workspaceId}/invoices/${invoiceId}`);
        return { success: "Payment recorded" };
    } catch (error) {
        console.error(error);
        return { error: "Failed to record payment" };
    }
}

export const updateInvoiceStatus = async (
    workspaceId: string,
    invoiceId: string,
    status: InvoiceStatus
) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    const { isAllowed } = await checkPermissions(user.id, workspaceId, [...PERMISSIONS.INVOICES.UPDATE]);
    if (!isAllowed) return { error: "Permission denied" };

    try {
        const existingInvoice = await prisma.invoice.findUnique({
            where: { id: invoiceId, workspaceId },
            include: { payments: true }
        });

        if (!existingInvoice) return { error: "Invoice not found" };

        const invoice = await prisma.invoice.update({
            where: { id: invoiceId, workspaceId },
            data: {
                status,
                paidAt: status === "PAID" ? new Date() : null
            }
        });

        if (status === "PAID" && existingInvoice.payments.length === 0) {
            // Create a single payment record for the full amount if no payments exist
            await prisma.payment.create({
                data: {
                    workspaceId,
                    invoiceId: invoice.id,
                    amount: invoice.totalAmount,
                    date: new Date(),
                    type: "INCOMING",
                    method: "Manual",
                    projectId: existingInvoice.projectId,
                    contractorId: existingInvoice.contractorId,
                    teamId: existingInvoice.teamId,
                    reference: `Full payment for ${invoice.number}`
                }
            });
        }

        await logActivity(workspaceId, invoice.projectId || null, "UPDATED_INVOICE_STATUS", `Invoice #${invoice.number} status changed to ${status}`, invoice.id);

        revalidatePath(`/${workspaceId}/finance`);
        revalidatePath(`/${workspaceId}/invoices/${invoiceId}`);
        revalidatePath(`/${workspaceId}`);

        return { success: `Invoice marked as ${status.toLowerCase()}` };
    } catch (error) {
        console.error(error);
        return { error: "Failed to update invoice status" };
    }
}

export const downloadInvoice = async (workspaceId: string, invoiceId: string) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    try {
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId, workspaceId },
            include: {
                contractor: true,
                project: true,
                workspace: true,
                items: true,
            },
        });

        if (!invoice) return { error: "Invoice not found" };

        const pdfBuffer = await renderToBuffer(<InvoicePDF invoice={invoice} />);
        const base64 = pdfBuffer.toString('base64');

        return { success: true, data: base64, filename: `Invoice-${invoice.number}.pdf` };
    } catch (error) {
        console.error(error);
        return { error: "Failed to generate PDF" };
    }
}
