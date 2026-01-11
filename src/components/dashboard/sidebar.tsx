"use client";

import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Settings, FileText, ShoppingCart, CreditCard, Users, Clock, Building2 } from "lucide-react";
import Image from "next/image";

import { WorkspaceSwitcher } from "@/components/dashboard/workspace-switcher";

interface SidebarProps {
    workspaces: { id: string, name: string }[];
    currentWorkspace?: { id: string, name: string, logo: string | null } | null;
}

export const Sidebar = ({ workspaces, currentWorkspace }: SidebarProps) => {
    const pathname = usePathname();
    const params = useParams();
    const workspaceId = params.workspaceId as string;

    const routes = [
        {
            label: "Dashboard",
            icon: LayoutDashboard,
            href: `/${workspaceId}`,
            color: "text-sky-500",
        },
        {
            label: "Pending",
            icon: Clock,
            href: `/${workspaceId}/pending`,
            color: "text-amber-500",
        },
        {
            label: "Projects",

            icon: FileText,
            href: `/${workspaceId}/projects`,
            color: "text-violet-500",
        },
        {
            label: "Inventory",
            icon: ShoppingCart,
            href: `/${workspaceId}/inventory`,
            color: "text-pink-700",
        },
        {
            label: "Finance",
            icon: CreditCard,
            href: `/${workspaceId}/finance`,
            color: "text-orange-700",
        },
        {
            label: "Documents",
            icon: FileText,
            href: `/${workspaceId}/documents`,
            color: "text-blue-500",
        },
        {
            label: "Team",
            icon: Users,
            href: `/${workspaceId}/team`,
            color: "text-emerald-500",
        },
        {
            label: "Settings",
            icon: Settings,
            href: `/${workspaceId}/settings`,
        },
    ];

    return (
        <div className="space-y-4 py-4 flex flex-col h-full bg-[#111827] text-white">
            <div className="px-3 py-2 flex-1">
                {currentWorkspace?.logo && (
                    <div className="mb-4 flex items-center justify-center">
                        <div className="relative h-16 w-16 rounded-lg overflow-hidden bg-zinc-800">
                            <Image
                                src={currentWorkspace.logo}
                                alt={currentWorkspace.name}
                                fill
                                className="object-cover"
                            />
                        </div>
                    </div>
                )}
                <div className="mb-10 pl-2">
                    <WorkspaceSwitcher items={workspaces} />
                </div>
                <div className="space-y-1">
                    {routes.map((route) => (
                        <Link
                            key={route.href}
                            href={route.href}
                            className={cn(
                                "text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition",
                                pathname === route.href ? "text-white bg-white/10" : "text-zinc-400"
                            )}
                        >
                            <div className="flex items-center flex-1">
                                <route.icon className={cn("h-5 w-5 mr-3", route.color)} />
                                {route.label}
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </div>
    );
};

