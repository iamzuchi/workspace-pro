import prisma from "@/lib/db";
import { CreateInventoryModal } from "@/components/inventory/create-inventory-modal";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import {
    Plus,
    Package,
    AlertTriangle,
    DollarSign,
    Layers,
    History,
    MapPin
} from "lucide-react";
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
import { serializeDecimal } from "@/lib/utils";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { WorkSiteManager } from "@/components/inventory/work-site-manager";
import { InventoryHistory } from "@/components/inventory/inventory-history";
import Image from "next/image";

const InventoryPage = async ({ params }: { params: Promise<{ workspaceId: string }> }) => {
    const { workspaceId } = await params;
    const user = await currentUser();
    if (!user) redirect("/login");

    const items = await prisma.inventoryItem.findMany({
        where: { workspaceId },
        include: { workSite: true },
        orderBy: { createdAt: 'desc' }
    });

    const workSites = await prisma.workSite.findMany({
        where: { workspaceId },
        orderBy: { name: 'asc' }
    });

    const projects = await prisma.project.findMany({
        where: { workspaceId },
        select: { id: true, name: true }
    });

    const inventoryRecords = await prisma.inventoryRecord.findMany({
        where: { workspaceId },
        include: { item: true },
        orderBy: { createdAt: 'desc' },
        take: 50
    });

    const totalItems = items.length;
    const lowStockItems = items.filter(item => item.quantity <= item.lowStockThreshold).length;
    const totalValue = items.reduce((acc, item) => acc + (Number(item.unitCost) * item.quantity), 0);

    // Group items by worksite
    const groupedItems: Record<string, typeof items> = {
        "General Inventory": items.filter(item => !item.workSiteId)
    };

    workSites.forEach(site => {
        groupedItems[site.name] = items.filter(item => item.workSiteId === site.id);
    });

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-y-4">
                <div>
                    <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Inventory Management</h2>
                    <p className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                        <MapPin className="h-3 w-3" /> Track materials across work sites and projects
                    </p>
                </div>
                <div className="flex items-center flex-wrap gap-2 w-full sm:w-auto">
                    <WorkSiteManager workspaceId={workspaceId} workSites={workSites} />
                    <CreateInventoryModal workSites={workSites}>
                        <Button className="text-sm h-10 px-4">
                            <Plus className="mr-2 h-4 w-4" /> Add Item
                        </Button>
                    </CreateInventoryModal>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-none shadow-sm bg-zinc-50/50">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Products</CardTitle>
                        <Package className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalItems}</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-rose-50/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Low Stock Alerts</CardTitle>
                        <AlertTriangle className="h-4 w-4 text-rose-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{lowStockItems}</div>
                    </CardContent>
                </Card>
                <Card className="border-none shadow-sm bg-emerald-50/30">
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Inventory Value</CardTitle>
                        <DollarSign className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">${totalValue.toLocaleString()}</div>
                    </CardContent>
                </Card>
            </div>

            <Tabs defaultValue="inventory" className="space-y-4">
                <TabsList className="bg-zinc-100 p-1">
                    <TabsTrigger value="inventory" className="data-[state=active]:bg-white">Inventory</TabsTrigger>
                    <TabsTrigger value="history" className="data-[state=active]:bg-white flex items-center gap-2">
                        <History className="h-4 w-4" /> Usage Records
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="inventory" className="space-y-6">
                    {Object.entries(groupedItems).map(([siteName, siteItems]) => (
                        siteItems.length > 0 && (
                            <section key={siteName} className="space-y-3">
                                <div className="flex items-center gap-2 px-2">
                                    <div className="h-8 w-1 bg-zinc-900 rounded-full" />
                                    <h3 className="text-xl font-semibold tracking-tight">{siteName}</h3>
                                    <Badge variant="secondary" className="ml-2 font-mono">
                                        {siteItems.length} items
                                    </Badge>
                                </div>
                                <Card className="rounded-xl border shadow-sm overflow-x-auto">
                                    <Table>
                                        <TableHeader className="bg-zinc-50/50">
                                            <TableRow>
                                                <TableHead className="w-[100px]">Image</TableHead>
                                                <TableHead>Product</TableHead>
                                                <TableHead>SKU/Category</TableHead>
                                                <TableHead>Stock Level</TableHead>
                                                <TableHead>Unit Cost</TableHead>
                                                <TableHead className="text-right">Actions</TableHead>
                                            </TableRow>
                                        </TableHeader>
                                        <TableBody>
                                            {siteItems.map((item) => (
                                                <TableRow key={item.id} className="group hover:bg-zinc-50/30">
                                                    <TableCell>
                                                        <Link href={`/${workspaceId}/inventory/${item.id}`}>
                                                            <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-zinc-100 border text-zinc-500 hover:opacity-80 transition-opacity">
                                                                {item.image ? (
                                                                    <Image src={item.image} alt={item.name} fill className="object-cover" />
                                                                ) : (
                                                                    <div className="h-full w-full flex items-center justify-center">
                                                                        <Package className="h-6 w-6 text-zinc-400" />
                                                                    </div>
                                                                )}
                                                            </div>
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell className="font-medium">
                                                        <Link href={`/${workspaceId}/inventory/${item.id}`} className="hover:underline text-zinc-900">
                                                            {item.name}
                                                        </Link>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col">
                                                            <span className="text-zinc-500 uppercase text-[10px] font-bold tracking-wider">{item.sku || "NO SKU"}</span>
                                                            <span className="text-xs text-zinc-400">{item.category || "Uncategorized"}</span>
                                                        </div>
                                                    </TableCell>
                                                    <TableCell>
                                                        <div className="flex flex-col gap-1">
                                                            <span className="font-bold text-lg">{item.quantity}</span>
                                                            {item.quantity <= item.lowStockThreshold && (
                                                                <div className="flex items-center text-[10px] text-rose-600 font-semibold uppercase">
                                                                    <AlertTriangle className="h-3 w-3 mr-1" /> Low Stock
                                                                </div>
                                                            )}
                                                        </div>
                                                    </TableCell>
                                                    <TableCell className="font-mono text-zinc-600">${Number(item.unitCost).toFixed(2)}</TableCell>
                                                    <TableCell className="text-right">
                                                        <div className="flex justify-end items-center gap-2">
                                                            <Button variant="ghost" size="icon" asChild className="h-8 w-8">
                                                                <Link href={`/${workspaceId}/inventory/${item.id}`}>
                                                                    <Layers className="h-4 w-4" />
                                                                </Link>
                                                            </Button>
                                                            <InventoryActions
                                                                workspaceId={workspaceId}
                                                                item={serializeDecimal(item)}
                                                                projects={projects}
                                                                workSites={workSites}
                                                            />
                                                        </div>
                                                    </TableCell>
                                                </TableRow>
                                            ))}
                                        </TableBody>
                                    </Table>
                                </Card>
                            </section>
                        )
                    ))}
                    {items.length === 0 && (
                        <div className="h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-xl border-zinc-200">
                            <Package className="h-12 w-12 text-zinc-300 mb-4" />
                            <p className="text-zinc-500 font-medium">No inventory items found.</p>
                            <CreateInventoryModal workSites={workSites}>
                                <Button variant="link" className="text-zinc-900 mt-2">Add your first item</Button>
                            </CreateInventoryModal>
                        </div>
                    )}
                </TabsContent>

                <TabsContent value="history">
                    <InventoryHistory records={inventoryRecords} />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default InventoryPage;
