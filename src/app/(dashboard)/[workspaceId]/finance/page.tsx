import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, CreditCard, Clock, AlertCircle, TrendingDown, Wallet } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format, startOfMonth, subMonths } from "date-fns";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { RevenueChart } from "@/components/finance/revenue-chart";
import { CreateExpenseModal } from "@/components/finance/create-expense-modal";
import { deleteExpense } from "@/actions/expense"; // Though actions are usually client-side triggered, we handle delete via a client component or simpler form here.
// Actually, for delete in a table, we should use a client component or a form with server action.
// For simplicity in this iteration, I'll display the list. Deletion might need a small client component.
import { ExpenseReceiptButton } from "@/components/finance/expense-receipt-button";
import { formatCurrency } from "@/lib/currency";

const FinancePage = async ({ params }: { params: Promise<{ workspaceId: string }> }) => {
    const { workspaceId } = await params;
    const user = await currentUser();
    if (!user) redirect("/login");

    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { name: true, address: true, logo: true, currency: true }
    });

    if (!workspace) redirect("/");

    const invoices = await prisma.invoice.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
        include: {
            project: true,
            team: true,
            payments: true
        }
    });

    const payments = await prisma.payment.findMany({
        where: { workspaceId },
        orderBy: { date: 'desc' },
        include: { invoice: true }
    });

    const expenses = await prisma.expense.findMany({
        where: { workspaceId },
        orderBy: { date: 'desc' }
    });

    // Stats Calculations
    const totalRevenue = payments.reduce((acc, p) => acc + Number(p.amount), 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + Number(e.amount), 0);
    const pendingAmount = invoices.reduce((acc, inv) => {
        const paid = inv.payments.reduce((pAcc, p) => pAcc + Number(p.amount), 0);
        return acc + (Number(inv.totalAmount) - paid);
    }, 0);
    const sentInvoices = invoices.filter(inv => inv.status === "SENT").length;

    // Net Income
    const netIncome = totalRevenue - totalExpenses;

    // Chart Data Preparation (Last 6 months)
    const chartData = Array.from({ length: 6 }).map((_, i) => {
        const date = subMonths(new Date(), 5 - i);
        const monthLabel = format(date, "MMM");
        const monthStart = startOfMonth(date);
        const nextMonth = startOfMonth(subMonths(date, -1));

        const monthPayments = payments.filter(p => p.date >= monthStart && p.date < nextMonth);
        const revenue = monthPayments.reduce((acc, p) => acc + Number(p.amount), 0);

        const monthExpenses = expenses.filter(e => e.date >= monthStart && e.date < nextMonth);
        const expenseAmount = monthExpenses.reduce((acc, e) => acc + Number(e.amount), 0);

        return { month: monthLabel, revenue, expenses: expenseAmount };
    });

    const currencySymbol = workspace.currency || "USD";

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">Finance Dashboard</h2>
                    <p className="text-muted-foreground">Manage your invoices, payments, expenses, and financial reports.</p>
                </div>
                <div className="flex items-center space-x-2">
                    <CreateExpenseModal />
                    <Button asChild>
                        <Link href={`/${workspaceId}/finance/create`}>
                            <Plus className="mr-2 h-4 w-4" /> Create Invoice
                        </Link>
                    </Button>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalRevenue, currencySymbol)}</div>
                        <p className="text-xs text-muted-foreground">Total payments received</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <TrendingDown className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(totalExpenses, currencySymbol)}</div>
                        <p className="text-xs text-muted-foreground">Total outgoing expenses</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                        <Wallet className="h-4 w-4 text-blue-500" />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${netIncome >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                            {formatCurrency(netIncome, currencySymbol)}
                        </div>
                        <p className="text-xs text-muted-foreground">Revenue - Expenses</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Payments</CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(pendingAmount, currencySymbol)}</div>
                        <p className="text-xs text-muted-foreground">Outstanding from invoices</p>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="overview" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="overview">Overview</TabsTrigger>
                    <TabsTrigger value="expenses">Expenses</TabsTrigger>
                    <TabsTrigger value="invoices">Invoices</TabsTrigger>
                    <TabsTrigger value="payments">Payments</TabsTrigger>
                </TabsList>
                <TabsContent value="overview" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Financial Overview</CardTitle>
                            <CardDescription>Revenue vs Expenses for the last 6 months.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <RevenueChart data={chartData} />
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="expenses" className="space-y-4">
                    <div className="rounded-md border bg-white">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Description</TableHead>
                                    <TableHead>Category</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead className="text-right">Receipt</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {expenses.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No expenses recorded.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {expenses.map((expense) => (
                                    <TableRow key={expense.id}>
                                        <TableCell>{format(expense.date, "MMM d, yyyy")}</TableCell>
                                        <TableCell className="font-medium">{expense.title}</TableCell>
                                        <TableCell>
                                            <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-500/10">
                                                {expense.category}
                                            </span>
                                        </TableCell>
                                        <TableCell className="text-rose-600 font-semibold">
                                            -{formatCurrency(Number(expense.amount), currencySymbol)}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <ExpenseReceiptButton
                                                expense={{
                                                    ...expense,
                                                    amount: Number(expense.amount),
                                                }}
                                                workspace={{
                                                    name: workspace.name,
                                                    address: workspace.address,
                                                    logo: workspace.logo,
                                                    currency: currencySymbol
                                                }}
                                            />
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
                <TabsContent value="invoices" className="space-y-4">
                    <div className="rounded-md border bg-white">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Number</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Paid</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Project</TableHead>
                                    <TableHead>Team</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {invoices.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center">
                                            No invoices found.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {invoices.map((invoice) => {
                                    const paid = invoice.payments.reduce((acc, p) => acc + Number(p.amount), 0);
                                    return (
                                        <TableRow key={invoice.id}>
                                            <TableCell className="font-medium">#{invoice.number}</TableCell>
                                            <TableCell>
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${invoice.status === 'PAID' ? 'bg-emerald-100 text-emerald-700' :
                                                    invoice.status === 'SENT' ? 'bg-blue-100 text-blue-700' :
                                                        'bg-zinc-100 text-zinc-700'
                                                    }`}>
                                                    {invoice.status}
                                                </span>
                                            </TableCell>
                                            <TableCell>{formatCurrency(Number(invoice.totalAmount), currencySymbol)}</TableCell>
                                            <TableCell>{formatCurrency(paid, currencySymbol)}</TableCell>
                                            <TableCell>{invoice.dueDate ? format(invoice.dueDate, "MMM d, yyyy") : "-"}</TableCell>
                                            <TableCell>{invoice.project?.name || "-"}</TableCell>
                                            <TableCell>{invoice.team?.name || "-"}</TableCell>
                                            <TableCell className="text-right">
                                                <Button size="sm" variant="ghost" asChild>
                                                    <Link href={`/${workspaceId}/invoices/${invoice.id}`}>View</Link>
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    )
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
                <TabsContent value="payments" className="space-y-4">
                    <div className="rounded-md border bg-white">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Reference</TableHead>
                                    <TableHead>Invoice</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {payments.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={5} className="h-24 text-center">
                                            No payments found.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {payments.map((payment) => (
                                    <TableRow key={payment.id}>
                                        <TableCell>{format(payment.date, "MMM d, yyyy")}</TableCell>
                                        <TableCell className="text-emerald-600 font-semibold">+{formatCurrency(Number(payment.amount), currencySymbol)}</TableCell>
                                        <TableCell>{payment.method}</TableCell>
                                        <TableCell>{payment.reference || "-"}</TableCell>
                                        <TableCell>#{payment.invoice?.number || "N/A"}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
            </Tabs>
        </div>
    );
};
export default FinancePage;
