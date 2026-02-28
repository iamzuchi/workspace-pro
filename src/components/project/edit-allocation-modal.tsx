"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { updateInventoryAllocation } from "@/actions/inventory";
import { toast } from "sonner";

const EditAllocationSchema = z.object({
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
});

interface EditAllocationModalProps {
    workspaceId: string;
    projectId: string;
    allocation: {
        id: string;
        itemId: string;
        quantity: number;
        item: {
            name: string;
        }
    } | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const EditAllocationModal = ({
    workspaceId,
    projectId,
    allocation,
    open,
    onOpenChange,
}: EditAllocationModalProps) => {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const form = useForm<z.infer<typeof EditAllocationSchema>>({
        resolver: zodResolver(EditAllocationSchema) as any,
        defaultValues: {
            quantity: allocation?.quantity || 1,
        },
    });

    // Update form when allocation changes
    import("react").then((React) => {
        React.useEffect(() => {
            if (allocation) {
                form.reset({
                    quantity: allocation.quantity
                });
            }
        }, [allocation, form]);
    });

    const onSubmit = (values: z.infer<typeof EditAllocationSchema>) => {
        if (!allocation) return;

        startTransition(() => {
            updateInventoryAllocation(workspaceId, allocation.id, {
                quantity: values.quantity
            }).then((data) => {
                if (data?.error) {
                    toast.error(data.error);
                }
                if (data?.success) {
                    toast.success("Allocation updated successfully");
                    form.reset();
                    onOpenChange(false);
                    router.refresh();
                }
            });
        });
    };

    if (!allocation) return null;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Edit Allocation: {allocation.item.name}</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Quantity</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            type="number"
                                            placeholder="Enter quantity"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end gap-2 pt-4">
                            <Button
                                disabled={isPending}
                                variant="outline"
                                type="button"
                                onClick={() => onOpenChange(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                disabled={isPending}
                                type="submit"
                            >
                                Save Changes
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
