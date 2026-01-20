import prisma from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { ChevronLeft, Package, History, DollarSign } from "lucide-react";
import Link from "next/link";
import { serializeDecimal } from "@/lib/utils";
import { format } from "date-fns";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

const InventoryDetailsPage = async ({
    params
}: {
    params: Promise<{ workspaceId: string; inventoryId: string }>
}) => {
    const { workspaceId, inventoryId } = await params;
    const user = await currentUser();
    if (!user) redirect("/login");

    const item = await prisma.inventoryItem.findUnique({
        where: {
            id: inventoryId,
            workspaceId: workspaceId
        },
        include: {
            allocations: {
                include: {
                    project: true
                },
                orderBy: {
                    allocatedAt: 'desc'
                }
            }
        }
    });

    if (!item) redirect(`/${workspaceId}/inventory`);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" asChild>
                    <Link href={`/${workspaceId}/inventory`}>
                        <ChevronLeft className="h-5 w-5" />
                    </Link>
                </Button>
                <div>
                    <h2 className="text-3xl font-bold tracking-tight">{item.name}</h2>
                    <p className="text-muted-foreground ml-1">
                        SKU: {item.sku || "N/A"}
                    </p>
                </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Current Stock</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{item.quantity}</div>
                        {item.quantity <= item.lowStockThreshold && (
                            <p className="text-xs text-rose-500 mt-1 font-medium">Low Stock Warning</p>
                        )}
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Unit Cost</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${Number(item.unitCost).toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${(Number(item.unitCost) * item.quantity).toFixed(2)}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Allocations</CardTitle>
                        <History className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{item.allocations.length}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-7">
                <Card className="col-span-4 md:col-span-5 lg:col-span-5">
                    <CardHeader>
                        <CardTitle>Usage History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Project</TableHead>
                                    <TableHead>Date</TableHead>
                                    <TableHead>Quantity Used</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {item.allocations.length === 0 && (
                                    <TableRow>
                                        <TableCell colSpan={3} className="h-24 text-center text-muted-foreground">
                                            No usage history recorded.
                                        </TableCell>
                                    </TableRow>
                                )}
                                {item.allocations.map((allocation) => (
                                    <TableRow key={allocation.id}>
                                        <TableCell className="font-medium">
                                            <Link href={`/${workspaceId}/projects/${allocation.projectId}`} className="hover:underline">
                                                {allocation.project.name}
                                            </Link>
                                        </TableCell>
                                        <TableCell>{format(new Date(allocation.allocatedAt), "MMM dd, yyyy")}</TableCell>
                                        <TableCell>{allocation.quantity}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                <Card className="col-span-3 md:col-span-2 lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Item Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="aspect-square relative rounded-md overflow-hidden border bg-zinc-50">
                            {item.image ? (
                                <Image
                                    src={item.image}
                                    alt={item.name}
                                    fill
                                    className="object-cover"
                                />
                            ) : (
                                <div className="h-full w-full flex items-center justify-center text-zinc-400">
                                    <Package className="h-12 w-12" />
                                </div>
                            )}
                        </div>
                        <div className="grid gap-1">
                            <span className="text-sm font-medium text-muted-foreground">Category</span>
                            <span>{item.category || "Uncategorized"}</span>
                        </div>
                        <div className="grid gap-1">
                            <span className="text-sm font-medium text-muted-foreground">Low Stock Threshold</span>
                            <span>{item.lowStockThreshold} units</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default InventoryDetailsPage;
