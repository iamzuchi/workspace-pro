"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Search, Filter, MoreVertical, Edit, Trash, Download } from "lucide-react";
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
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/currency";
import { ExpenseReceiptButton } from "./expense-receipt-button";
import { ExportCsvButton } from "./export-csv-button";
import { deleteExpense } from "@/actions/expense";
import { toast } from "sonner";
import { Role } from "@prisma/client";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface ExpenseTableProps {
    expenses: any[];
    workspaceId: string;
    currencySymbol: string;
    workspace: any;
    userRole: Role | undefined;
}

export const ExpenseTable = ({ 
    expenses, 
    workspaceId, 
    currencySymbol, 
    workspace,
    userRole 
}: ExpenseTableProps) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("all");

    const categories = Array.from(new Set(expenses.map(e => e.category)));

    const filteredExpenses = expenses.filter(expense => {
        const matchesSearch = expense.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                             expense.category.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesCategory = categoryFilter === "all" || expense.category === categoryFilter;
        return matchesSearch && matchesCategory;
    });

    const canEdit = userRole === Role.ADMIN || userRole === Role.ACCOUNTANT;

    const handleDelete = async (id: string) => {
        const res = await deleteExpense(workspaceId, id);
        if (res.success) {
            toast.success("Expense deleted");
        } else {
            toast.error(res.error || "Failed to delete expense");
        }
    };

    return (
        <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-2 flex-1 max-w-sm">
                    <div className="relative flex-1">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search expenses..."
                            className="pl-8 h-9"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                        <SelectTrigger className="w-[150px] h-9">
                            <Filter className="mr-2 h-4 w-4" />
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Categories</SelectItem>
                            {categories.map(cat => (
                                <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center gap-2">
                    <ExportCsvButton 
                        data={filteredExpenses} 
                        filename={`expenses-${workspaceId}-${format(new Date(), "yyyy-MM-dd")}`} 
                        type="EXPENSE" 
                    />
                </div>
            </div>

            <div className="rounded-md border bg-white">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Date</TableHead>
                            <TableHead>Description</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Amount</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredExpenses.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={6} className="h-24 text-center text-muted-foreground">
                                    No expenses found matching your filters.
                                </TableCell>
                            </TableRow>
                        )}
                        {filteredExpenses.map((expense) => (
                            <TableRow key={expense.id}>
                                <TableCell>{format(new Date(expense.date), "MMM d, yyyy")}</TableCell>
                                <TableCell className="font-medium">{expense.title}</TableCell>
                                <TableCell>
                                    <span className="inline-flex items-center rounded-md bg-zinc-100 px-2 py-1 text-xs font-medium text-zinc-600 ring-1 ring-inset ring-zinc-500/10">
                                        {expense.category}
                                    </span>
                                </TableCell>
                                <TableCell className="text-rose-600 font-semibold">
                                    -{formatCurrency(Number(expense.amount), currencySymbol)}
                                </TableCell>
                                <TableCell>
                                    <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset ${
                                        expense.status === "PAID" 
                                        ? "bg-emerald-50 text-emerald-700 ring-emerald-600/20" 
                                        : "bg-amber-50 text-amber-700 ring-amber-600/20"
                                    }`}>
                                        {expense.status || "PAID"}
                                    </span>
                                </TableCell>
                                <TableCell className="text-right">
                                    <div className="flex items-center justify-end gap-2">
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
                                        {canEdit && (
                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button variant="ghost" size="icon" className="h-8 w-8">
                                                        <MoreVertical className="h-4 w-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem className="cursor-pointer">
                                                        <Edit className="mr-2 h-4 w-4" /> Edit
                                                    </DropdownMenuItem>
                                                    <AlertDialog>
                                                        <AlertDialogTrigger asChild>
                                                            <DropdownMenuItem 
                                                                className="cursor-pointer text-destructive focus:text-destructive"
                                                                onSelect={(e) => e.preventDefault()}
                                                            >
                                                                <Trash className="mr-2 h-4 w-4" /> Delete
                                                            </DropdownMenuItem>
                                                        </AlertDialogTrigger>
                                                        <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                                                                <AlertDialogDescription>
                                                                    This action cannot be undone. This will permanently delete this expense
                                                                    record from your workspace.
                                                                </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                                <AlertDialogAction 
                                                                    onClick={() => handleDelete(expense.id)}
                                                                    className="bg-rose-600 hover:bg-rose-700 text-white"
                                                                >
                                                                    Delete
                                                                </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                        </AlertDialogContent>
                                                    </AlertDialog>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        )}
                                    </div>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
