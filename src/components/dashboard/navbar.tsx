import { NotificationBell } from "@/components/dashboard/notification-bell";
import { UserButton } from "../user-button";
import { MobileSidebar } from "./mobile-sidebar";

interface NavbarProps {
    workspaces: { id: string; name: string }[];
    isAdmin?: boolean;
}

export const Navbar = ({ workspaces, isAdmin }: NavbarProps) => {
    return (
        <div className="flex items-center p-4">
            <MobileSidebar workspaces={workspaces} isAdmin={isAdmin} />
            <div className="flex w-full justify-end items-center gap-x-4">
                <NotificationBell />
                <UserButton />
            </div>
        </div>
    );
};
