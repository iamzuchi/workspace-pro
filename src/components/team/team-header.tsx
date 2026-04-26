"use client";

import { Button } from "@/components/ui/button";
import { Plus, Users } from "lucide-react";
import { CreateTeamModal } from "@/components/team/create-team-modal";
import { useState } from "react";

interface TeamHeaderProps {
    workspaceId: string;
    projects: { id: string, name: string }[];
}

export const TeamHeader = ({ workspaceId, projects }: TeamHeaderProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-y-4">
            <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Teams</h2>
                <p className="text-sm text-muted-foreground transition-all duration-300"> 
                    Manage and track your project teams and their members. 
                </p>
            </div>
            <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button onClick={() => setIsOpen(true)} className="w-full sm:w-auto">
                    <Plus className="mr-2 h-4 w-4" /> Register Team
                </Button>
            </div>
            <CreateTeamModal
                workspaceId={workspaceId}
                isOpen={isOpen}
                onClose={() => setIsOpen(false)}
                projects={projects}
            />
        </div>
    );
};
