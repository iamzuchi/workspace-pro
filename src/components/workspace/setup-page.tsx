"use client";

import { useEffect, useState } from "react";
import { CreateWorkspaceModal } from "./create-workspace-modal";

export const SetupPage = () => {
    const [isOpen, setIsOpen] = useState(false);

    useEffect(() => {
        if (!isOpen) {
            setIsOpen(true);
        }
    }, [isOpen]);

    return (
        <CreateWorkspaceModal isOpen={isOpen} onClose={() => { }} />
    );
};
