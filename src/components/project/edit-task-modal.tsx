"use client";

import { useState, useTransition, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { TaskStatus, TaskPriority, Task } from "@prisma/client";
import { format } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";

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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { updateTask } from "@/actions/task";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const TaskSchema = z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().optional(),
    status: z.nativeEnum(TaskStatus),
    priority: z.nativeEnum(TaskPriority),
    dueDate: z.string().optional(),
    assignedUserId: z.string().optional(),
    teamMemberId: z.string().optional(),
    isPaid: z.boolean(),
});

interface EditTaskModalProps {
    workspaceId: string;
    projectId: string;
    task: (Task & {
        comments: any[];
        _count?: {
            comments: number;
        }
    }) | null;
    open: boolean;
    onOpenChange: (open: boolean) => void;
    members: { id: string; name: string | null; image?: string | null }[];
    projectTeams?: { id: string; name: string; members: { id: string; name: string }[] }[];
    currentUserId: string;
}

import { TaskComments } from "./task-comments";
import { Separator } from "@/components/ui/separator";

export const EditTaskModal = ({
    workspaceId,
    projectId,
    task,
    open,
    onOpenChange,
    members,
    projectTeams = [],
    currentUserId,
}: EditTaskModalProps) => {
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof TaskSchema>>({
        resolver: zodResolver(TaskSchema),
        defaultValues: {
            title: "",
            description: "",
            status: "TODO",
            priority: "MEDIUM",
            dueDate: "",
            assignedUserId: "none",
            teamMemberId: "none",
            isPaid: false,
        },
    });

    useEffect(() => {
        if (task) {
            form.reset({
                title: task.title,
                description: task.description || "",
                status: task.status,
                priority: task.priority,
                dueDate: task.dueDate ? format(new Date(task.dueDate), "yyyy-MM-dd") : "",
                assignedUserId: task.assignedUserId || "none",
                teamMemberId: task.teamMemberId || "none",
                isPaid: task.isPaid,
            });
        }
    }, [task, form, open]);

    const onSubmit = (values: z.infer<typeof TaskSchema>) => {
        if (!task) return;

        startTransition(() => {
            updateTask(workspaceId, projectId, task.id, {
                ...values,
                dueDate: values.dueDate ? new Date(values.dueDate) : undefined,
                assignedUserId: values.assignedUserId && values.assignedUserId !== "none" ? values.assignedUserId : undefined,
                teamMemberId: values.teamMemberId && values.teamMemberId !== "none" ? values.teamMemberId : undefined,
            }).then((data) => {
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
                    <DialogTitle>Edit Task</DialogTitle>
                    <DialogDescription>
                        Make changes to the task details here.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                            control={form.control}
                            name="title"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                        <Input {...field} disabled={isPending} placeholder="Task title" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <FormField
                            control={form.control}
                            name="description"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                        <Textarea {...field} disabled={isPending} placeholder="Optional description" />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="status"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Status</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Status" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="TODO">To Do</SelectItem>
                                                <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                                                <SelectItem value="COMPLETED">Completed</SelectItem>
                                                <SelectItem value="ON_HOLD">On Hold</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="priority"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Priority</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Priority" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="LOW">Low</SelectItem>
                                                <SelectItem value="MEDIUM">Medium</SelectItem>
                                                <SelectItem value="HIGH">High</SelectItem>
                                                <SelectItem value="URGENT">Urgent</SelectItem>
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="assignedUserId"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Assignee</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                            <SelectTrigger>
                                                <SelectValue placeholder="Select member" />
                                            </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                            <SelectItem value="none">None</SelectItem>
                                            {members.map((member) => (
                                                <SelectItem key={member.id} value={member.id}>
                                                    {member.name || "Unnamed User"}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="teamMemberId"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Team Member</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select team member" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                <SelectItem value="none">None</SelectItem>
                                                {projectTeams.map((team) => (
                                                    <div key={team.id}>
                                                        <div className="px-2 py-1.5 text-xs font-semibold text-zinc-500 uppercase bg-zinc-50">{team.name}</div>
                                                        {team.members?.map((tm) => (
                                                            <SelectItem key={tm.id} value={tm.id} className="pl-6">
                                                                {tm.name}
                                                            </SelectItem>
                                                        ))}
                                                    </div>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Due Date</FormLabel>
                                        <FormControl>
                                            <Input {...field} type="date" disabled={isPending} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="isPaid"
                            render={({ field }) => (
                                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-zinc-50/50">
                                    <FormControl>
                                        <Checkbox
                                            checked={field.value}
                                            onCheckedChange={field.onChange}
                                            disabled={isPending}
                                        />
                                    </FormControl>
                                    <div className="space-y-1 leading-none">
                                        <FormLabel>
                                            Mark as Paid
                                        </FormLabel>
                                        <p className="text-xs text-muted-foreground">
                                            Indicate if this task has been paid for.
                                        </p>
                                    </div>
                                </FormItem>
                            )}
                        />
                        <Button disabled={isPending} type="submit" className="w-full">
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Save Changes
                        </Button>
                    </form>
                </Form>

                {task && (
                    <>
                        <Separator className="my-6" />
                        <TaskComments
                            workspaceId={workspaceId}
                            projectId={projectId}
                            taskId={task.id}
                            currentUserId={currentUserId}
                            initialComments={task.comments || []}
                        />
                    </>
                )}
            </DialogContent>
        </Dialog>
    );
};
