"use client";

import * as z from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTransition, useState } from "react";
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
import { PlusCircle, Trash2 } from "lucide-react";
import { allocateToProject } from "@/actions/inventory";
import { toast } from "sonner";
import { AllocateToProjectSchema } from "@/schemas/inventory";

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
    const [open, setOpen] = useState(false);

    const form = useForm<z.infer<typeof AllocateToProjectSchema>>({
        resolver: zodResolver(AllocateToProjectSchema) as any,
        defaultValues: {
            projectId: projectId,
            items: [{ itemId: "", quantity: 1 }],
            notes: "",
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const onSubmit = (values: z.infer<typeof AllocateToProjectSchema>) => {
        if (!values.items || values.items.length === 0) {
            toast.error("Please add at least one item to allocate");
            return;
        }

        if (values.items.some(item => !item.itemId)) {
            toast.error("Please select an item for all rows");
            return;
        }

        startTransition(() => {
            allocateToProject(workspaceId, values).then((data) => {
                if (data?.error) {
                    toast.error(data.error);
                }
                if (data?.success) {
                    toast.success(data.success);
                    form.reset();
                    setOpen(false);
                    router.refresh();
                }
            });
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button size="sm">
                    <PlusCircle className="mr-2 h-4 w-4" />
                    Allocate to Project Warehouse
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Allocate to Project Warehouse</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="space-y-4">
                            {fields.map((field, index) => (
                                <div key={field.id} className="flex gap-4 items-start">
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.itemId`}
                                        render={({ field }) => (
                                            <FormItem className="flex-1">
                                                <FormLabel className={index !== 0 ? "sr-only" : ""}>Item</FormLabel>
                                                <Select
                                                    disabled={isPending}
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select item" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {items.map((item) => (
                                                            <SelectItem key={item.id} value={item.id} className="py-3">
                                                                <div className="flex flex-col items-start gap-1">
                                                                    <span className="font-semibold text-sm">{item.name}</span>
                                                                    <span className="text-xs text-muted-foreground">
                                                                        Stock: {item.quantity}
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
                                        name={`items.${index}.quantity`}
                                        render={({ field }) => (
                                            <FormItem className="w-24">
                                                <FormLabel className={index !== 0 ? "sr-only" : ""}>Qty</FormLabel>
                                                <FormControl>
                                                    <Input
                                                        {...field}
                                                        disabled={isPending}
                                                        type="number"
                                                        placeholder="Qty"
                                                        min={1}
                                                    />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <div className={index !== 0 ? "" : "pt-8"}>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            className="text-destructive"
                                            onClick={() => remove(index)}
                                            disabled={isPending || fields.length === 1}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                            onClick={() => append({ itemId: "", quantity: 1 })}
                            disabled={isPending}
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Add Item
                        </Button>

                         <FormField
                            control={form.control}
                            name="notes"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Notes</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            placeholder="e.g. For Phase 1 foundations"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending} type="button">Cancel</Button>
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
