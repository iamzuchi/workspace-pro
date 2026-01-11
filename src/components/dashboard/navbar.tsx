import { NotificationBell } from "@/components/dashboard/notification-bell";
import { UserButton } from "../user-button";
import { MobileSidebar } from "./mobile-sidebar";

interface NavbarProps {
    workspaces: { id: string; name: string }[];
}

export const Navbar = ({ workspaces }: NavbarProps) => {
    return (
        <div className="flex items-center p-4">
            <MobileSidebar workspaces={workspaces} />
            <div className="flex w-full justify-end items-center gap-x-4">
                <NotificationBell />
                <UserButton />
            </div>
        </div>
    );
};
