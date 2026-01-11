"use client";

import { usePDF } from "@react-pdf/renderer";
import { Button } from "@/components/ui/button";
import { Download, Loader2, Eye } from "lucide-react";
import { ExpenseReceiptPDF } from "./expense-receipt-pdf";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

interface ExpenseReceiptButtonProps {
    expense: {
        id: string;
        title: string;
        category: string;
        amount: number;
        date: Date;
    };
    workspace: {
        name: string;
        address?: string | null;
        logo?: string | null;
        currency?: string;
    };
}

export const ExpenseReceiptButton = ({ expense, workspace }: ExpenseReceiptButtonProps) => {
    const [instance, update] = usePDF({ document: <ExpenseReceiptPDF expense={expense} workspace={workspace} /> });

    if (instance.loading) {
        return (
            <Button variant="ghost" size="icon" disabled>
                <Loader2 className="h-4 w-4 animate-spin" />
            </Button>
        );
    }

    if (instance.error) {
        return (
            <Button variant="ghost" size="icon" disabled title="Error generating PDF">
                <Download className="h-4 w-4 text-red-500" />
            </Button>
        );
    }

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl h-[90vh] flex flex-col p-6">
                <div className="flex flex-row items-center justify-between pb-4 border-b pr-8">
                    <DialogTitle>Receipt Preview</DialogTitle>
                    <Button asChild size="sm">
                        <a href={instance.url!} download={`receipt-${expense.id}.pdf`}>
                            <Download className="mr-2 h-4 w-4" /> Download PDF
                        </a>
                    </Button>
                </div>
                <div className="flex-1 w-full bg-zinc-100 rounded-md overflow-hidden flex items-center justify-center">
                    {instance.url && (
                        <iframe src={instance.url} className="w-full h-full border-none" />
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};
