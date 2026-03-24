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
import { MoreHorizontal, Pencil, Trash, Filter, LayoutGrid, List, MessageSquare, Search, Download } from "lucide-react";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { updateTask, deleteTask } from "@/actions/task";
import { toast } from "sonner";
import { useTransition } from "react";

import { EditTaskModal } from "@/components/project/edit-task-modal";
import { SetReminderModal } from "@/components/project/set-reminder-modal";
import { useState } from "react";
import { Bell } from "lucide-react";
import { ProjectTasksCardView } from "./project-tasks-card-view";

interface ProjectTasksTableProps {
    workspaceId: string;
    projectId: string;
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
        comments?: any[];
    })[];
    members: { id: string; name: string | null; image?: string | null }[];
    projectTeams?: { id: string; name: string; members: { id: string; name: string }[] }[];
    currentUserId: string;
}

export const ProjectTasksTable = ({
    workspaceId,
    projectId,
    tasks,
    members,
    projectTeams = [],
    currentUserId,
}: ProjectTasksTableProps) => {
    const [isPending, startTransition] = useTransition();
    const [editingTask, setEditingTask] = useState<Task | null>(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [reminderTask, setReminderTask] = useState<Task | null>(null);
    const [showReminderModal, setShowReminderModal] = useState(false);

    const [statusFilter, setStatusFilter] = useState<string>("ALL");
    const [priorityFilter, setPriorityFilter] = useState<string>("ALL");
    const [paidFilter, setPaidFilter] = useState<string>("ALL");
    const [searchQuery, setSearchQuery] = useState<string>("");
    const [view, setView] = useState<"TABLE" | "CARD">("TABLE");

    const handleExportCSV = () => {
        const headers = ["Title", "Status", "Priority", "Due Date", "Assigned To", "Team Member", "Paid"];
        const rows = filteredTasks.map(t => [
            `"${t.title.replace(/"/g, '""')}"`,
            t.status,
            t.priority,
            t.dueDate ? format(new Date(t.dueDate), "MMM d, yyyy") : "",
            t.assignedUser?.name || "Unassigned",
            t.teamMember?.name || "None",
            t.isPaid ? "Yes" : "No"
        ]);
        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `project-tasks.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const onDelete = (taskId: string) => {
        startTransition(() => {
            deleteTask(workspaceId, projectId, taskId).then((data) => {
                if (data.error) toast.error(data.error);
                if (data.success) toast.success(data.success);
            });
        });
    };

    const togglePayment = (taskId: string, isPaid: boolean) => {
        startTransition(() => {
            updateTask(workspaceId, projectId, taskId, { isPaid }).then((data) => {
                if (data.error) toast.error(data.error);
                if (data.success) toast.success("Task payment status updated");
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

    const filteredTasks = tasks.filter((task) => {
        if (statusFilter !== "ALL" && task.status !== statusFilter) return false;
        if (priorityFilter !== "ALL" && task.priority !== priorityFilter) return false;
        if (paidFilter !== "ALL") {
            const isPaidValue = paidFilter === "PAID";
            if (task.isPaid !== isPaidValue) return false;
        }
        if (searchQuery.trim() !== "") {
            const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());
            if (!matchesSearch) return false;
        }
        return true;
    });

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <div className="relative w-full max-w-sm">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-zinc-500" />
                    <Input
                        placeholder="Search tasks by title..."
                        className="pl-9 bg-white"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-x-2">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={handleExportCSV}
                        className="h-8"
                    >
                        <Download className="h-4 w-4 mr-2" />
                        Export CSV
                    </Button>
                    <Button
                        variant={view === "TABLE" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setView("TABLE")}
                        className="h-8 w-8 p-0"
                    >
                        <List className="h-4 w-4" />
                    </Button>
                    <Button
                        variant={view === "CARD" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setView("CARD")}
                        className="h-8 w-8 p-0"
                    >
                        <LayoutGrid className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div className="flex flex-col sm:flex-row items-center gap-4 mb-4">
                <div className="flex items-center gap-x-2 text-zinc-500">
                    <Filter className="h-4 w-4" />
                    <span className="text-sm font-medium">Filters:</span>
                </div>
                <div className="flex flex-wrap gap-2">
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Statuses</SelectItem>
                            <SelectItem value="TODO">To Do</SelectItem>
                            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                            <SelectItem value="COMPLETED">Completed</SelectItem>
                            <SelectItem value="ON_HOLD">On Hold</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Priorities</SelectItem>
                            <SelectItem value="LOW">Low</SelectItem>
                            <SelectItem value="MEDIUM">Medium</SelectItem>
                            <SelectItem value="HIGH">High</SelectItem>
                            <SelectItem value="URGENT">Urgent</SelectItem>
                        </SelectContent>
                    </Select>
                    <Select value={paidFilter} onValueChange={setPaidFilter}>
                        <SelectTrigger className="w-[140px]">
                            <SelectValue placeholder="Payment" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="ALL">All Payment Types</SelectItem>
                            <SelectItem value="PAID">Paid</SelectItem>
                            <SelectItem value="UNPAID">Unpaid</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>
            {view === "TABLE" ? (
                <div className="rounded-md border overflow-x-auto">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[50px]">#</TableHead>
                                <TableHead>Title</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead>Priority</TableHead>
                                <TableHead>Due Date</TableHead>
                                <TableHead>Assigned To</TableHead>
                                <TableHead>Team Member</TableHead>
                                <TableHead>Paid</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredTasks.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={9} className="h-24 text-center">
                                        No tasks found.
                                    </TableCell>
                                </TableRow>
                            )}
                            {filteredTasks.map((task, index) => (
                                <TableRow key={task.id}>
                                    <TableCell className="font-medium text-zinc-500">{index + 1}</TableCell>
                                    <TableCell className="font-medium">
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p>{task.title}</p>
                                                {task._count && task._count.comments > 0 && (
                                                    <div className="flex items-center gap-1 text-xs text-muted-foreground bg-zinc-100 rounded-full px-2 py-0.5" title={`${task._count.comments} comments`}>
                                                        <MessageSquare className="h-3 w-3" />
                                                        {task._count.comments}
                                                    </div>
                                                )}
                                            </div>
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
                                    <TableCell>
                                        {task.teamMember ? (
                                            <span className="text-sm">{task.teamMember.name}</span>
                                        ) : (
                                            <span className="text-sm text-zinc-400">None</span>
                                        )}
                                    </TableCell>
                                    <TableCell>
                                        <Checkbox
                                            checked={task.isPaid}
                                            onCheckedChange={(checked) => togglePayment(task.id, checked as boolean)}
                                            disabled={isPending}
                                        />
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
                </div>
            ) : (
                <ProjectTasksCardView
                    tasks={filteredTasks}
                    onEdit={(task) => {
                        setEditingTask(task);
                        setShowEditModal(true);
                    }}
                    onDelete={onDelete}
                    onReminder={(task) => {
                        setReminderTask(task);
                        setShowReminderModal(true);
                    }}
                    onTogglePayment={togglePayment}
                    isPending={isPending}
                />
            )}
            <EditTaskModal
                workspaceId={workspaceId}
                projectId={projectId}
                task={editingTask as any}
                open={showEditModal}
                onOpenChange={setShowEditModal}
                members={members}
                projectTeams={projectTeams}
                currentUserId={currentUserId}
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
