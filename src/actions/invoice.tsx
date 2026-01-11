"use server";

import * as z from "zod";
import prisma from "@/lib/db";
import { CreateInvoiceSchema } from "@/schemas/invoice";
import { currentUser } from "@/lib/auth";
import { checkPermissions, PERMISSIONS } from "@/lib/permissions";
import { logActivity } from "./activities";
import { revalidatePath } from "next/cache";
import { InvoiceStatus } from "@prisma/client";
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoicePDF } from '@/components/invoice/invoice-pdf';
import React from "react";

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
            where: { id: invoiceId, workspaceId }
        });

        if (!existingInvoice) return { error: "Invoice not found" };

        const invoice = await prisma.invoice.update({
            where: { id: invoiceId, workspaceId },
            data: {
                status,
                paidAt: status === "PAID" ? new Date() : null
            }
        });

        if (status === "PAID") {
            // Create a payment record
            await prisma.payment.create({
                data: {
                    workspaceId,
                    invoiceId: invoice.id,
                    amount: invoice.totalAmount,
                    date: new Date(),
                    type: "INCOMING", // Assuming INCOMING for invoice payments. If enum is strictly OUTGOING/INCOMING
                    method: "Manual",
                    projectId: existingInvoice.projectId,
                    contractorId: existingInvoice.contractorId,
                    teamId: existingInvoice.teamId,
                    reference: `Payment for ${invoice.number}`
                }
            });
        } else {
            // If moving away from PAID, remove associated payments (simple logic)
            await prisma.payment.deleteMany({
                where: { invoiceId: invoice.id }
            });
        }

        await logActivity(workspaceId, invoice.projectId || null, "UPDATED_INVOICE_STATUS", `Invoice #${invoice.number} status changed to ${status}`, invoice.id);

        revalidatePath(`/${workspaceId}/finance`);
        revalidatePath(`/${workspaceId}/invoices/${invoiceId}`);
        revalidatePath(`/${workspaceId}`); // Update dashboard

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
