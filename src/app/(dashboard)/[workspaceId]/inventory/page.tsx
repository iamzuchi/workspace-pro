import prisma from "@/lib/db";
import { CreateInventoryModal } from "@/components/inventory/create-inventory-modal";
import { Button } from "@/components/ui/button";
import {
    Plus,
    Package,
    AlertTriangle,
    DollarSign,
    Layers
} from "lucide-react";
import { format } from "date-fns";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { InventoryActions } from "@/components/inventory/inventory-actions";
import Image from "next/image";
import { serializeDecimal } from "@/lib/utils";

const InventoryPage = async ({ params }: { params: Promise<{ workspaceId: string }> }) => {
    const { workspaceId } = await params;
    const user = await currentUser();
    if (!user) redirect("/login");

    const items = await prisma.inventoryItem.findMany({
        where: {
            workspaceId: workspaceId
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const projects = await prisma.project.findMany({
        where: {
            workspaceId: workspaceId
        },
        select: {
            id: true,
            name: true
        }
    });

    const totalItems = items.length;
    const lowStockItems = items.filter(item => item.quantity <= item.lowStockThreshold).length;
    const totalValue = items.reduce((acc, item) => acc + (Number(item.unitCost) * item.quantity), 0);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Inventory Tracker</h2>
                <div className="flex items-center space-x-2">
                    <CreateInventoryModal>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> Add Item
                        </Button>
                    </CreateInventoryModal>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalItems}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{lowStockItems}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            <Card className="rounded-xl border shadow">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[100px]">Image</TableHead>
                            <TableHead>Product</TableHead>
                            <TableHead>SKU</TableHead>
                            <TableHead>Category</TableHead>
                            <TableHead>Stock</TableHead>
                            <TableHead>Unit Cost</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {items.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="h-24 text-center text-zinc-500">
                                    No items found in inventory.
                                </TableCell>
                            </TableRow>
                        )}
                        {items.map((item) => (
                            <TableRow key={item.id} className="group">
                                <TableCell>
                                    <div className="relative h-10 w-10 rounded-md overflow-hidden bg-zinc-100 border text-zinc-500">
                                        {item.image ? (
                                            <Image
                                                src={item.image}
                                                alt={item.name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="h-full w-full flex items-center justify-center">
                                                <Layers className="h-5 w-5 text-zinc-400" />
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="font-medium">{item.name}</TableCell>
                                <TableCell className="text-zinc-500 uppercase text-xs">{item.sku || "N/A"}</TableCell>
                                <TableCell>
                                    <Badge variant="outline" className="text-[10px] font-normal">
                                        {item.category || "Uncategorized"}
                                    </Badge>
                                </TableCell>
                                <TableCell>
                                    <div className="flex items-center gap-2">
                                        <span className="font-bold">{item.quantity}</span>
                                        {item.quantity <= item.lowStockThreshold && (
                                            <Badge variant="destructive" className="text-[9px] uppercase h-4">Low Stock</Badge>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>${Number(item.unitCost).toFixed(2)}</TableCell>
                                <TableCell className="text-right">
                                    <InventoryActions
                                        workspaceId={workspaceId}
                                        item={serializeDecimal(item)}
                                        projects={projects}
                                    />
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </Card>
        </div>
    );
};
export default InventoryPage;
