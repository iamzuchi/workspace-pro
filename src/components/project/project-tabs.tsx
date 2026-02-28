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
import { DocumentUploadButton } from "../document/document-upload-button";
import { Badge } from "@/components/ui/badge";
import { Download, Package, Receipt, PlusCircle, ExternalLink, FileIcon, ImageIcon, FileTextIcon } from "lucide-react";
import { formatCurrency } from "@/lib/currency";
import { format } from "date-fns";
import Link from "next/link";
import { ProjectTeamSection } from "@/components/project/project-team-section";
import { ProjectBudgetCard } from "./project-budget-card";
import { EditAllocationModal } from "./edit-allocation-modal";
import { CreateExpenseModal } from "@/components/finance/create-expense-modal";

interface ProjectTabsProps {
    workspaceId: string;
    projectId: string;
    project: any;
    workspaceItems: any[];
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
    const [editingAllocation, setEditingAllocation] = useState<any | null>(null);
    const [showEditAllocationModal, setShowEditAllocationModal] = useState(false);

    const getFileIcon = (type: string | null) => {
        if (!type) return <FileIcon className="h-5 w-5" />;
        if (["jpg", "png", "jpeg", "webp"].includes(type.toLowerCase())) return <ImageIcon className="h-5 w-5 text-sky-500" />;
        if (["pdf"].includes(type.toLowerCase())) return <FileTextIcon className="h-5 w-5 text-red-500" />;
        return <FileIcon className="h-5 w-5 text-zinc-500" />;
    };

    const completedTasks = tasks.filter((t: any) => t.status === "COMPLETED").length;
    const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0;

    // Get the first assigned team (if any)
    const projectTeam = project.teams?.[0] || null;

