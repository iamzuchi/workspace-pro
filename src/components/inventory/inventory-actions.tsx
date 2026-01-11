"use client";

import {
    Edit,
    MoreHorizontal,
    Trash,
    Link2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTransition, useState } from "react";
import { deleteInventoryItem } from "@/actions/inventory";
import { useRouter } from "next/navigation";
import { EditInventoryModal } from "@/components/inventory/edit-inventory-modal";
import { AllocationModal } from "@/components/inventory/allocation-modal";

interface InventoryActionsProps {
    workspaceId: string;
    item: any;
    projects: any[];
}

export const InventoryActions = ({ workspaceId, item, projects }: InventoryActionsProps) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();
    const [isAllocationOpen, setIsAllocationOpen] = useState(false);
    const [isEditOpen, setIsEditOpen] = useState(false);

    const onDelete = () => {
        if (confirm("Are you sure you want to delete this item?")) {
            startTransition(() => {
                deleteInventoryItem(workspaceId, item.id).then((data) => {
                    if (data.success) {
                        router.refresh();
                    } else if (data.error) {
                        alert(data.error);
                    }
                });
            });
        }
    };

    return (
        <>
            <AllocationModal
                isOpen={isAllocationOpen}
                onClose={() => setIsAllocationOpen(false)}
                workspaceId={workspaceId}
                itemId={item.id}
                itemName={item.name}
                projects={projects}
                maxQuantity={item.quantity}
            />
            <EditInventoryModal
                isOpen={isEditOpen}
                onClose={() => setIsEditOpen(false)}
                workspaceId={workspaceId}
                item={item}
            />
            <DropdownMenu>
                <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                    </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setIsAllocationOpen(true)}>
                        <Link2 className="mr-2 h-4 w-4" />
                        Allocate to Project
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setIsEditOpen(true)}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                        <Trash className="mr-2 h-4 w-4" />
                        Delete
                    </DropdownMenuItem>
                </DropdownMenuContent>
            </DropdownMenu>
        </>
    );
};
