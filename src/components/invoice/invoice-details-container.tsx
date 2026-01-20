"use client";

import { useRef } from "react";
import { InvoicePreview } from "@/components/invoice/invoice-preview";
import { InvoiceClientActions } from "@/components/invoice/invoice-client-actions";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";
import Link from "next/link";
import { useReactToPrint } from "react-to-print";

interface InvoiceDetailsContainerProps {
    workspace: any;
    invoice: any;
    workspaceId: string;
}

export const InvoiceDetailsContainer = ({ workspace, invoice, workspaceId }: InvoiceDetailsContainerProps) => {
    const printRef = useRef<HTMLDivElement>(null);

    const handlePrint = useReactToPrint({
        contentRef: printRef,
        documentTitle: `Invoice-${invoice.id}`,
    });

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <Button variant="ghost" size="icon" asChild>
                        <Link href={`/${workspaceId}/finance?tab=invoices`}>
                            <ChevronLeft className="h-5 w-5" />
                        </Link>
                    </Button>
                    <h2 className="text-3xl font-bold tracking-tight">Invoice Details</h2>
                </div>
                <InvoiceClientActions
                    workspaceId={workspaceId}
                    invoiceId={invoice.id}
                    onPrint={handlePrint}
                />
            </div>

            <div className="pb-20" ref={printRef}>
                <InvoicePreview workspace={workspace} invoice={invoice} />
            </div>
        </div>
    );
};
