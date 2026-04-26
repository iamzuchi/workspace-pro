"use client";

import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { ArrowRight, ArrowLeft, Package, User, PlusCircle, MinusCircle, Truck } from "lucide-react";

interface InventoryHistoryProps {
    records: any[];
}

const getTypeColor = (type: string) => {
    switch (type) {
        case "STOCK_ADD": return "bg-emerald-100 text-emerald-700 border-emerald-200";
        case "STOCK_ADJUST": return "bg-zinc-100 text-zinc-700 border-zinc-200";
        case "PROJECT_ALLOCATE": return "bg-blue-100 text-blue-700 border-blue-200";
        case "MEMBER_ASSIGN": return "bg-violet-100 text-violet-700 border-violet-200";
        case "TASK_USE": return "bg-rose-100 text-rose-700 border-rose-200";
        default: return "bg-zinc-100 text-zinc-700 border-zinc-200";
    }
};

const getTypeIcon = (type: string) => {
    switch (type) {
        case "STOCK_ADD": return <PlusCircle className="h-3 w-3 mr-1" />;
        case "STOCK_ADJUST": return <ArrowLeft className="h-3 w-3 mr-1" />;
        case "PROJECT_ALLOCATE": return <Truck className="h-3 w-3 mr-1" />;
        case "MEMBER_ASSIGN": return <User className="h-3 w-3 mr-1" />;
        case "TASK_USE": return <MinusCircle className="h-3 w-3 mr-1" />;
        default: return null;
    }
};

export const InventoryHistory = ({ records }: InventoryHistoryProps) => {
    return (
        <div className="rounded-xl border shadow-sm overflow-hidden bg-white">
            <Table>
                <TableHeader className="bg-zinc-50/50">
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>Quantity</TableHead>
                        <TableHead>Actor</TableHead>
                        <TableHead>Notes</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {records.length === 0 && (
                        <TableRow>
                            <TableCell colSpan={6} className="h-32 text-center text-zinc-500">
                                <History className="h-8 w-8 mx-auto mb-2 opacity-20" />
                                No records found.
                            </TableCell>
                        </TableRow>
                    )}
                    {records.map((record) => (
                        <TableRow key={record.id} className="hover:bg-zinc-50/30">
                            <TableCell className="text-zinc-500 font-mono text-[11px]">
                                {format(new Date(record.createdAt), "MMM d, HH:mm")}
                            </TableCell>
                            <TableCell className="font-medium">
                                {record.item?.name}
                            </TableCell>
                            <TableCell>
                                <Badge variant="outline" className={`text-[10px] uppercase font-bold py-0.5 px-2 flex items-center w-fit ${getTypeColor(record.type)}`}>
                                    {getTypeIcon(record.type)}
                                    {record.type.replace("_", " ")}
                                </Badge>
                            </TableCell>
                            <TableCell>
                                <span className={`font-mono font-bold ${record.quantity > 0 ? "text-emerald-600" : "text-rose-600"}`}>
                                    {record.quantity > 0 ? `+${record.quantity}` : record.quantity}
                                </span>
                            </TableCell>
                            <TableCell className="text-zinc-600 text-sm">
                                {record.actorName || "System"}
                            </TableCell>
                            <TableCell className="text-zinc-500 text-xs italic">
                                {record.notes || "-"}
                            </TableCell>
                        </TableRow>
                    ))}
                </TableBody>
            </Table>
        </div>
    );
};

const History = ({ className }: { className?: string }) => (
    <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
);
