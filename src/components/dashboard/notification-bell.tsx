"use client";

import { useState, useEffect, useTransition } from "react";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { getNotifications, markNotificationAsRead } from "@/actions/notification";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { formatDistanceToNow } from "date-fns";

interface Notification {
    id: string;
    title: string;
    message: string;
    type: string;
    read: boolean;
    link: string | null;
    createdAt: Date;
}

export const NotificationBell = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [isOpen, setIsOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const router = useRouter();

    useEffect(() => {
        const fetchNotifications = async () => {
            const data: Notification[] = await getNotifications();
            setNotifications(data);
            setUnreadCount(data.filter((n) => !n.read).length);
        };
        fetchNotifications();
        // Poll every minute
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, []);

    const handleRead = (id: string, link: string | null) => {
        startTransition(() => {
            markNotificationAsRead(id).then(() => {
                setNotifications((prev) =>
                    prev.map((n) => n.id === id ? { ...n, read: true } : n)
                );
                setUnreadCount((prev) => Math.max(0, prev - 1));
                if (link) {
                    router.push(link);
                    setIsOpen(false);
                }
            });
        });
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-1 right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-sky-500"></span>
                        </span>
                    )}
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="p-4 border-b font-medium">Notifications</div>
                <div className="max-h-[300px] overflow-y-auto">
                    {notifications.length === 0 && (
                        <div className="p-4 text-center text-sm text-zinc-500">
                            No notifications
                        </div>
                    )}
                    {notifications.map((notification) => (
                        <div
                            key={notification.id}
                            onClick={() => handleRead(notification.id, notification.link)}
                            className={cn(
                                "p-4 border-b last:border-0 hover:bg-zinc-100 cursor-pointer transition text-sm",
                                !notification.read && "bg-sky-50/50"
                            )}
                        >
                            <div className="font-semibold mb-1 flex justify-between items-start">
                                <span>{notification.title}</span>
                                {!notification.read && <span className="h-2 w-2 rounded-full bg-sky-500 mt-1" />}
                            </div>
                            <p className="text-zinc-600 mb-1">{notification.message}</p>
                            <p className="text-xs text-zinc-400">
                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                            </p>
                        </div>
                    ))}
                </div>
            </PopoverContent>
        </Popover>
    )
}
