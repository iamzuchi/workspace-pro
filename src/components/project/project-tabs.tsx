"use client";

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckSquare, GanttChart, Users, Calendar as CalendarIcon, MessageSquare } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProjectTasksTable } from "./project-tasks-table";
import { ProjectTimeline } from "./project-timeline";
import { ProjectCalendar } from "./project-calendar";
import { ProjectTeam } from "./project-team";
import { CommentThread } from "./comment-thread";
import { ActivityFeed } from "./activity-feed";
import { CreateTaskModal } from "./create-task-modal";
import { AllocateInventoryModal } from "./allocate-inventory-modal";
import { MemberAssignmentModal } from "./member-assignment-modal";
import { DocumentUploadButton } from "../document/document-upload-button";
import { Badge } from "@/components/ui/badge";
import { Download, Package, Receipt, PlusCircle, ExternalLink, FileIcon, ImageIcon, FileTextIcon, Warehouse, User } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import Link from "next/link";
import { ProjectTeamSection } from "@/components/project/project-team-section";
import { ProjectBudgetCard } from "./project-budget-card";
import { CreateExpenseModal } from "@/components/finance/create-expense-modal";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface ProjectTabsProps {
    workspaceId: string;
    projectId: string;
    project: any;
    workspaceItems: any[];
    projectStock: any[];
    memberStock: any[];
    teamMembers: any[];
    comments: any[];
    activities: any[];
    documents: any[];
    tasks: any[];
    members: any[];
    contractors: any[];
    totalExpenses: number;
    currentUserId: string;
}

