"use client";

import { useState, useTransition, useEffect } from "react";
import { Package, Plus, Trash, History, Construction } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
    Select, 
    SelectContent, 
    SelectItem, 
    SelectTrigger, 
    SelectValue 
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
    recordTaskUsage, 
    getMemberStock, 
    getTaskUsages 
} from "@/actions/inventory";
import { toast } from "sonner";

interface TaskMaterialSectionProps {
    workspaceId: string;
    projectId: string;
    taskId: string;
    teamMemberId?: string | null;
}

export const TaskMaterialSection = ({
    workspaceId,
    projectId,
    taskId,
    teamMemberId
}: TaskMaterialSectionProps) => {
    const [isPending, startTransition] = useTransition();
    const [memberStock, setMemberStock] = useState<any[]>([]);
    const [usages, setUsages] = useState<any[]>([]);
    const [selectedStockId, setSelectedStockId] = useState<string>("");
    const [quantity, setQuantity] = useState<string>("1");
    const [notes, setNotes] = useState<string>("");

    const fetchData = async () => {
        if (teamMemberId && teamMemberId !== "none") {
            const stock = await getMemberStock(projectId, teamMemberId);
            setMemberStock(stock);
        } else {
            setMemberStock([]);
        }
        const taskUsages = await getTaskUsages(taskId);
        setUsages(taskUsages);
    };

    useEffect(() => {
        fetchData();
    }, [taskId, teamMemberId]);

    const onRecordUsage = () => {
        if (!selectedStockId || !quantity) return;

        startTransition(() => {
            recordTaskUsage(workspaceId, selectedStockId, {
                taskId,
                teamMemberInventoryId: selectedStockId,
                quantity: Number(quantity),
                notes
            }).then((data) => {
                if (data.error) toast.error(data.error);
                if (data.success) {
                    toast.success(data.success);
                    setSelectedStockId("");
                    setQuantity("1");
                    setNotes("");
                    fetchData();
                }
            });
        });
    };

    return (
        <div className="space-y-6">
            <div className="bg-zinc-50 border rounded-xl p-4 space-y-4">
                <div className="flex items-center gap-2 mb-2">
                    <Construction className="h-4 w-4 text-zinc-900" />
                    <h4 className="text-sm font-bold uppercase tracking-tight">Record Material Usage</h4>
                </div>
                
                {!teamMemberId || teamMemberId === "none" ? (
                    <div className="text-xs text-orange-600 bg-orange-50 p-3 rounded-lg border border-orange-100 italic">
                        Please assign a team member to this task to record material usage from their stock.
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">Select Material</label>
                                <Select value={selectedStockId} onValueChange={setSelectedStockId}>
                                    <SelectTrigger className="bg-white">
                                        <SelectValue placeholder="Select from your stock" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {memberStock.length === 0 && (
                                            <div className="p-4 text-center text-xs text-zinc-400">
                                                No materials held by this member.
                                            </div>
                                        )}
                                        {memberStock.map((stock) => (
                                            <SelectItem key={stock.id} value={stock.id}>
                                                {stock.item.name} ({stock.quantity} available)
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-1.5">
                                <label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">Quantity</label>
                                <Input 
                                    type="number" 
                                    className="bg-white"
                                    value={quantity} 
                                    onChange={(e) => setQuantity(e.target.value)}
                                    placeholder="Amount used"
                                />
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[10px] font-bold uppercase text-zinc-500 ml-1">Observation / Note</label>
                            <Input 
                                className="bg-white"
                                value={notes} 
                                onChange={(e) => setNotes(e.target.value)}
                                placeholder="Optional usage notes..."
                            />
                        </div>
                        <Button 
                            disabled={isPending || !selectedStockId} 
                            onClick={onRecordUsage}
                            className="w-full h-11 sm:h-10"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Record Usage
                        </Button>
                    </div>
                )}
            </div>

            <div className="space-y-3">
                <div className="flex items-center justify-between px-1">
                    <div className="flex items-center gap-2">
                        <History className="h-4 w-4 text-zinc-500" />
                        <h4 className="text-sm font-semibold">Usage History</h4>
                    </div>
                    <Badge variant="outline" className="font-mono text-[10px]">
                        {usages.length} entries
                    </Badge>
                </div>

                <div className="space-y-2">
                    {usages.length === 0 && (
                        <div className="h-24 flex items-center justify-center border border-dashed rounded-xl text-zinc-400 text-sm">
                            No materials recorded for this task.
                        </div>
                    )}
                    {usages.map((usage) => (
                        <div key={usage.id} className="flex items-center justify-between p-3 border rounded-lg bg-white shadow-sm">
                            <div className="flex items-center gap-3">
                                <div className="h-8 w-8 rounded-full bg-zinc-100 flex items-center justify-center">
                                    <Package className="h-4 w-4 text-zinc-500" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold">{usage.teamMemberInventory.item.name}</p>
                                    <p className="text-[10px] text-zinc-500 uppercase font-medium">Used by {usage.teamMemberInventory.teamMember.name}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="text-right">
                                    <p className="text-sm font-bold text-rose-600">-{usage.quantity}</p>
                                    <p className="text-[10px] text-zinc-400 font-mono italic">
                                        {new Date(usage.createdAt).toLocaleDateString()}
                                    </p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
