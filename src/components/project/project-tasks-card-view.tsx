"use client";

import { Task, TaskStatus, TaskPriority } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MoreHorizontal, Pencil, Trash, Bell, MessageSquare, ExternalLink } from "lucide-react";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";

interface ProjectTasksCardViewProps {
    tasks: (Task & {
        assignedUser: {
            name: string | null;
            image: string | null;
            email: string;
        } | null;
        teamMember: {
            id: string;
            name: string;
        } | null;
        _count?: {
            comments: number;
        };
    })[];
    onEdit: (task: Task) => void;
    onDelete: (taskId: string) => void;
    onReminder: (task: Task) => void;
    onTogglePayment: (taskId: string, isPaid: boolean) => void;
    isPending: boolean;
}

export const ProjectTasksCardView = ({
    tasks,
    onEdit,
    onDelete,
    onReminder,
    onTogglePayment,
    isPending
}: ProjectTasksCardViewProps) => {
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

    if (tasks.length === 0) {
        return (
            <div className="h-24 flex items-center justify-center text-zinc-500 border rounded-md">
                No tasks found.
            </div>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tasks.map((task) => (
                <Card key={task.id} className="shadow hover:shadow-md transition bg-white/50 border">
                    <CardHeader className="p-4 pb-2">
                        <div className="flex items-start justify-between gap-2">
                            <CardTitle
                                className="text-base font-semibold leading-tight line-clamp-2 cursor-pointer hover:underline decoration-zinc-300"
                                onClick={() => onEdit(task)}
                            >
                                {task.title}
                            </CardTitle>
                            <DropdownMenu>
                                <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" className="h-8 w-8 p-0">
                                        <MoreHorizontal className="h-4 w-4" />
                                    </Button>
                                </DropdownMenuTrigger>
                                <DropdownMenuContent align="end">
                                    <DropdownMenuItem disabled={isPending} onClick={() => onEdit(task)}>
                                        <Pencil className="mr-2 h-4 w-4" /> Edit
                                    </DropdownMenuItem>
                                    <DropdownMenuItem disabled={isPending} onClick={() => onReminder(task)}>
                                        <Bell className="mr-2 h-4 w-4" /> Set Reminder
                                    </DropdownMenuItem>
                                    <DropdownMenuItem className="text-destructive" disabled={isPending} onClick={() => onDelete(task.id)}>
                                        <Trash className="mr-2 h-4 w-4" /> Delete
                                    </DropdownMenuItem>
                                </DropdownMenuContent>
                            </DropdownMenu>
                        </div>
                    </CardHeader>
                    <CardContent className="p-4 pt-0 space-y-3">
                        <div className="flex flex-wrap gap-2">
                            <Badge variant="outline" className={getStatusColor(task.status)}>
                                {task.status.replace("_", " ")}
                            </Badge>
                            <Badge variant="outline" className={getPriorityColor(task.priority)}>
                                {task.priority}
                            </Badge>
                        </div>
                        {task.description && (
                            <p className="text-xs text-muted-foreground line-clamp-2">
                                {task.description}
                            </p>
                        )}
                        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                            <p>{task.dueDate ? format(new Date(task.dueDate), "MMM d, yyyy") : "No due date"}</p>
                            {task._count && task._count.comments > 0 && (
                                <div className="flex items-center gap-1 text-zinc-500 bg-zinc-100 rounded-full px-2 py-0.5">
                                    <MessageSquare className="h-3 w-3" />
                                    <span>{task._count.comments}</span>
                                </div>
                            )}
                        </div>
                    </CardContent>
                    <CardFooter className="p-4 pt-0 flex items-center justify-between border-t mt-auto text-xs bg-zinc-50/50 rounded-b-xl">
                        <div className="flex items-center gap-2 pt-2">
                            {task.assignedUser ? (
                                <div className="flex items-center gap-1.5 ">
                                    <Avatar className="h-5 w-5">
                                        <AvatarImage src={task.assignedUser.image || ""} />
                                        <AvatarFallback>{task.assignedUser.name?.[0] || "U"}</AvatarFallback>
                                    </Avatar>
                                    <span className="truncate max-w-[80px]">{task.assignedUser.name}</span>
                                </div>
                            ) : (
                                <span className="text-zinc-400">Unassigned</span>
                            )}
                        </div>
                        <div className="flex items-center gap-3 pt-2">
                            <div className="flex items-center gap-1">
                                <span className="text-[10px] text-zinc-400">Paid?</span>
                                <Checkbox
                                    checked={task.isPaid}
                                    onCheckedChange={(checked) => onTogglePayment(task.id, checked as boolean)}
                                    disabled={isPending}
                                    className="h-3 w-3"
                                />
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                className="h-7 px-2 text-[10px] gap-1 hover:bg-zinc-200"
                                onClick={() => onEdit(task)}
                            >
                                <ExternalLink className="h-3 w-3" />
                                Open
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            ))}
        </div>
    );
};
