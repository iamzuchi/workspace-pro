"use client";

import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { downloadInvoice, updateInvoiceStatus, deleteInvoice, requestInvoiceDeletion } from "@/actions/invoice";
import { Download, Loader2, Pencil, Printer, Send, CheckCircle, Trash2 } from "lucide-react";
import { sendInvoiceEmail } from "@/actions/invoice-email";
import { InvoiceStatus } from "@prisma/client";
import { toast } from "sonner";
import Link from "next/link";
import { useRouter } from "next/navigation";

interface InvoiceActionProps {
    workspaceId: string;
    invoiceId: string;
    isAdmin?: boolean;
    deletionRequested?: boolean;
    onPrint?: () => void;
}

import { denyInvoiceDeletion } from "@/actions/invoice";

const useInvoiceActions = ({ workspaceId, invoiceId, isAdmin }: InvoiceActionProps) => {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const onSend = () => {
        startTransition(() => {
            sendInvoiceEmail(workspaceId, invoiceId).then((data) => {
                if (data.success) {
                    toast.success("Invoice sent successfully!");
                } else if (data.error) {
                    toast.error(`Error: ${data.error}`);
                }
            });
        });
    };

    const onUpdateStatus = (status: InvoiceStatus) => {
        startTransition(() => {
            updateInvoiceStatus(workspaceId, invoiceId, status).then((data) => {
                if (data.success) {
                    toast.success(data.success);
                } else if (data.error) {
                    toast.error(data.error);
                }
            });
        });
    };

    const onDownloadPDF = () => {
        startTransition(() => {
            downloadInvoice(workspaceId, invoiceId).then((data) => {
                if (data?.success && data.data) {
                    const link = document.createElement('a');
                    link.href = `data:application/pdf;base64,${data.data}`;
                    link.download = data.filename || 'invoice.pdf';
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    toast.success("Invoice downloaded successfully");
                } else {
                    toast.error(data?.error || "Failed to download invoice");
                }
            });
        });
    };

    const onDelete = () => {
        startTransition(() => {
            if (isAdmin) {
                deleteInvoice(workspaceId, invoiceId).then((data) => {
                    if (data.success) {
                        toast.success(data.success);
                        router.push(`/${workspaceId}/finance?tab=invoices`);
                    } else if (data.error) {
                        toast.error(data.error);
                    }
                });
            } else {
                requestInvoiceDeletion(workspaceId, invoiceId).then((data) => {
                    if (data.success) {
                        toast.success(data.success);
                    } else if (data.error) {
                        toast.error(data.error);
                    }
                });
            }
        });
    };

    const onDeny = () => {
        startTransition(() => {
            denyInvoiceDeletion(workspaceId, invoiceId).then((data) => {
                if (data.success) {
                    toast.success(data.success);
                } else if (data.error) {
                    toast.error(data.error);
                }
            });
        });
    };

    return { isPending, onSend, onUpdateStatus, onDownloadPDF, onDelete, onDeny };
};

export const InvoiceClientPrimaryActions = ({ workspaceId, invoiceId, isAdmin, deletionRequested }: InvoiceActionProps) => {
    const { isPending, onSend, onDelete, onDeny } = useInvoiceActions({ workspaceId, invoiceId, isAdmin });

    return (
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
            <Button onClick={onSend} disabled={isPending} className="flex-1 sm:flex-none">
                {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Send className="mr-2 h-4 w-4" />
                )}
                Email Invoice
            </Button>

            {isAdmin && deletionRequested ? (
                <>
                    <Button variant="destructive" onClick={onDelete} disabled={isPending} className="flex-1 sm:flex-none">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve Deletion
                    </Button>
                    <Button variant="outline" onClick={onDeny} disabled={isPending} className="flex-1 sm:flex-none">
                        <Trash2 className="mr-2 h-4 w-4" />
                        Deny Request
                    </Button>
                </>
            ) : (
                <Button variant="destructive" onClick={onDelete} disabled={isPending} className="flex-1 sm:flex-none">
                    <Trash2 className="mr-2 h-4 w-4" />
                    {isAdmin ? "Delete Invoice" : (deletionRequested ? "Deletion Requested" : "Request Deletion")}
                </Button>
            )}
        </div>
    );
};

export const InvoiceClientSecondaryActions = ({ workspaceId, invoiceId, isAdmin, onPrint }: InvoiceActionProps) => {
    const { isPending, onDownloadPDF: onDownload, onUpdateStatus } = useInvoiceActions({ workspaceId, invoiceId, isAdmin });

    return (
        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto mt-4 sm:mt-0">
            <Button variant="outline" size="sm" onClick={onDownload} disabled={isPending} className="flex-1 sm:flex-none">
                {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Download className="mr-2 h-4 w-4" />
                )}
                PDF
            </Button>
            <Button variant="outline" size="sm" onClick={onPrint || (() => window.print())} className="flex-1 sm:flex-none">
                <Printer className="mr-2 h-4 w-4" />
                Print
            </Button>
            <Button variant="outline" size="sm" onClick={() => onUpdateStatus(InvoiceStatus.SENT)} disabled={isPending} className="flex-1 sm:flex-none text-[13px]">
                Mark as Sent
            </Button>
            <Button variant="outline" size="sm" onClick={() => onUpdateStatus(InvoiceStatus.PAID)} disabled={isPending} className="flex-1 sm:flex-none text-[13px]">
                Mark as Paid
            </Button>
            <Button variant="outline" size="sm" asChild className="flex-1 sm:flex-none">
                <Link href={`/${workspaceId}/invoices/${invoiceId}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" />
                    Edit
                </Link>
            </Button>
        </div>
    );
};

