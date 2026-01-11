"use client";

import { Task, TaskStatus, TaskPriority } from "@prisma/client";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Pencil, Trash } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { deleteTask } from "@/actions/task";
import { toast } from "sonner";
import { useTransition } from "react";

import { EditTaskModal } from "@/components/project/edit-task-modal";
import { SetReminderModal } from "@/components/project/set-reminder-modal";
import { useState } from "react";
import { Bell } from "lucide-react";

interface ProjectTasksTableProps {
    workspaceId: string;
    projectId: string;
    tasks: (Task & {
        assignedUser: {
            name: string | null;
            image: string | null;
            email: string;
        } | null;
    })[];
    members: { id: string; name: string | null; image?: string | null }[];
}

export const ProjectTasksTable = ({
    workspaceId,
    projectId,
    tasks,
    members,
}: ProjectTasksTableProps) => {
    const [isPending, startTransition] = useTransition();
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [reminderTask, setReminderTask] = useState<Task | null>(null);
    const [showReminderModal, setShowReminderModal] = useState(false);

    const onDelete = (taskId: string) => {
        startTransition(() => {
            deleteTask(workspaceId, projectId, taskId).then((data) => {
                if (data.error) toast.error(data.error);
                if (data.success) toast.success(data.success);
            });
        });
    };

    const getStatusColor = (status: TaskStatus) => {
        switch (status) {
            case "TODO": return "bg-zinc-100 text-zinc-800";
            case "IN_PROGRESS": return "bg-blue-100 text-blue-800";
            case "COMPLETED": return "bg-green-100 text-green-800";
            case "ON_HOLD": return "bg-orange-100 text-orange-800";
            default: return "bg-zinc-100 text-zinc-800";
        }
    };

    const getPriorityColor = (priority: TaskPriority) => {
        switch (priority) {
            case "LOW": return "bg-zinc-50 text-zinc-600";
            case "MEDIUM": return "bg-blue-50 text-blue-600";
            case "HIGH": return "bg-orange-50 text-orange-600";
            case "URGENT": return "bg-red-50 text-red-600 font-bold";
            default: return "bg-zinc-50 text-zinc-600";
        }
    };

    return (
        <div className="rounded-md border overflow-x-auto">
            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Priority</TableHead>
                        <TableHead>Due Date</TableHead>
                        <TableHead>Assigned To</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {tasks.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-24 text-center">
                                No tasks found.
                            </TableCell>
                        </TableRow>
                    )}
                    {tasks.map((task) => (
                        <TableRow key={task.id}>
                            <TableCell className="font-medium">
                                <div>
                                    <p>{task.title}</p>
                                    {task.description && (
                                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                                            {task.description}
                                        </p>
                                    )}
                                </div>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className={getStatusColor(task.status)}>
                                    {task.status.replace("_", " ")}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                    {task.priority}
                                </Badge>
                            </TableCell>
                            <TableCell className="text-muted-foreground">
                                {task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "No date"}
                            </TableCell>
                            <TableCell>
                                {task.assignedUser ? (
                                    <div className="flex items-center gap-2">
                                        <Avatar className="h-6 w-6">
                                            <AvatarImage src={task.assignedUser.image || ""} />
                                            <AvatarFallback>{task.assignedUser.name?.[0] || "U"}</AvatarFallback>
                                        </Avatar>
                                        <span className="text-sm">{task.assignedUser.name}</span>
                                    </div>
                                ) : (
                                    <span className="text-sm text-zinc-400">Unassigned</span>
                                )}
                            </TableCell>
                            <TableCell className="text-right">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" className="h-8 w-8 p-0">
                                            <MoreHorizontal className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="end">
                                        <DropdownMenuItem
                                            disabled={isPending}
                                            onClick={() => {
                                                setEditingTask(task);
                                                setShowEditModal(true);
                                            }}
                                        >
                                            <Pencil className="mr-2 h-4 w-4" />
                                            Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            disabled={isPending}
                                            onClick={() => {
                                                setReminderTask(task);
                                                setShowReminderModal(true);
                                            }}
                                        >
                                            <Bell className="mr-2 h-4 w-4" />
                                            Set Reminder
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive"
                                            disabled={isPending}
                                            onClick={() => onDelete(task.id)}
                                        >
                                            <Trash className="mr-2 h-4 w-4" />
                                            Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
            <EditTaskModal
                workspaceId={workspaceId}
                projectId={projectId}
                task={editingTask}
                open={showEditModal}
                onOpenChange={setShowEditModal}
                members={members}
            />
            {reminderTask && (
                <SetReminderModal
                    workspaceId={workspaceId}
                    resourceType="TASK"
                    resourceId={reminderTask.id}
                    open={showReminderModal}
                    onOpenChange={setShowReminderModal}
                />
            )}
        </div>
    );
};
