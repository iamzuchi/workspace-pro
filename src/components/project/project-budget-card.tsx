"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { DollarSign } from "lucide-react";

interface ProjectBudgetCardProps {
    budget: number;
    totalPaid: number;
    currency?: string;
}

export const ProjectBudgetCard = ({
    budget = 0,
    totalPaid = 0,
    currency = "USD"
}: ProjectBudgetCardProps) => {
    const percentage = budget > 0 ? Math.min((totalPaid / budget) * 100, 100) : 0;

    const formatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
    });

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Project Budget</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{formatter.format(budget)}</div>
                <div className="flex justify-between text-xs text-muted-foreground mt-1 mb-2">
                    <span>Allocated</span>
                    <span>{percentage.toFixed(1)}% used</span>
                </div>
                <Progress value={percentage} className="h-2" />
                <div className="mt-4 flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Total Paid:</span>
                    <span className="font-semibold text-emerald-600">{formatter.format(totalPaid)}</span>
                </div>
            </CardContent>
        </Card>
    );
};
