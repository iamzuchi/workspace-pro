"use client";

import { useRef, useState } from "react";
import { InvoicePreview } from "@/components/invoice/invoice-preview";
import { InvoiceClientPrimaryActions, InvoiceClientSecondaryActions } from "@/components/invoice/invoice-client-actions";
import { Button } from "@/components/ui/button";
import { ChevronLeft, CreditCard, Trash2 } from "lucide-react";
import Link from "next/link";
import { useReactToPrint } from "react-to-print";
import { RecordPaymentModal } from "@/components/invoice/record-payment-modal";

interface InvoiceDetailsContainerProps {
    workspace: any;
    invoice: any;
    workspaceId: string;
    isAdmin: boolean;
}

export const InvoiceDetailsContainer = ({ workspace, invoice, workspaceId, isAdmin }: InvoiceDetailsContainerProps) => {
    const [isRecordPaymentOpen, setIsRecordPaymentOpen] = useState(false);
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Invoice-${invoice.id}`,
    });

    const totalPaid = (invoice.payments || []).reduce((acc: number, p: any) => acc + Number(p.amount), 0);
    const remainingAmount = Math.max(0, Number(invoice.totalAmount) - totalPaid);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <RecordPaymentModal
                isOpen={isRecordPaymentOpen}
                onClose={() => setIsRecordPaymentOpen(false)}
                workspaceId={workspaceId}
                invoiceId={invoice.id}
                invoiceNumber={invoice.number}
                remainingAmount={remainingAmount}
                currency={invoice.currency}
            />
            <div className="flex flex-col gap-4">
                {invoice.deletionRequested && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-amber-100 flex items-center justify-center text-amber-600">
                                <Trash2 className="h-4 w-4" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-amber-900">Deletion Requested</p>
                                <p className="text-xs text-amber-700">
                                    {invoice.deletionRequestedBy?.name || "A user"} has requested this invoice be deleted.
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" asChild>
                            <Link href={`/${workspaceId}/finance?tab=invoices`}>
                                <ChevronLeft className="h-5 w-5" />
                            </Link>
                        </Button>
                        <h2 className="text-3xl font-bold tracking-tight">Invoice Details</h2>
                    </div>
                    <div className="flex items-center gap-2">
                        <InvoiceClientPrimaryActions
                            workspaceId={workspaceId}
                            invoiceId={invoice.id}
                            isAdmin={isAdmin}
                            deletionRequested={invoice.deletionRequested}
                        />
                    </div>
                </div>
                <div className="flex items-center justify-start sm:justify-end gap-2 flex-wrap">
                    {invoice.status !== "PAID" && (
                        <Button
                            variant="outline"
                            className="bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                            onClick={() => setIsRecordPaymentOpen(true)}
                        >
                            <CreditCard className="mr-2 h-4 w-4" />
                            Record Payment
                        </Button>
                    )}
                    <InvoiceClientSecondaryActions
                        workspaceId={workspaceId}
                        invoiceId={invoice.id}
                        onPrint={handlePrint}
                    />
                </div>
            </div>

            <div className="pb-20" ref={printRef}>
                <InvoicePreview workspace={workspace} invoice={invoice} />
            </div>
        </div>
    );
};
