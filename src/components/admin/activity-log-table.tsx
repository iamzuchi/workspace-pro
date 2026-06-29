"use client";

import { useState } from "react";
import { format } from "date-fns";
import { 
    Search, 
    Filter, 
    Calendar,
    ChevronLeft, 
    ChevronRight,
    FileText,
    FolderGit,
    Clock
} from "lucide-react";
import { 
    Table, 
    TableBody, 
    TableCell, 
    TableHead, 
    TableHeader, 
    TableRow 
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface ActivityLogTableProps {
    activities: any[];
    users: any[];
}

export const ActivityLogTable = ({ activities, users }: ActivityLogTableProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedUser, setSelectedUser] = useState("all");
    const [selectedAction, setSelectedAction] = useState("all");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 15;

    // Get unique list of logged actions for filtering
    const actionTypes = Array.from(new Set(activities.map(a => a.action)));

    // Filtering logic
    const filteredActivities = activities.filter(activity => {
        const matchesSearch = 
            activity.details?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            activity.action.toLowerCase().includes(searchTerm.toLowerCase());
            
        const matchesUser = selectedUser === "all" || activity.userId === selectedUser;
        const matchesAction = selectedAction === "all" || activity.action === selectedAction;
        
        return matchesSearch && matchesUser && matchesAction;
    });

    // Pagination
    const totalPages = Math.ceil(filteredActivities.length / itemsPerPage);
    const paginatedActivities = filteredActivities.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    const getActionBadgeColor = (action: string) => {
        switch (action) {
            case "CREATED_TASK":
                return "bg-emerald-50 text-emerald-700 ring-emerald-600/20";
            case "UPDATED_TASK_STATUS":
                return "bg-blue-50 text-blue-700 ring-blue-600/20";
            case "CREATED_TEAM":
                return "bg-violet-50 text-violet-700 ring-violet-600/20";
            case "UPDATED_TEAM":
                return "bg-amber-50 text-amber-700 ring-amber-600/20";
            case "DELETED_TEAM":
                return "bg-rose-50 text-rose-700 ring-rose-600/10";
            case "COMMENTED":
                return "bg-sky-50 text-sky-700 ring-sky-600/20";
            default:
                return "bg-zinc-50 text-zinc-600 ring-zinc-500/10";
        }
    };

    return (
        <div className="space-y-4">
            <Card className="border-zinc-100 bg-zinc-50/30 shadow-none">
                <CardContent className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex flex-wrap items-center gap-2 flex-1">
                        <div className="relative flex-1 min-w-[200px] max-w-sm">
                            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                            <Input
                                placeholder="Search details..."
                                className="pl-8 h-9"
                                value={searchTerm}
                                onChange={(e) => {
                                    setSearchTerm(e.target.value);
                                    setCurrentPage(1);
                                }}
                            />
                        </div>
                        
                        <Select 
                            value={selectedUser} 
                            onValueChange={(val) => {
                                setSelectedUser(val);
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="w-[180px] h-9">
                                <SelectValue placeholder="Filter by User" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Users</SelectItem>
                                {users.map(u => (
                                    <SelectItem key={u.id} value={u.id}>
                                        {u.name || u.email}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        <Select 
                            value={selectedAction} 
                            onValueChange={(val) => {
                                setSelectedAction(val);
                                setCurrentPage(1);
                            }}
                        >
                            <SelectTrigger className="w-[180px] h-9">
                                <Filter className="mr-2 h-4 w-4" />
                                <SelectValue placeholder="Action Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Actions</SelectItem>
                                {actionTypes.map(action => (
                                    <SelectItem key={action} value={action}>
                                        {action.replace(/_/g, " ")}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="text-xs text-muted-foreground self-end md:self-auto font-medium">
                        Showing {filteredActivities.length} logs
                    </div>
                </CardContent>
            </Card>

            <div className="rounded-md border bg-white overflow-hidden shadow-sm">
                <Table>
                    <TableHeader className="bg-zinc-50/50">
                        <TableRow>
                            <TableHead className="w-[180px]">User</TableHead>
                            <TableHead className="w-[160px]">Action</TableHead>
                            <TableHead>Details</TableHead>
                            <TableHead className="w-[180px]">Reference</TableHead>
                            <TableHead className="w-[180px]">Timestamp</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {paginatedActivities.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                    No activity logs found.
                                </TableCell>
                            </TableRow>
                        )}
                        {paginatedActivities.map((activity) => (
                            <TableRow key={activity.id} className="hover:bg-zinc-50/50 transition-colors">
                                <TableCell className="font-medium">
                                    <div className="flex items-center gap-x-2">
                                        <Avatar className="h-7 w-7 border">
                                            <AvatarImage src={activity.user.image || ""} />
                                            <AvatarFallback className="text-[10px]">
                                                {activity.user.name?.slice(0, 2).toUpperCase() || "US"}
                                            </AvatarFallback>
                                        </Avatar>
                                        <span className="truncate max-w-[120px] text-sm">
                                            {activity.user.name || "System User"}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge 
                                        variant="outline" 
                                        className={cn("text-[10px] uppercase font-semibold h-5 tracking-wider ring-1 ring-inset", getActionBadgeColor(activity.action))}
                                    >
                                        {activity.action.replace(/_/g, " ")}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-zinc-600 text-sm">
                                    {activity.details || "No details provided"}
                                </TableCell>
                                <TableCell className="text-sm">
                                    {activity.project && (
                                        <div className="flex items-center gap-x-1 text-muted-foreground">
                                            <FolderGit className="h-3.5 w-3.5 text-zinc-400" />
                                            <span className="truncate max-w-[140px]">{activity.project.name}</span>
                                        </div>
                                    )}
                                    {activity.invoice && (
                                        <div className="flex items-center gap-x-1 text-muted-foreground">
                                            <FileText className="h-3.5 w-3.5 text-zinc-400" />
                                            <span>Invoice #{activity.invoice.number}</span>
                                        </div>
                                    )}
                                    {!activity.project && !activity.invoice && (
                                        <span className="text-zinc-400 text-xs">-</span>
                                    )}
                                </TableCell>
                                <TableCell className="text-muted-foreground text-xs font-mono">
                                    <div className="flex items-center gap-x-1">
                                        <Clock className="h-3.5 w-3.5 text-zinc-400" />
                                        <span>{format(new Date(activity.createdAt), "MMM dd, yyyy HH:mm:ss")}</span>
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                    >
                        <ChevronLeft className="h-4 w-4" />
                        Previous
                    </Button>
                    <div className="text-sm font-medium text-muted-foreground">
                        Page {currentPage} of {totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                    >
                        Next
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
};