    return (
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
            <TabsList className="overflow-x-auto flex-nowrap h-fit p-1 bg-zinc-100/50">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="tasks" className="gap-2">
                    <CheckSquare className="h-4 w-4" />
                    Tasks
                </TabsTrigger>
                <TabsTrigger value="tracker" className="gap-2">
                    <GanttChart className="h-4 w-4" />
                    Tracker
                </TabsTrigger>
                <TabsTrigger value="team" className="gap-2">
                    <Users className="h-4 w-4" />
                    Team
                </TabsTrigger>
                <TabsTrigger value="comments" className="gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Comments
                    {comments.length > 0 && (
                        <Badge variant="secondary" className="h-5 px-1.5 min-w-[20px] justify-center ml-0.5">
                            {comments.length}
                        </Badge>
                    )}
                </TabsTrigger>
                <TabsTrigger value="activity">Activity</TabsTrigger>
                <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="inventory">Inventory</TabsTrigger>
                <TabsTrigger value="expenses">Expenses</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <h3 className="tracking-tight text-sm font-medium text-zinc-500 uppercase">Progress</h3>
                        <div className="flex items-baseline gap-2 mt-2">
                            <div className="text-2xl font-bold">{progress}%</div>
                            <div className="text-xs text-muted-foreground">({completedTasks}/{tasks.length} tasks)</div>
                        </div>
                        <div className="w-full h-2 bg-zinc-100 rounded-full mt-3 overflow-hidden">
                            <div className="h-full bg-blue-600 transition-all" style={{ width: `${progress}%` }} />
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <h3 className="tracking-tight text-sm font-medium text-zinc-500 uppercase">Team Size</h3>
                        <div className="text-2xl font-bold mt-2">{members.length} Members</div>
                        <p className="text-xs text-muted-foreground mt-1">{contractors.length} Contractors in workspace</p>
                    </div>
                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <h3 className="tracking-tight text-sm font-medium text-zinc-500 uppercase">Start Date</h3>
                        <div className="text-2xl font-bold mt-2">
                            {project.startDate ? format(new Date(project.startDate), "MMM d, yyyy") : "N/A"}
                        </div>
                    </div>
                    <div className="rounded-xl border bg-card text-card-foreground shadow p-6">
                        <h3 className="tracking-tight text-sm font-medium text-zinc-500 uppercase">Inventory</h3>
                        <div className="text-2xl font-bold mt-2">{project.allocations.length} Items</div>
                    </div>
                </div>

                {/* Team & Budget Section */}
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

                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                    <Card className="col-span-4">
                        <CardHeader>
                            <CardTitle>Recent Tasks</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ProjectTasksTable
                                workspaceId={workspaceId}
                                projectId={projectId}
                                tasks={tasks.slice(0, 5)}
                                members={members.map((m: any) => m.user)}
                                projectTeams={project.teams as any}
                                currentUserId={currentUserId}
                            />
                            <div className="mt-4 flex justify-center">
                                <Button variant="ghost" size="sm" onClick={() => setActiveTab("tasks")}>
                                    View all tasks
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                    <Card className="col-span-3">
                        <CardHeader>
                            <CardTitle>Quick Timeline</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <ProjectTimeline tasks={tasks.filter((t: any) => t.dueDate).slice(0, 8)} />
                        </CardContent>
                    </Card>
                </div>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Project Tasks</h3>
                    <CreateTaskModal workspaceId={workspaceId} projectId={projectId} members={members.map((m: any) => m.user)} />
                </div>
                <ProjectTasksTable workspaceId={workspaceId} projectId={projectId} tasks={tasks} members={members.map((m: any) => m.user)} projectTeams={project.teams as any} currentUserId={currentUserId} />
            </TabsContent>

            <TabsContent value="tracker" className="space-y-4">
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <CalendarIcon className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>Calendar View</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ProjectCalendar tasks={tasks} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-2">
                            <GanttChart className="h-5 w-5 text-muted-foreground" />
                            <CardTitle>Timeline Visualization</CardTitle>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <ProjectTimeline tasks={tasks} />
                    </CardContent>
                </Card>
            </TabsContent>

            <TabsContent value="team" className="space-y-4">
                <ProjectTeam members={members} contractors={contractors} />
            </TabsContent>

            <TabsContent value="comments" className="space-y-4">
                <div className="rounded-xl border bg-card shadow p-6">
                    <CommentThread
                        workspaceId={workspaceId}
                        projectId={projectId}
                        initialComments={comments}
                    />
                </div>
            </TabsContent>

            <TabsContent value="activity" className="space-y-4">
                <div className="rounded-xl border bg-card shadow p-6">
                    <ActivityFeed activities={activities} />
                </div>
            </TabsContent>

            <TabsContent value="documents" className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Project Documents</h3>
                    <DocumentUploadButton workspaceId={workspaceId} projectId={projectId} />
                </div>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {documents.length === 0 && (
                        <div className="col-span-full h-32 flex items-center justify-center border-2 border-dashed rounded-xl text-zinc-500">
                            No documents for this project.
                        </div>
                    )}
                    {documents.map((doc: any) => (
                        <div key={doc.id} className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition">
                            <div className="flex items-center gap-3 min-w-0">
                                {getFileIcon(doc.fileType)}
                                <div className="min-w-0">
                                    <p className="text-sm font-medium truncate">{doc.name}</p>
                                    <p className="text-[10px] text-zinc-400">{doc.fileType?.toUpperCase()} • {doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : ""}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button variant="ghost" size="icon" asChild>
                                    <a href={doc.url} target="_blank" rel="noopener noreferrer">
                                        <Download className="h-4 w-4" />
                                    </a>
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </TabsContent>

            <TabsContent value="inventory" className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Allocated Inventory</h3>
                    <AllocateInventoryModal
                        workspaceId={workspaceId}
                        projectId={projectId}
                        items={workspaceItems}
                    />
                </div>
                <div className="rounded-xl border bg-card shadow overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-zinc-50 border-b">
                            <tr>
                                <th className="text-left py-3 px-4 font-semibold text-zinc-600">Item Name</th>
                                <th className="text-center py-3 px-4 font-semibold text-zinc-600">Quantity</th>
                                <th className="text-right py-3 px-4 font-semibold text-zinc-600">Allocated At</th>
                                <th className="text-right py-3 px-4 font-semibold text-zinc-600">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {project.allocations.length === 0 && (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-zinc-500 italic">
                                        No inventory items allocated to this project yet.
                                    </td>
                                </tr>
                            )}
                            {project.allocations.map((allocation: any) => (
                                <tr key={allocation.id} className="hover:bg-zinc-50 transition">
                                    <td className="py-3 px-4">
                                        <div className="flex items-center gap-2">
                                            <Package className="h-4 w-4 text-zinc-400" />
                                            <span className="font-medium">{allocation.item.name}</span>
                                        </div>
                                    </td>
                                    <td className="py-3 px-4 text-center">
                                        <Badge variant="secondary">{allocation.quantity}</Badge>
                                    </td>
                                    <td className="py-3 px-4 text-right text-zinc-400">
                                        {format(new Date(allocation.allocatedAt), "MMM d, yyyy")}
                                    </td>
                                    <td className="py-3 px-4 text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setEditingAllocation(allocation);
                                                setShowEditAllocationModal(true);
                                            }}
                                        >
                                            Edit
                                        </Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <EditAllocationModal
                    workspaceId={workspaceId}
                    projectId={projectId}
                    allocation={editingAllocation}
                    open={showEditAllocationModal}
                    onOpenChange={setShowEditAllocationModal}
                />
            </TabsContent>

            <TabsContent value="expenses" className="space-y-4">
                <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Project Expenses</h3>
                    <CreateExpenseModal projectId={projectId} />
                </div>
                <div className="rounded-xl border bg-card shadow overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-zinc-50 border-b">
                            <tr>
                                <th className="text-left py-3 px-4 font-semibold text-zinc-600">Date</th>
                                <th className="text-left py-3 px-4 font-semibold text-zinc-600">Title</th>
                                <th className="text-left py-3 px-4 font-semibold text-zinc-600">Category</th>
                                <th className="text-right py-3 px-4 font-semibold text-zinc-600">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {(!project.expenses || project.expenses.length === 0) && (
                                <tr>
                                    <td colSpan={4} className="py-8 text-center text-zinc-500 italic">
                                        No expenses recorded for this project.
                                    </td>
                                </tr>
                            )}
                            {project.expenses?.map((expense: any) => (
                                <tr key={expense.id} className="hover:bg-zinc-50 transition">
                                    <td className="py-3 px-4">{format(new Date(expense.date), "MMM d, yyyy")}</td>
                                    <td className="py-3 px-4 font-medium">{expense.title}</td>
                                    <td className="py-3 px-4">
                                        <Badge variant="secondary">{expense.category}</Badge>
                                    </td>
                                    <td className="py-3 px-4 text-right font-bold text-rose-600">
                                        -{formatCurrency(Number(expense.amount), project.workspace.currency || "USD")}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </TabsContent>
        </Tabs>
    );
};
