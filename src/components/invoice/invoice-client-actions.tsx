import { useTransition } from "react";
import { Button } from "@/components/ui/button";
import { downloadInvoice, updateInvoiceStatus } from "@/actions/invoice";
import { Download, Loader2, Pencil, Printer, Send, CheckCircle } from "lucide-react";
import { sendInvoiceEmail } from "@/actions/invoice-email";
import { InvoiceStatus } from "@prisma/client";
import { toast } from "sonner";
import Link from "next/link";

interface InvoiceClientActionsProps {
    workspaceId: string;
    invoiceId: string;
    onPrint: () => void;
}

export const InvoiceClientActions = ({ workspaceId, invoiceId, onPrint }: InvoiceClientActionsProps) => {
    const [isPending, startTransition] = useTransition();

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

    return (
        <div className="flex items-center gap-2">
            <Button variant="outline" onClick={onDownloadPDF} disabled={isPending}>
                {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Download className="mr-2 h-4 w-4" />
                )}
                PDF
            </Button>
            <Button variant="outline" onClick={onPrint}>
                <Printer className="mr-2 h-4 w-4" /> Print
            </Button>
            <Button variant="outline" onClick={() => onUpdateStatus(InvoiceStatus.SENT)}>
                <Send className="mr-2 h-4 w-4" /> Mark as Sent
            </Button>
            <Button variant="outline" onClick={() => onUpdateStatus(InvoiceStatus.PAID)}>
                <CheckCircle className="mr-2 h-4 w-4 text-green-600" /> Mark as Paid
            </Button>
            <Button variant="outline" asChild>
                <Link href={`/${workspaceId}/invoices/${invoiceId}/edit`}>
                    <Pencil className="mr-2 h-4 w-4" /> Edit
                </Link>
            </Button>
            <Button onClick={onSend} disabled={isPending}>
                {isPending ? (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                    <Send className="mr-2 h-4 w-4" />
                )}
                Email Invoice
            </Button>
        </div>
    );
};


