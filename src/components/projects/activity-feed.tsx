"use server";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { formatDistanceToNow } from "date-fns";
import { getActivities } from "@/actions/activities";

interface ActivityFeedProps {
    projectId: string;
}

export async function ActivityFeed({ projectId }: ActivityFeedProps) {
    const activities = await getActivities(projectId);

    return (
        <div className="space-y-8">
            {activities.map((activity: any, index: number) => (
                <div key={activity.id} className="flex gap-4 relative">
                    {/* Connector Line */}
                    {index !== activities.length - 1 && (
                        <div className="absolute left-[19px] top-10 bottom-[-20px] w-[2px] bg-border" />
                    )}

                    <Avatar className="z-10 border-2 border-background">
                        <AvatarImage src={activity.user.image || ""} />
                        <AvatarFallback>{activity.user.name?.charAt(0) || "U"}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 space-y-1 pt-1">
                        <div className="flex items-center gap-2">
                            <span className="font-semibold text-sm">{activity.user.name}</span>
                            <span className="text-sm text-muted-foreground">
                                {getActivityText(activity.action)}
                            </span>
                            <span className="text-xs text-muted-foreground ml-auto">
                                {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                            </span>
                        </div>
                        {activity.details && (
                            <p className="text-xs text-muted-foreground bg-muted/50 p-2 rounded-md mt-1">
                                {activity.details}
                            </p>
                        )}
                    </div>
                </div>
            ))}
            {activities.length === 0 && (
                <p className="text-center text-muted-foreground text-sm py-4">No recent activity.</p>
            )}
        </div>
    );
}

function getActivityText(action: string): string {
    switch (action) {
        case "CREATED_PROJECT":
            return "created this project";
        case "UPDATED_STATUS":
            return "updated project status";
        case "COMMENTED":
            return "commented";
        case "ADDED_MEMBER":
            return "added a team member";
        default:
            return "performed an action";
    }
}
