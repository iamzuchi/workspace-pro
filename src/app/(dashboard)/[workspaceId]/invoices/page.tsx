import prisma from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

const InvoicesPage = async ({ params }: { params: Promise<{ workspaceId: string }> }) => {
    const { workspaceId } = await params;
    const user = await currentUser();
    if (!user) redirect("/login");

    const invoices = await prisma.invoice.findMany({
        where: {
            workspaceId: workspaceId
        },
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            contractor: true,
            project: true
        }
    });

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Invoices</h2>
                <div className="flex items-center space-x-2">
                    <Button asChild>
                        <Link href={`/${workspaceId}/invoices/create`}>
                            <Plus className="mr-2 h-4 w-4" /> Create Invoice
                        </Link>
                    </Button>
                </div>
            </div>
            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Number</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Due Date</TableHead>
                            <TableHead>Project</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoices.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="h-24 text-center">
                                    No invoices found.
                                </TableCell>
                            </TableRow>
                        )}
                        {invoices.map((invoice) => (
                            <TableRow key={invoice.id}>
                                <TableCell className="font-medium">{invoice.number}</TableCell>
                                <TableCell>{invoice.status}</TableCell>
                                <TableCell>${Number(invoice.totalAmount).toFixed(2)}</TableCell>
                                <TableCell>{invoice.dueDate ? format(invoice.dueDate, "MMM d, yyyy") : "-"}</TableCell>
                                <TableCell>{invoice.project?.name || "-"}</TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
};
export default InvoicesPage;
