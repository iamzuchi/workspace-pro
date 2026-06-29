"use client";

import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Button } from "@/components/ui/button";
import { useEffect, useState } from "react";

interface MobileSidebarProps {
    workspaces: { id: string; name: string }[];
    isAdmin?: boolean;
}

export const MobileSidebar = ({ workspaces, isAdmin }: MobileSidebarProps) => {
    const [isMounted, setIsMounted] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    if (!isMounted) return null;

    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                    <Menu />
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 bg-gray-900 text-white">
                <SheetTitle className="sr-only">Mobile Menu</SheetTitle>
                <Sidebar workspaces={workspaces} isAdmin={isAdmin} />
            </SheetContent>
        </Sheet>
    );
};
