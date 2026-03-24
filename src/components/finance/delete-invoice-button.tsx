"use client";

import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { useTransition } from "react";
import { deleteInvoice } from "@/actions/invoice";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

interface DeleteInvoiceButtonProps {
    workspaceId: string;
    invoiceId: string;
}

export const DeleteInvoiceButton = ({ workspaceId, invoiceId }: DeleteInvoiceButtonProps) => {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const handleDelete = () => {
        if (!confirm("Are you sure you want to delete this invoice?")) return;
        startTransition(() => {
            deleteInvoice(workspaceId, invoiceId).then((data) => {
                if (data.success) {
                    toast.success(data.success);
                    router.refresh();
                } else if (data.error) {
                    toast.error(data.error);
                }
            });
        });
    };

    return (
        <Button variant="ghost" size="sm" onClick={handleDelete} disabled={isPending} className="text-zinc-400 hover:text-rose-600 hover:bg-rose-50 px-2">
            <Trash2 className="h-4 w-4" />
        </Button>
    );
};
