"use client";

import { useState, useTransition } from "react";
import { Plus, Trash, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
    createWorkSite, 
    updateWorkSite, 
    deleteWorkSite 
} from "@/actions/worksite";
import { toast } from "sonner";

interface WorkSiteManagerProps {
    workspaceId: string;
    workSites: any[];
}

export const WorkSiteManager = ({ workspaceId, workSites }: WorkSiteManagerProps) => {
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [name, setName] = useState("");
    const [editingId, setEditingId] = useState<string | null>(null);

    const onSubmit = () => {
        startTransition(() => {
            if (editingId) {
                updateWorkSite(workspaceId, editingId, { name }).then((data) => {
                    if (data.success) {
                        toast.success(data.success);
                        setName("");
                        setEditingId(null);
                    } else {
                        toast.error(data.error);
                    }
                });
            } else {
                createWorkSite(workspaceId, { name }).then((data) => {
                    if (data.success) {
                        toast.success(data.success);
                        setName("");
                    } else {
                        toast.error(data.error);
                    }
                });
            }
        });
    };

    const onDelete = (id: string) => {
        if (!confirm("Are you sure? This will unassign items from this work site.")) return;
        startTransition(() => {
            deleteWorkSite(workspaceId, id).then((data) => {
                if (data.success) {
                    toast.success(data.success);
                } else {
                    toast.error(data.error);
                }
            });
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button variant="outline">
                    Manage Work Sites
                </Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Work Sites</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="flex items-center gap-2">
                        <Input 
                            placeholder="Work Site Name (e.g. Router (PH ZTE))" 
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isPending}
                        />
                        <Button disabled={isPending || !name} onClick={onSubmit}>
                            {editingId ? "Update" : <Plus className="h-4 w-4" />}
                        </Button>
                        {editingId && (
                            <Button variant="ghost" onClick={() => { setEditingId(null); setName(""); }}>
                                Cancel
                            </Button>
                        )}
                    </div>
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                        {workSites.map((site) => (
                            <div key={site.id} className="flex items-center justify-between p-2 border rounded-md">
                                <span className="font-medium">{site.name}</span>
                                <div className="flex items-center gap-1">
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => { setEditingId(site.id); setName(site.name); }}
                                        disabled={isPending}
                                    >
                                        <Edit2 className="h-4 w-4 text-zinc-500" />
                                    </Button>
                                    <Button 
                                        variant="ghost" 
                                        size="icon" 
                                        onClick={() => onDelete(site.id)}
                                        disabled={isPending}
                                    >
                                        <Trash className="h-4 w-4 text-rose-500" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};
