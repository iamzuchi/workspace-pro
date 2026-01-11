"use client";

import { useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Bell } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { createReminder } from "@/actions/reminder";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const ReminderSchema = z.object({
    frequency: z.enum(["DAILY", "WEEKLY"]),
});

interface SetReminderModalProps {
    workspaceId: string;
    resourceType: "TASK" | "PROJECT";
    resourceId: string;
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const SetReminderModal = ({
    workspaceId,
    resourceType,
    resourceId,
    open,
    onOpenChange,
}: SetReminderModalProps) => {
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof ReminderSchema>>({
        resolver: zodResolver(ReminderSchema),
        defaultValues: {
            frequency: "DAILY",
        },
    });

    const onSubmit = (values: z.infer<typeof ReminderSchema>) => {
        startTransition(() => {
            createReminder(workspaceId, resourceType, resourceId, values.frequency as "DAILY" | "WEEKLY")
                .then((data) => {
                    if (data.error) toast.error(data.error);
                    if (data.success) {
                        toast.success(data.success);
                        onOpenChange(false);
                    }
                });
        });
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Set Reminder</DialogTitle>
                    <DialogDescription>
                        Receive notifications for this {resourceType.toLowerCase()} periodically until completed.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="frequency"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Frequency</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select frequency" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="DAILY">Daily</SelectItem>
                                            <SelectItem value="WEEKLY">Weekly</SelectItem>
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <Button disabled={isPending} type="submit" className="w-full">
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Set Reminder
                        </Button>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
