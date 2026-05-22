"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateExpenseSchema } from "@/schemas/expense";
import {
    Dialog,
    DialogContent,
    DialogDescription,
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useEffect, useTransition } from "react";
import { updateExpense } from "@/actions/expense";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { Loader2, CalendarIcon, Users, User } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

const EXPENSE_CATEGORIES = [
    "Office Supplies",
    "Equipment",
    "Software Subscription",
    "Travel",
    "Salaries",
    "Marketing",
    "Utilities",
    "Rent",
    "Maintenance",
    "Other",
];

interface EditExpenseModalProps {
    expense: any | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    workspaceId: string;
    projects?: any[];
    teams?: any[];
    members?: any[];
}

export const EditExpenseModal = ({
    expense,
    open,
    onOpenChange,
    workspaceId,
    projects = [],
    teams = [],
    members = [],
}: EditExpenseModalProps) => {
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const form = useForm<any>({
        resolver: zodResolver(CreateExpenseSchema),
        defaultValues: {
            title: "",
            category: "",
            amount: 0,
            date: new Date(),
            projectId: "none",
            teamId: "none",
            teamMemberId: "none",
            status: "PAID",
        },
    });

    useEffect(() => {
        if (expense && open) {
            form.reset({
                title: expense.title || "",
                category: expense.category || "",
                amount: Number(expense.amount) || 0,
                date: expense.date ? new Date(expense.date) : new Date(),
                projectId: expense.projectId || "none",
                teamId: expense.teamId || "none",
                teamMemberId: expense.teamMemberId || "none",
                status: expense.status || "PAID",
            });
        }
    }, [expense, open, form]);

    const onSubmit = (values: z.infer<typeof CreateExpenseSchema>) => {
        if (!expense) return;

        // Handle "none" values
        const submissionValues = {
            ...values,
            teamId: values.teamId === "none" ? undefined : values.teamId,
            teamMemberId: values.teamMemberId === "none" ? undefined : values.teamMemberId,
            projectId: values.projectId === "none" ? undefined : values.projectId,
        };

        startTransition(() => {
            updateExpense(workspaceId, expense.id, submissionValues).then((data) => {
                if (data.success) {
                    toast.success(data.success);
                    onOpenChange(false);
                    router.refresh();
                } else {
                    toast.error(data.error);
                }
            });
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>Edit Expense</DialogTitle>
                    <DialogDescription>
                        Update the expense details.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Input disabled={isPending} placeholder="e.g. Office Chairs" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="amount"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Amount</FormLabel>
                                        <FormControl>
                                            <Input
                                                disabled={isPending}
                                                type="number"
                                                step="0.01"
                                                placeholder="0.00"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {EXPENSE_CATEGORIES.map((category) => (
                                                    <SelectItem key={category} value={category}>
                                                        {category}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="date"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col">
                                        <FormLabel>Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date > new Date() || date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="PAID">Paid</SelectItem>
                                                <SelectItem value="PENDING">Pending</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="projectId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assign to Project</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Optional" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                {projects.map((project) => (
                                                    <SelectItem key={project.id} value={project.id}>
                                                        {project.name}
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
                                name="teamId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assign to Team</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <div className="flex items-center">
                                                        <Users className="mr-2 h-4 w-4 opacity-50" />
                                                        <SelectValue placeholder="Optional" />
                                                    </div>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                {teams.map((team) => (
                                                    <SelectItem key={team.id} value={team.id}>
                                                        {team.name}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="teamMemberId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Assign to Member</FormLabel>
                                        <Select onValueChange={field.onChange} value={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <div className="flex items-center">
                                                        <User className="mr-2 h-4 w-4 opacity-50" />
                                                        <SelectValue placeholder="Optional" />
                                                    </div>
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                {members.map((member) => (
                                                    <SelectItem key={member.id} value={member.id}>
                                                        {member.name || "Unknown"}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <Button type="submit" className="w-full bg-emerald-600 hover:bg-emerald-700 text-lg h-12" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                            Update Expense
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
