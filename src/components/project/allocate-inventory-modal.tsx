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
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle } from "lucide-react";
import { allocateInventoryItem } from "@/actions/inventory";
import { toast } from "sonner";

const AllocateSchema = z.object({
    itemId: z.string().min(1, "Item is required"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
});

interface AllocateInventoryModalProps {
    workspaceId: string;
    projectId: string;
    items: {
        id: string;
        name: string;
        quantity: number;
    }[];
}

export const AllocateInventoryModal = ({
    workspaceId,
    projectId,
    items,
}: AllocateInventoryModalProps) => {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const form = useForm<z.infer<typeof AllocateSchema>>({
        resolver: zodResolver(AllocateSchema) as any,
        defaultValues: {
            itemId: items[0]?.id || "", // Set default to first item's ID or empty string if no items
            quantity: 1,
        },
    });

    const onSubmit = (values: z.infer<typeof AllocateSchema>) => {
        startTransition(() => {
            allocateInventoryItem(workspaceId, values.itemId, projectId, values.quantity)
                .then((data) => {
                    if (data?.error) {
                        toast.error(data.error);
                    }
                    if (data?.success) {
                        toast.success("Item allocated successfully");
                        form.reset();
                        router.refresh();
                    }
                });
        });
    };

    return (
        <Dialog>
            <DialogTrigger asChild>
                <Button size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Allocate Item
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Allocate Inventory</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="itemId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Item</FormLabel>
                                    <Select
                                        disabled={isPending}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select an item" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {items.map((item) => (
                                                <SelectItem key={item.id} value={item.id} className="py-3">
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className="font-semibold text-sm">{item.name}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            Available: {item.quantity} units
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
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
                                type="submit"
                            >
                                Allocate
                            </Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
