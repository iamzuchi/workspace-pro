"use client";

import { useState } from "react";
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths
} from "date-fns";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Task } from "@prisma/client";
import { cn } from "@/lib/utils";

interface ProjectCalendarProps {
    tasks: Task[];
}

export const ProjectCalendar = ({ tasks }: ProjectCalendarProps) => {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    const monthStart = startOfMonth(currentMonth);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const calendarDays = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const previousMonth = () => setCurrentMonth(subMonths(currentMonth, 1));

    const getTasksForDay = (day: Date) => {
        return tasks.filter((task) => task.dueDate && isSameDay(new Date(task.dueDate), day));
    };

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between px-2">
                <h2 className="text-lg font-semibold">
                    {format(currentMonth, "MMMM yyyy")}
                </h2>
                <div className="flex gap-1">
                    <Button variant="outline" size="icon" onClick={previousMonth}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="icon" onClick={nextMonth}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-7 border-t border-l rounded-lg overflow-hidden">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                    <div key={day} className="py-2 text-center text-xs font-medium text-muted-foreground border-b border-r bg-zinc-50">
                        {day}
                    </div>
                ))}
                {calendarDays.map((day, i) => {
                    const tasksForDay = getTasksForDay(day);
                    return (
                        <div
                            key={i}
                            className={cn(
                                "min-h-[100px] p-2 border-b border-r transition-colors",
                                !isSameMonth(day, monthStart) && "bg-zinc-50/50 text-muted-foreground",
                                isSameDay(day, new Date()) && "bg-blue-50/30"
                            )}
                        >
                            <span className={cn(
                                "text-sm",
                                isSameDay(day, new Date()) && "font-bold text-blue-600"
                            )}>
                                {format(day, "d")}
                            </span>
                            <div className="mt-1 space-y-1">
                                {tasksForDay.map((task) => (
                                    <div
                                        key={task.id}
                                        className="text-[10px] p-1 rounded bg-blue-100 text-blue-800 truncate"
                                        title={task.title}
                                    >
                                        {task.title}
                                    </div>
                                ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
