import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";

interface ActivityFeedProps {
    activities: any[];
}

export const ActivityFeed = ({ activities }: ActivityFeedProps) => {
    return (
        <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-zinc-200 before:via-zinc-200 before:to-transparent">
            {activities.length === 0 && (
                <p className="text-sm text-zinc-500 text-center py-4">No recent activity.</p>
            )}
            {activities.map((activity) => (
                <div key={activity.id} className="relative flex items-center gap-4">
                    <div className="z-10 bg-white p-0.5 rounded-full">
                        <Avatar className="h-10 w-10 border-2 border-white">
                            <AvatarImage src={activity.user.image} />
                            <AvatarFallback>{activity.user.name?.[0] || "U"}</AvatarFallback>
                        </Avatar>
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm">
                            <span className="font-semibold">{activity.user.name}</span>
                            {" "}
                            <span className="text-zinc-600">{activity.details || activity.action.replace("_", " ").toLowerCase()}</span>
                        </p>
                        <p className="text-xs text-zinc-400 mt-0.5">
                            {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                        </p>
                    </div>
                </div>
            ))}
        </div>
    );
};
