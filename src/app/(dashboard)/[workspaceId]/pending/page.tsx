import prisma from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
    Clock,
    AlertTriangle,
    CreditCard,
    CheckCircle2,
    Calendar,
    ArrowRight,
    Package
} from "lucide-react";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";

const PendingItemsPage = async ({
    params
}: {
    params: Promise<{ workspaceId: string }>
}) => {
    const { workspaceId } = await params;
    const user = await currentUser();
    if (!user) redirect("/login");

    const [pendingInvoices, lowStockInventory, pendingTasks] = await Promise.all([
        // 1. Pending Invoices (Sent or Draft)
        prisma.invoice.findMany({
            where: {
                workspaceId,
                status: { in: ["SENT", "DRAFT"] }
            },
            include: { project: true },
            orderBy: { dueDate: "asc" }
        }),

        // 2. Low Stock Inventory
        prisma.inventoryItem.findMany({
            where: {
                workspaceId,
                quantity: { lte: prisma.inventoryItem.fields.lowStockThreshold }
            },
            orderBy: { quantity: "asc" }
        }),

        // 3. User's Pending Tasks
        prisma.task.findMany({
            where: {
                workspaceId,
                assignedUserId: user.id,
                status: { in: ["TODO", "IN_PROGRESS"] }
            },
            include: { project: true },
            orderBy: { dueDate: "asc" }
        })
    ]);

    return (
        <div className="flex-1 space-y-8 p-8 pt-6 max-w-7xl mx-auto">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Pending Items</h2>
                    <p className="text-muted-foreground">Everything that needs your attention right now.</p>
                </div>
            </div>

            <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-3">
                {/* Pending Tasks Section */}
                <Card className="flex flex-col border-none shadow-md bg-white">
                    <CardHeader className="bg-zinc-50/50 pb-4 border-b">
                        <div className="flex items-center gap-2">
                            <Clock className="h-5 w-5 text-amber-500" />
                            <CardTitle>Assigned Tasks</CardTitle>
                        </div>
                        <CardDescription>Tasks currently assigned to you</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 p-0">
                        {pendingTasks.length === 0 ? (
                            <div className="p-8 text-center text-zinc-400 italic text-sm">No pending tasks. Great job!</div>
                        ) : (
                            <div className="divide-y">
                                {pendingTasks.map((task) => (
                                    <div key={task.id} className="p-4 hover:bg-zinc-50 transition group">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <p className="font-bold text-sm text-zinc-800">{task.title}</p>
                                                <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                                                    <Badge variant="outline" className="text-[9px] uppercase font-bold py-0 h-4">
                                                        {task.status.replace("_", " ")}
                                                    </Badge>
                                                    <span>{task.project.name}</span>
                                                </div>
                                            </div>
                                            {task.dueDate && (
                                                <div className="text-[10px] font-bold text-rose-500 flex items-center gap-1 shrink-0">
                                                    <Calendar className="h-3 w-3" />
                                                    {format(task.dueDate, "MMM d")}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                    <div className="p-4 border-t bg-zinc-50/20">
                        <Button variant="ghost" className="w-full text-xs text-zinc-500" asChild>
                            <Link href={`/${workspaceId}/projects`}>View All Projects <ArrowRight className="h-3 w-3 ml-2" /></Link>
                        </Button>
                    </div>
                </Card>

                {/* Outstanding Invoices Section */}
                <Card className="flex flex-col border-none shadow-md bg-white">
                    <CardHeader className="bg-zinc-50/50 pb-4 border-b">
                        <div className="flex items-center gap-2">
                            <CreditCard className="h-5 w-5 text-blue-500" />
                            <CardTitle>Invoices</CardTitle>
                        </div>
                        <CardDescription>Awaiting payment or action</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 p-0">
                        {pendingInvoices.length === 0 ? (
                            <div className="p-8 text-center text-zinc-400 italic text-sm">No pending invoices.</div>
                        ) : (
                            <div className="divide-y">
                                {pendingInvoices.map((invoice) => (
                                    <div key={invoice.id} className="p-4 hover:bg-zinc-50 transition group">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="space-y-1">
                                                <p className="font-bold text-sm text-zinc-800">Invoice #{invoice.number}</p>
                                                <div className="flex items-center gap-2 text-[10px] text-zinc-500">
                                                    <Badge className={`${invoice.status === 'SENT' ? 'bg-blue-100 text-blue-700' : 'bg-zinc-100 text-zinc-700'
                                                        } text-[9px] uppercase font-bold py-0 h-4 shadow-none border-none`}>
                                                        {invoice.status}
                                                    </Badge>
                                                    <span className="font-bold text-zinc-900">${Number(invoice.totalAmount).toLocaleString()}</span>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100" asChild>
                                                <Link href={`/${workspaceId}/invoices/${invoice.id}`}><ArrowRight className="h-4 w-4" /></Link>
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                    <div className="p-4 border-t bg-zinc-50/20">
                        <Button variant="ghost" className="w-full text-xs text-zinc-500" asChild>
                            <Link href={`/${workspaceId}/finance?tab=invoices`}>Manage Finances <ArrowRight className="h-3 w-3 ml-2" /></Link>
                        </Button>
                    </div>
                </Card>

                {/* Low Stock Section */}
                <Card className="flex flex-col border-none shadow-md bg-white">
                    <CardHeader className="bg-zinc-50/50 pb-4 border-b">
                        <div className="flex items-center gap-2">
                            <Package className="h-5 w-5 text-rose-500" />
                            <CardTitle>Low Stock</CardTitle>
                        </div>
                        <CardDescription>Items that need restocking</CardDescription>
                    </CardHeader>
                    <CardContent className="flex-1 p-0">
                        {lowStockInventory.length === 0 ? (
                            <div className="p-8 text-center text-zinc-400 italic text-sm">Inventory levels are healthy.</div>
                        ) : (
                            <div className="divide-y">
                                {lowStockInventory.map((item) => (
                                    <div key={item.id} className="p-4 hover:bg-zinc-50 transition">
                                        <div className="flex items-center justify-between">
                                            <div className="space-y-0.5">
                                                <p className="font-bold text-sm text-zinc-800">{item.name}</p>
                                                <p className="text-[10px] text-zinc-500 uppercase">{item.sku || "No SKU"}</p>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-sm font-black text-rose-600 flex items-center gap-1 justify-end">
                                                    <AlertTriangle className="h-3.5 w-3.5" />
                                                    {item.quantity} left
                                                </div>
                                                <p className="text-[9px] text-zinc-400 uppercase font-bold">Threshold: {item.lowStockThreshold}</p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </CardContent>
                    <div className="p-4 border-t bg-zinc-50/20">
                        <Button variant="ghost" className="w-full text-xs text-zinc-500" asChild>
                            <Link href={`/${workspaceId}/inventory`}>Go to Inventory <ArrowRight className="h-3 w-3 ml-2" /></Link>
                        </Button>
                    </div>
                </Card>
            </div>
        </div>
    );
};

export default PendingItemsPage;
