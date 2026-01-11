"use client";

import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useTransition } from "react";
import { deleteProject } from "@/actions/delete-project";
import { useRouter } from "next/navigation";
import { toast } from "sonner"; // Assuming sonner is installed, if not will use basic alert or console for now, actually project setup said shadcn initialized but didn't specify toast. I'll stick to router.refresh for now and maybe simple alert if err.

interface ProjectActionsProps {
    workspaceId: string;
    projectId: string;
}

export const ProjectActions = ({ workspaceId, projectId }: ProjectActionsProps) => {
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const onDelete = () => {
        if (confirm("Are you sure you want to delete this project?")) {
            startTransition(() => {
                deleteProject(workspaceId, projectId).then((data) => {
                    if (data.success) {
                        router.refresh();
                    }
                });
            });
        }
    };

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="h-8 w-8 p-0">
                    <span className="sr-only">Open menu</span>
                    <MoreHorizontal className="h-4 w-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                    <a href={`/${workspaceId}/projects/${projectId}?edit=true`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit
                    </a>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
                    <Trash className="mr-2 h-4 w-4" />
                    Delete
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
