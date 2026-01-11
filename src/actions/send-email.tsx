"use server";

import { Resend } from "resend";
import { InvoiceEmail } from "@/components/emails/invoice-email";
import prisma from "@/lib/db";
import { currentUser } from "@/lib/auth";
import * as React from "react";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendInvoiceEmail = async (workspaceId: string, invoiceId: string) => {
    const user = await currentUser();
    if (!user) return { error: "Unauthorized" };

    try {
        const invoice = await prisma.invoice.findUnique({
            where: { id: invoiceId, workspaceId },
            include: {
                contractor: true,
                workspace: true,
            }
        });

        if (!invoice || !invoice.contractor?.email) {
            return { error: "Invoice or contractor email not found" };
        }

        const { data, error } = await resend.emails.send({
            from: "WorkspacePro <onboarding@resend.dev>",
            to: [invoice.contractor.email],
            subject: `Invoice #${invoice.number} from ${invoice.workspace.name}`,
            react: <InvoiceEmail
                workspaceName={invoice.workspace.name}
                invoiceNumber={invoice.number}
                totalAmount={invoice.totalAmount.toString()}
                viewLink={`${process.env.NEXTAUTH_URL}/${workspaceId}/invoices/${invoiceId}`}
            />,
        });

        if (error) {
            return { error: error.message };
        }

        if (invoice.status === "DRAFT") {
            await prisma.invoice.update({
                where: { id: invoiceId },
                data: { status: "SENT", sentAt: new Date() }
            });
        }

        return { success: "Email sent successfully" };
    } catch (err: any) {
        return { error: err.message || "Failed to send email" };
    }
};
