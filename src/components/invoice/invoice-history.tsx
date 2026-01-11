"use client";

import { format } from "date-fns";
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle
} from "@/components/ui/card";
import { History, User as UserIcon } from "lucide-react";

interface InvoiceHistoryProps {
    activities: any[];
}

export const InvoiceHistory = ({ activities }: InvoiceHistoryProps) => {
    if (!activities || activities.length === 0) return null;

    return (
        <Card className="mt-8 overflow-hidden border-zinc-200">
            <CardHeader className="bg-zinc-50 border-b border-zinc-200 py-3">
                <CardTitle className="text-sm font-semibold flex items-center gap-2 text-zinc-700">
                    <History className="h-4 w-4" />
                    Audit Log & History
                </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <div className="divide-y divide-zinc-100">
                    {activities.map((activity) => (
                        <div key={activity.id} className="p-4 hover:bg-zinc-50 transition-colors">
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-full bg-zinc-100 mt-0.5">
                                    <UserIcon className="h-3 w-3 text-zinc-500" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between gap-2">
                                        <p className="text-sm font-medium text-zinc-900 truncate">
                                            {activity.user.name || "Unknown User"}
                                        </p>
                                        <time className="text-[10px] text-zinc-400 font-medium">
                                            {format(new Date(activity.createdAt), "MMM d, yyyy h:mm a")}
                                        </time>
                                    </div>
                                    <p className="text-xs text-emerald-600 font-semibold mt-0.5 uppercase tracking-wider">
                                        {activity.action.replace("_", " ")}
                                    </p>
                                    {activity.details && (
                                        <p className="text-sm text-zinc-600 mt-1 leading-relaxed">
                                            {activity.details}
                                        </p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
