/* eslint-disable @typescript-eslint/no-explicit-any */
import React from "react";
import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus, TrendingUp, Clock, TrendingDown, Wallet, Trash } from "lucide-react";
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
import { formatCurrency } from "@/lib/currency";
import { ExportCsvButton } from "@/components/finance/export-csv-button";
import { DeleteInvoiceButton } from "@/components/finance/delete-invoice-button";
import { ExpenseTable } from "@/components/finance/expense-table";
import { Role } from "@prisma/client";
import { DeletePaymentButton } from "../../../../components/finance/delete-payment-button";
import { serializeDecimal } from "@/lib/utils";

const FinancePage = async ({ params }: { params: Promise<{ workspaceId: string }> }) => {
    const { workspaceId } = await params;
    const user = await currentUser();
    if (!user) redirect("/login");

    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { name: true, address: true, logo: true, currency: true }
    });

    if (!workspace) redirect("/");

    const member = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: user.id! } }
    });

    const userRole = member?.role;

    const invoices = await prisma.invoice.findMany({
        where: { workspaceId },
        orderBy: { createdAt: 'desc' },
        include: {
            project: true,
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
        orderBy: { date: 'desc' },
        include: {
            project: true,
            team: true,
            teamMember: true
        } as any
    });

    const teams = await prisma.team.findMany({
        where: { workspaceId }
    });

    const members = await prisma.teamMember.findMany({
        where: { team: { workspaceId } }
    });

    // Serialize data for Client Components
    const serializedInvoices = serializeDecimal(invoices);
    const serializedPayments = serializeDecimal(payments);
    const serializedExpenses = serializeDecimal(expenses);

    // Stats Calculations
    const totalRevenue = payments.reduce((acc, p) => acc + Number(p.amount || 0), 0);
    const totalExpenses = expenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);
    
    const pendingInvoices = invoices.filter(inv => inv.status === "SENT" || inv.status === "OVERDUE");
    const pendingAmount = pendingInvoices.reduce((acc, inv) => {
        const paid = inv.payments.reduce((pAcc, p) => pAcc + Number(p.amount || 0), 0);
        const remaining = Number(inv.totalAmount || 0) - paid;
        return acc + Math.max(0, remaining);
    }, 0);
    
    const pendingCount = pendingInvoices.length;

    // Net Income
    const netIncome = totalRevenue - totalExpenses;

    const currencySymbol = workspace.currency || "USD";

    // Chart Data Preparation (Last 6 months)
    const chartData = Array.from({ length: 6 }).map((_, i) => {
        const date = subMonths(new Date(), 5 - i);
        const monthLabel = format(date, "MMM");
        const monthStart = startOfMonth(date);
        const nextMonth = startOfMonth(subMonths(date, -1));

        const monthPayments = payments.filter(p => p.date >= monthStart && p.date < nextMonth);
        const revenue = monthPayments.reduce((acc, p) => acc + Number(p.amount || 0), 0);

        const monthExpenses = expenses.filter(e => e.date >= monthStart && e.date < nextMonth);
        const expenseAmount = monthExpenses.reduce((acc, e) => acc + Number(e.amount || 0), 0);

        return { month: monthLabel, revenue, expenses: expenseAmount };
    });

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-y-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Finance Dashboard</h2>
                    <p className="text-sm text-muted-foreground">Manage your invoices, payments, expenses, and financial reports.</p>
                </div>
                <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
                    <CreateExpenseModal teams={teams} members={members} />
                    <Button asChild className="w-full sm:w-auto">
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
                        <p className="text-xs text-muted-foreground">Lifetime incoming payments</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Expenses</CardTitle>
                        <TrendingDown className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">-{formatCurrency(totalExpenses, currencySymbol)}</div>
                        <p className="text-xs text-muted-foreground">Lifetime outgoing expenses</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Net Income</CardTitle>
                        <Wallet className={`h-4 w-4 ${netIncome >= 0 ? "text-emerald-500" : "text-rose-500"}`} />
                    </CardHeader>
                    <CardContent>
                        <div className={`text-2xl font-bold ${netIncome >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                            {netIncome < 0 ? "-" : ""}{formatCurrency(Math.abs(netIncome), currencySymbol)}
                        </div>
                        <p className="text-xs text-muted-foreground">Revenue minus expenses</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Pending Invoices</CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{formatCurrency(pendingAmount, currencySymbol)}</div>
                        <p className="text-xs text-muted-foreground">{pendingCount} pending invoices</p>
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
                    <ExpenseTable 
                        expenses={serializedExpenses} 
                        workspaceId={workspaceId} 
                        currencySymbol={currencySymbol}
                        workspace={workspace}
                        userRole={userRole}
                    />
                </TabsContent>
                <TabsContent value="invoices" className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium">Invoices</h3>
                        <ExportCsvButton data={serializedInvoices} filename={`invoices-${workspaceId}`} type="INVOICE" />
                    </div>
                    <div className="rounded-md border bg-white overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Number</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>VAT (Tax)</TableHead>
                                    <TableHead>Total</TableHead>
                                    <TableHead>Paid</TableHead>
                                    <TableHead>Due Date</TableHead>
                                    <TableHead>Project</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {serializedInvoices.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={8} className="h-24 text-center">
                                            No invoices found.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {serializedInvoices.map((invoice: any) => {
                                    const paid = invoice.payments.reduce((acc: number, p: any) => acc + Number(p.amount || 0), 0);
                                    return (
                                        <TableRow key={invoice.id}>
                                            <TableCell className="font-medium">#{invoice.number}</TableCell>
                                            <TableCell>
                                                <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                                    invoice.status === "PAID" 
                                                    ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" 
                                                    : invoice.status === "SENT" 
                                                    ? "bg-blue-50 text-blue-700 ring-blue-600/20"
                                                    : invoice.status === "OVERDUE"
                                                    ? "bg-rose-50 text-rose-700 ring-rose-600/10"
                                                    : "bg-zinc-50 text-zinc-600 ring-zinc-500/10"
                                                }`}>
                                                    {invoice.status}
                                                </span>
                                            </TableCell>
                                            <TableCell>{formatCurrency(Number(invoice.taxAmount || 0), currencySymbol)}</TableCell>
                                            <TableCell className="font-semibold">{formatCurrency(Number(invoice.totalAmount || 0), currencySymbol)}</TableCell>
                                            <TableCell className="text-emerald-600 font-medium">{formatCurrency(paid, currencySymbol)}</TableCell>
                                            <TableCell>{invoice.dueDate ? format(new Date(invoice.dueDate), "MMM d, y") : 'No due date'}</TableCell>
                                            <TableCell>{invoice.project?.name || '-'}</TableCell>
                                            <TableCell className="text-right space-x-2">
                                                <Button size="sm" variant="ghost" asChild>
                                                    <Link href={`/${workspaceId}/invoices/${invoice.id}`}>View</Link>
                                                </Button>
                                                {(userRole === Role.ADMIN || userRole === Role.ACCOUNTANT) && <DeleteInvoiceButton workspaceId={workspaceId} invoiceId={invoice.id} />}
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </div>
                </TabsContent>
                <TabsContent value="payments" className="space-y-4">
                    <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg font-medium">Recent Payments</h3>
                        <ExportCsvButton data={serializedPayments} filename={`payments-${workspaceId}`} type="INVOICE" /> 
                    </div>
                    <div className="rounded-md border bg-white overflow-x-auto">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Amount</TableHead>
                                    <TableHead>Invoice</TableHead>
                                    <TableHead>Method</TableHead>
                                    <TableHead>Reference</TableHead>
                                    <TableHead className="text-right">Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {serializedPayments.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                            No payment history found.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {serializedPayments.map((payment: any) => (
                                    <TableRow key={payment.id}>
                                        <TableCell>{format(new Date(payment.date), "MMM d, yyyy")}</TableCell>
                                        <TableCell className="text-emerald-600 font-semibold">
                                            +{formatCurrency(Number(payment.amount), currencySymbol)}
                                        </TableCell>
                                        <TableCell>
                                            {payment.invoice ? (
                                                <Link href={`/${workspaceId}/invoices/${payment.invoice.id}`} className="text-blue-600 hover:underline">
                                                    #{payment.invoice.number}
                                                </Link>
                                            ) : '-'}
                                        </TableCell>
                                        <TableCell>{payment.method || '-'}</TableCell>
                                        <TableCell className="text-xs text-muted-foreground">{payment.reference || '-'}</TableCell>
                                        <TableCell className="text-right">
                                            {(userRole === Role.ADMIN || userRole === Role.ACCOUNTANT) && <DeletePaymentButton workspaceId={workspaceId} paymentId={payment.id} />}
                                        </TableCell>
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
