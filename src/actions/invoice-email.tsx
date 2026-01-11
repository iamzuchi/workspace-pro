"use server";

import React from 'react';
import { Resend } from 'resend';
import { renderToBuffer } from '@react-pdf/renderer';
import { InvoicePDF } from '@/components/invoice/invoice-pdf';
import { InvoiceEmailTemplate } from '@/components/emails/invoice-email-template';
import prisma from "@/lib/db";
import { currentUser } from "@/lib/auth";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendInvoiceEmail(invoiceId: string, email: string) {
    const user = await currentUser();
    if (!user) {
        return { error: "Unauthorized" };
    }

    const invoice = await prisma.invoice.findUnique({
        where: { id: invoiceId },
        include: {
            contractor: true,
            project: true,
            workspace: true,
            items: true,
        },
    });

    if (!invoice) {
        return { error: "Invoice not found" };
    }

    // Generate PDF Buffer
    const pdfBuffer = await renderToBuffer(<InvoicePDF invoice={invoice} />);

    // Format amount
    const totalAmount = Number(invoice.totalAmount) + Number(invoice.taxAmount);
    const amountString = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(totalAmount);

    try {
        const { data, error } = await resend.emails.send({
            from: 'WorkspacePro <onboarding@resend.dev>', // Update with your verificed sender
            to: email,
            subject: `Invoice ${invoice.number} from WorkspacePro`,
            react: InvoiceEmailTemplate({ invoiceNumber: invoice.number, amount: amountString }) as React.ReactElement,
            attachments: [
                {
                    filename: `Invoice-${invoice.number}.pdf`,
                    content: pdfBuffer,
                },
            ],
        });

        if (error) {
            console.error("Resend error:", error);
            return { error: "Failed to send email" };
        }

        // Update invoice status to SENT if it was DRAFT
        if (invoice.status === 'DRAFT') {
            await prisma.invoice.update({
                where: { id: invoiceId },
                data: { status: 'SENT', sentAt: new Date() }
            });
        }

        return { success: true, data };
    } catch (error) {
        console.error("Email sending failed:", error);
        return { error: "Failed to send email" };
    }
}
