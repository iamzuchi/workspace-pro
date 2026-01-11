"use client";

import { Task } from "@prisma/client";
import { format, differenceInDays, startOfMonth, endOfMonth, eachDayOfInterval } from "date-fns";

interface ProjectTimelineProps {
    tasks: Task[];
}

export const ProjectTimeline = ({ tasks }: ProjectTimelineProps) => {
    // Basic timeline visualization
    // We'll show the current month and how tasks overlap
    const now = new Date();
    const rangeStart = startOfMonth(now);
    const rangeEnd = endOfMonth(now);
    const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });

    const getPosition = (date: Date | null) => {
        if (!date) return 0;
        const diff = differenceInDays(new Date(date), rangeStart);
        return Math.max(0, (diff / days.length) * 100);
    };

    const getWidth = (start: Date | null, end: Date | null) => {
        if (!start || !end) return "50px"; // Default width if dates are missing
        const diff = differenceInDays(new Date(end), new Date(start));
        return `${Math.max(5, (diff / days.length) * 100)}%`;
    };

    return (
        <div className="space-y-6 overflow-x-auto pb-4">
            <div className="min-w-[800px]">
                <div className="flex border-b pb-2 mb-4">
                    <div className="w-[200px] shrink-0 font-semibold">Task Name</div>
                    <div className="flex-1 relative">
                        <div className="flex justify-between text-xs text-muted-foreground">
                            {format(rangeStart, "MMM d")}
                            <span className="absolute left-1/2 -translate-x-1/2">Timeline ({format(now, "MMMM")})</span>
                            {format(rangeEnd, "MMM d")}
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    {tasks.length === 0 && <p className="text-center text-muted-foreground py-8">No tasks with dates to display.</p>}
                    {tasks.map((task) => (
                        <div key={task.id} className="flex items-center group">
                            <div className="w-[200px] shrink-0 text-sm font-medium truncate pr-4 group-hover:text-blue-600 transition-colors">
                                {task.title}
                            </div>
                            <div className="flex-1 h-8 bg-zinc-50 rounded-full relative overflow-hidden border">
                                <div
                                    className="absolute h-full bg-blue-500/20 border-l border-r border-blue-500 rounded-sm flex items-center px-2"
                                    style={{
                                        left: `${getPosition(task.startDate || task.createdAt)}%`,
                                        width: getWidth(task.startDate || task.createdAt, task.dueDate),
                                    }}
                                >
                                    <span className="text-[10px] font-bold text-blue-700 truncate">
                                        {task.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
