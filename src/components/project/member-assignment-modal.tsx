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
import { UserPlus, Plus, Trash2, Package } from "lucide-react";
import { assignToMember } from "@/actions/inventory";
import { toast } from "sonner";
import { AssignToMemberSchema } from "@/schemas/inventory";

interface MemberAssignmentModalProps {
    workspaceId: string;
    projectId: string;
    projectStock: any[];
    teamMembers: any[];
}

export const MemberAssignmentModal = ({
    workspaceId,
    projectId,
    projectStock,
    teamMembers,
}: MemberAssignmentModalProps) => {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    const form = useForm<z.infer<typeof AssignToMemberSchema>>({
        resolver: zodResolver(AssignToMemberSchema) as any,
        defaultValues: {
            projectId: projectId,
            teamMemberId: "",
            items: [{ projectInventoryId: "", quantity: 1 }],
            notes: "",
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const onSubmit = (values: z.infer<typeof AssignToMemberSchema>) => {
        // Validation check for empty selections
        if (values.items.some(item => !item.projectInventoryId)) {
            toast.error("Please select an item from stock for all rows.");
            return;
        }

        startTransition(() => {
            assignToMember(workspaceId, values).then((data) => {
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
                <Button size="sm" variant="outline">
                    <UserPlus className="mr-2 h-4 w-4" />
                    Assign to Team Member
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[550px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Assign Material to Member</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                            control={form.control}
                            name="teamMemberId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Team Member (Responsible)</FormLabel>
                                    <Select
                                        disabled={isPending}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select team member" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {teamMembers.map((member) => (
                                                <SelectItem key={member.id} value={member.id}>
                                                    {member.name} ({member.occupation || "Member"})
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <FormLabel>Items to Assign</FormLabel>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => append({ projectInventoryId: "", quantity: 1 })}
                                    disabled={isPending}
                                >
                                    <Plus className="mr-2 h-4 w-4" />
                                    Add Item
                                </Button>
                            </div>

                            {fields.map((field, index) => (
                                <div key={field.id} className="flex items-start gap-2 bg-zinc-50 p-3 rounded-md border">
                                    <div className="grid grid-cols-3 gap-2 flex-1">
                                        <FormField
                                            control={form.control}
                                            name={`items.${index}.projectInventoryId`}
                                            render={({ field }) => (
                                                <FormItem className="col-span-2">
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
                                                            {projectStock.map((stock) => (
                                                                <SelectItem key={stock.id} value={stock.id}>
                                                                    <div className="flex items-center gap-2">
                                                                        <Package className="h-3 w-3 text-zinc-400" />
                                                                        <span>{stock.item.name}</span>
                                                                        <span className="text-zinc-500 text-xs">({stock.quantity} in stock)</span>
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
                                                <FormItem className="col-span-1">
                                                    <FormControl>
                                                        <Input
                                                            {...field}
                                                            disabled={isPending}
                                                            type="number"
                                                            min={1}
                                                            placeholder="Qty"
                                                        />
                                                    </FormControl>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 text-zinc-500 hover:text-destructive shrink-0"
                                        onClick={() => remove(index)}
                                        disabled={isPending || fields.length === 1}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            ))}
                            {form.formState.errors.items?.root && (
                                <p className="text-sm font-medium text-destructive mt-1">
                                    {form.formState.errors.items.root.message}
                                </p>
                            )}
                        </div>

                        <div className="flex justify-end gap-2 pt-4 border-t">
                            <Button variant="outline" type="button" onClick={() => setOpen(false)} disabled={isPending}>Cancel</Button>
                            <Button disabled={isPending} type="submit">Assign to Member</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
