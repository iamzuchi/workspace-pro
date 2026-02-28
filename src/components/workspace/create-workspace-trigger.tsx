"use client";

import { useState } from "react";
import { CreateWorkspaceModal } from "@/components/workspace/create-workspace-modal";

interface CreateWorkspaceTriggerProps {
    children: React.ReactNode;
    className?: string; // Expect the children to be a trigger button
}

export const CreateWorkspaceTrigger = ({ children }: CreateWorkspaceTriggerProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <>
            <div onClick={() => setIsOpen(true)}>
                {children}
            </div>
            <CreateWorkspaceModal isOpen={isOpen} onClose={() => setIsOpen(false)} />
        </>
    );
};
