"use client";

import { useState, useTransition } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { allocateInventoryItem } from "@/actions/inventory";
import { useRouter } from "next/navigation";

interface AllocationModalProps {
    isOpen: boolean;
    onClose: () => void;
    workspaceId: string;
    itemId: string;
    itemName: string;
    projects: any[];
    maxQuantity: number;
}

export const AllocationModal = ({
    isOpen,
    onClose,
    workspaceId,
    itemId,
    itemName,
    projects,
    maxQuantity
}: AllocationModalProps) => {
    const [projectId, setProjectId] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    const onAllocate = () => {
        if (!projectId || quantity <= 0 || quantity > maxQuantity) return;

        startTransition(() => {
            allocateInventoryItem(workspaceId, itemId, projectId, quantity).then((data) => {
                if (data.success) {
                    router.refresh();
                    onClose();
                } else if (data.error) {
                    alert(data.error);
                }
            });
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Allocate {itemName}</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Project</Label>
                        <Select onValueChange={setProjectId} disabled={isPending}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select a project" />
                            </SelectTrigger>
                            <SelectContent>
                                {projects.map((project) => (
                                    <SelectItem key={project.id} value={project.id}>
                                        {project.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>
                    <div className="space-y-2">
                        <Label>Quantity (Max: {maxQuantity})</Label>
                        <Input
                            type="number"
                            min={1}
                            max={maxQuantity}
                            value={quantity}
                            onChange={(e) => setQuantity(parseInt(e.target.value))}
                            disabled={isPending}
                        />
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={onClose} disabled={isPending}>Cancel</Button>
                    <Button onClick={onAllocate} disabled={isPending || !projectId}>Allocate Item</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
