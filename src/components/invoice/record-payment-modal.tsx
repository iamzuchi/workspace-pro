"use client";

import { useState, useTransition } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { recordPayment } from "@/actions/invoice";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { format } from "date-fns";

interface RecordPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    workspaceId: string;
    invoiceId: string;
    invoiceNumber: string;
    remainingAmount: number;
    currency: string;
}

export const RecordPaymentModal = ({
    isOpen,
    onClose,
    workspaceId,
    invoiceId,
    invoiceNumber,
    remainingAmount,
    currency
}: RecordPaymentModalProps) => {
    const [amount, setAmount] = useState(remainingAmount);
    const [method, setMethod] = useState("Bank Transfer");
    const [reference, setReference] = useState("");
    const [date, setDate] = useState(format(new Date(), "yyyy-MM-dd"));

    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const onSubmit = () => {
        if (amount <= 0) {
            toast.error("Amount must be greater than 0");
            return;
        }

        startTransition(() => {
            recordPayment(workspaceId, invoiceId, {
                amount,
                method,
                reference,
                date: new Date(date)
            }).then((data) => {
                if (data.success) {
                    toast.success("Payment recorded successfully");
                    router.refresh();
                    onClose();
                } else if (data.error) {
                    toast.error(data.error);
                }
            });
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Record Payment for {invoiceNumber}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Amount ({currency})</Label>
                        <Input
                            type="number"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            placeholder="0.00"
                            disabled={isPending}
                        />
                        <p className="text-[10px] text-muted-foreground italic">
                            Remaining balance: {remainingAmount.toFixed(2)} {currency}
                        </p>
                    </div>

                    <div className="space-y-2">
                        <Label>Payment Date</Label>
                        <Input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            disabled={isPending}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Payment Method</Label>
                        <Select value={method} onValueChange={setMethod} disabled={isPending}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select method" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="Bank Transfer">Bank Transfer</SelectItem>
                                <SelectItem value="Cash">Cash</SelectItem>
                                <SelectItem value="Cheque">Cheque</SelectItem>
                                <SelectItem value="Online Payment">Online Payment</SelectItem>
                                <SelectItem value="Other">Other</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Reference (Optional)</Label>
                        <Input
                            value={reference}
                            onChange={(e) => setReference(e.target.value)}
                            placeholder="Transaction ID, Receipt #"
                            disabled={isPending}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
                    <Button onClick={onSubmit} disabled={isPending}>Record Payment</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
