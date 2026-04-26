"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
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
import { UserPlus } from "lucide-react";
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
            quantity: 1,
            notes: "",
        },
    });

    const onSubmit = (values: z.infer<typeof AssignToMemberSchema>) => {
        const projectInventoryId = form.getValues("projectInventoryId" as any);
        if (!projectInventoryId) {
            toast.error("Please select an item from stock");
            return;
        }

        startTransition(() => {
            assignToMember(workspaceId, projectInventoryId, values).then((data) => {
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
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Assign Material to Member</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name={"projectInventoryId" as any}
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Item from Project stock</FormLabel>
                                    <Select
                                        disabled={isPending}
                                        onValueChange={field.onChange}
                                        defaultValue={field.value}
                                    >
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select stock item" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            {projectStock.map((stock) => (
                                                <SelectItem key={stock.id} value={stock.id} className="py-3">
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className="font-semibold text-sm">{stock.item.name}</span>
                                                        <span className="text-xs text-muted-foreground">
                                                            Project Stock: {stock.quantity} units
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
                        <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Quantity to Assign</FormLabel>
                                    <FormControl>
                                        <Input
                                            {...field}
                                            disabled={isPending}
                                            type="number"
                                        />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex justify-end gap-2 pt-4">
                            <Button variant="outline" onClick={() => setOpen(false)} disabled={isPending}>Cancel</Button>
                            <Button disabled={isPending} type="submit">Assign</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