export const ProjectTabs = ({
    workspaceId,
    projectId,
    project,
    workspaceItems,
    projectStock,
    memberStock,
    teamMembers,
    comments,
    activities,
    documents,
    tasks,
    members,
    contractors,
    totalExpenses,
    currentUserId
}: ProjectTabsProps) => {
    const [activeTab, setActiveTab] = useState("overview");

    const getFileIcon = (type: string | null) => {
        if (!type) return <FileIcon className="h-5 w-5" />;
        if (["jpg", "png", "jpeg", "webp"].includes(type.toLowerCase())) return <ImageIcon className="h-5 w-5 text-sky-500" />;
        if (["pdf"].includes(type.toLowerCase())) return <FileTextIcon className="h-5 w-5 text-red-500" />;
        return <FileIcon className="h-5 w-5 text-zinc-500" />;
    };

    const completedTasks = tasks.filter((t: any) => t.status === "COMPLETED").length;
    const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    const projectTeam = project.teams?.[0] || null;

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="overflow-x-auto flex-nowrap h-fit p-1 bg-zinc-100/50">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tasks" className="gap-2">
                    <CheckSquare className="h-4 w-4" />
                    Tasks
                </TabsTrigger>
                <TabsTrigger value="team" className="gap-2">
                    <Users className="h-4 w-4" />
                    Team
                </TabsTrigger>
                <TabsTrigger value="inventory" className="gap-2">
                    <Package className="h-4 w-4" />
                    Inventory
                </TabsTrigger>
                <TabsTrigger value="expenses">Expenses</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                {/* <TabsTrigger value="comments">Comments</TabsTrigger> */}
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <Card className="p-6">
                        <h3 className="tracking-tight text-sm font-medium text-zinc-500 uppercase">Progress</h3>
                        <div className="flex items-baseline gap-2 mt-2">
                            <div className="text-2xl font-bold">{progress}%</div>
                            <div className="text-xs text-muted-foreground">({completedTasks}/{tasks.length} tasks)</div>
                        </div>
                    </Card>
                    <Card className="p-6">
                        <h3 className="tracking-tight text-sm font-medium text-zinc-500 uppercase">Team Size</h3>
                        <div className="text-2xl font-bold mt-2">{members.length} Members</div>
                    </Card>
                    <Card className="p-6">
                        <h3 className="tracking-tight text-sm font-medium text-zinc-500 uppercase">Warehouse Stock</h3>
                        <div className="text-2xl font-bold mt-2">{projectStock.length} Item types</div>
                    </Card>
                    <Card className="p-6">
                        <h3 className="tracking-tight text-sm font-medium text-zinc-500 uppercase">Total Expenses</h3>
                        <div className="text-2xl font-bold mt-2 font-mono">{formatCurrency(totalExpenses, project.workspace.currency || "USD")}</div>
                    </Card>
                </div>

                <div className="grid gap-4 md:grid-cols-1 lg:grid-cols-4">
                    <div className="lg:col-span-3">
                        <ProjectTeamSection team={projectTeam} workspaceId={workspaceId} currency={project.workspace.currency || "USD"} />
                    </div>
                    <div className="lg:col-span-1">
                        <ProjectBudgetCard
                            budget={Number(project.budget || 0)}
                            totalExpenses={totalExpenses}
                            currency={project.workspace.currency || "USD"}
                        />
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Project Tasks</h3>
                    <CreateTaskModal workspaceId={workspaceId} projectId={projectId} members={members.map((m: any) => m.user)} />
                </div>
                <ProjectTasksTable workspaceId={workspaceId} projectId={projectId} tasks={tasks} members={members.map((m: any) => m.user)} projectTeams={project.teams as any} currentUserId={currentUserId} />
            </TabsContent>

            <TabsContent value="team" className="space-y-4">
                <ProjectTeam members={members} contractors={contractors} />
            </TabsContent>

            <TabsContent value="inventory" className="space-y-8">
                {/* Virtual Warehouse Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Warehouse className="h-5 w-5 text-blue-600" />
                            <h3 className="text-xl font-bold">Project Warehouse</h3>
                            <Badge variant="secondary">In Stock</Badge>
                        </div>
                        <AllocateInventoryModal
                            workspaceId={workspaceId}
                            projectId={projectId}
                            items={workspaceItems}
                        />
                    </div>
                    <div className="rounded-xl border bg-card shadow-sm overflow-x-auto">
                        <Table>
                            <TableHeader className="bg-zinc-50/50">
                                <TableRow>
                                    <TableHead>Item Name</TableHead>
                                    <TableHead className="text-center">Available in Project</TableHead>
                                    <TableHead className="text-right">Last Updated</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {projectStock.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="py-12 text-center text-zinc-500">
                                            The project warehouse is currently empty. 
                                            Allocate items from general inventory to get started.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {projectStock.map((stock: any) => (
                                    <TableRow key={stock.id}>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Package className="h-4 w-4 text-zinc-400" />
                                                <span className="font-semibold">{stock.item.name}</span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Badge variant="outline" className="text-lg font-mono px-3">
                                                {stock.quantity}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right text-zinc-400 text-xs">
                                            {format(new Date(stock.updatedAt), "MMM d, HH:mm")}
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </div>

                {/* Team Member Assignments Section */}
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <User className="h-5 w-5 text-violet-600" />
                            <h3 className="text-xl font-bold">Member Individual Stock</h3>
                            <Badge variant="outline">Assignments</Badge>
                        </div>
                        <MemberAssignmentModal
                            workspaceId={workspaceId}
                            projectId={projectId}
                            projectStock={projectStock}
                            teamMembers={teamMembers}
                        />
                    </div>
                    <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                        {memberStock.length === 0 && (
                            <div className="col-span-full py-12 text-center border-2 border-dashed rounded-xl text-zinc-500">
                                No materials assigned to team members yet.
                            </div>
                        )}
                        {memberStock.map((ms: any) => (
                            <Card key={ms.id} className="border-l-4 border-l-violet-500 overflow-hidden">
                                <CardContent className="p-4">
                                    <div className="flex items-center justify-between mb-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-8 w-8 rounded-full bg-violet-100 flex items-center justify-center text-violet-700 font-bold text-xs uppercase">
                                                {ms.teamMember.name.substring(0, 2)}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold leading-none">{ms.teamMember.name}</p>
                                                <p className="text-[10px] text-muted-foreground uppercase tracking-tight">{ms.teamMember.occupation || "Member"}</p>
                                            </div>
                                        </div>
                                        <Badge className="bg-zinc-900 text-white font-mono text-base">
                                            {ms.quantity}
                                        </Badge>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm">
                                        <Package className="h-4 w-4 text-zinc-400" />
                                        <span className="font-medium">{ms.item.name}</span>
                                    </div>
                                    <div className="mt-4 pt-4 border-t flex items-center justify-between text-[11px] text-zinc-400">
                                        <span>Assigned items</span>
                                        <span>Used: {ms.usages.reduce((acc: number, u: any) => acc + u.quantity, 0)} units</span>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                </div>
            </TabsContent>

            <TabsContent value="expenses" className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Project Expenses</h3>
                    <CreateExpenseModal projectId={projectId} />
                </div>
                {/* ... existing expense table ... */}
            </TabsContent>
        </Tabs>
    );
};
