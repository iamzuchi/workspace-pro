import prisma from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LayoutDashboard, Package, Users, FileText } from "lucide-react";
import { OnboardingGuide } from "@/components/dashboard/onboarding-guide";
import {
    ProjectsChart,
    FinanceChart,
    InventoryAlertChart,
    TeamRolesChart
} from "@/components/dashboard/dashboard-charts";

const WorkspaceIdPage = async ({ params }: { params: Promise<{ workspaceId: string }> }) => {
    const { workspaceId } = await params;
    const user = await currentUser();
    if (!user) redirect("/login");

    // 1. Fetch Basic Counts (Existing)
    const [projectsCount, inventoryCount, membersCount, invoicesCount] = await Promise.all([
        prisma.project.count({ where: { workspaceId: workspaceId } }),
        prisma.inventoryItem.count({ where: { workspaceId: workspaceId } }),
        prisma.workspaceMember.count({ where: { workspaceId: workspaceId } }),
        prisma.invoice.count({ where: { workspaceId: workspaceId } }),
    ]);

    // 2. Fetch Chart Data
    // A. Project Status
    const projectStatusRaw = await prisma.project.groupBy({
        by: ['status'],
        where: { workspaceId },
        _count: true,
    });
    const projectStatusData = projectStatusRaw.map(item => ({
        name: item.status,
        value: item._count
    }));

    // B. Low Stock Inventory
    const lowStockRaw = await prisma.inventoryItem.findMany({
        where: { workspaceId, quantity: { lt: 20 } },
        orderBy: { quantity: 'asc' },
        take: 5,
        select: { name: true, quantity: true }
    });
    const lowStockData = lowStockRaw.map(item => ({
        name: item.name,
        quantity: item.quantity
    }));

    // C. Team Roles
    const teamRolesRaw = await prisma.workspaceMember.groupBy({
        by: ['role'],
        where: { workspaceId },
        _count: true,
    });
    const teamRolesData = teamRolesRaw.map(item => ({
        name: item.role,
        value: item._count
    }));

    // D. Finance Overview (Last 6 Months Mock-up Logic using Real Data)
    // Fetching last 100 expenses and paid invoices to aggregated in JS
    const recentExpenses = await prisma.expense.findMany({
        where: { workspaceId },
        orderBy: { date: 'desc' },
        take: 100,
        select: { amount: true, date: true }
    });
    const recentRevenue = await prisma.invoice.findMany({
        where: { workspaceId, status: 'PAID' },
        orderBy: { paidAt: 'desc' },
        take: 100,
        select: { totalAmount: true, paidAt: true }
    });

    // Simple Aggregation by Month Name (e.g., "January", "February")
    const financeMap = new Map<string, { income: number; expense: number }>();
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    // Initialize last 6 months
    const today = new Date();
    for (let i = 5; i >= 0; i--) {
        const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
        const key = months[d.getMonth()];
        financeMap.set(key, { income: 0, expense: 0 });
    }

    recentExpenses.forEach(e => {
        const key = months[e.date.getMonth()];
        if (financeMap.has(key)) {
            const current = financeMap.get(key)!;
            financeMap.set(key, { ...current, expense: current.expense + Number(e.amount) });
        }
    });

    recentRevenue.forEach(r => {
        if (!r.paidAt) return;
        const key = months[r.paidAt.getMonth()];
        if (financeMap.has(key)) {
            const current = financeMap.get(key)!;
            financeMap.set(key, { ...current, income: current.income + Number(r.totalAmount) });
        }
    });

    const financeData = Array.from(financeMap.entries()).map(([name, data]) => ({
        name,
        income: data.income,
        expense: data.expense
    }));


    const stats = [
        {
            label: "Active Projects",
            value: projectsCount,
            icon: LayoutDashboard,
            color: "text-blue-500",
        },
        {
            label: "Inventory Items",
            value: inventoryCount,
            icon: Package,
            color: "text-amber-500",
        },
        {
            label: "Team Members",
            value: membersCount,
            icon: Users,
            color: "text-emerald-500",
        },
        {
            label: "Total Invoices",
            value: invoicesCount,
            icon: FileText,
            color: "text-rose-500",
        },
    ];

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Dashboard Overview</h2>
            </div>

            <OnboardingGuide />

            {/* Quick Stats Row */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 drop-shadow-sm">
                {stats.map((item) => (
                    <Card key={item.label} className="overflow-hidden border-none bg-white shadow-md">
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">{item.label}</CardTitle>
                            <item.icon className={`h-4 w-4 ${item.color}`} />
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{item.value}</div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Charts Grid */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mt-4">
                <FinanceChart data={financeData} />
                <ProjectsChart data={projectStatusData} />
                <InventoryAlertChart data={lowStockData} />
                <TeamRolesChart data={teamRolesData} />
            </div>
        </div>
    );
}

export default WorkspaceIdPage;
