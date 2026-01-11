"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";

interface RevenueChartProps {
    data: {
        month: string;
        revenue: number;
        expenses: number;
    }[];
}

export const RevenueChart = ({ data }: RevenueChartProps) => {
    return (
        <div className="h-[300px] min-h-[300px] min-w-0 w-full pt-4">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                    <XAxis
                        dataKey="month"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#888" }}
                        dy={10}
                    />
                    <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#888" }}
                        tickFormatter={(value) => `$${value}`}
                    />
                    <Tooltip
                        contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                        formatter={(value: number | undefined, name: string | number | undefined) => [`$${value || 0}`, name === "revenue" ? "Revenue" : "Expenses"]}
                    />
                    <Line
                        type="monotone"
                        dataKey="revenue"
                        stroke="#10b981" // Emerald-500
                        strokeWidth={2}
                        dot={{ r: 4, fill: "#10b981", strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: "#10b981" }}
                        name="Revenue"
                    />
                    <Line
                        type="monotone"
                        dataKey="expenses"
                        stroke="#ef4444" // Red-500
                        strokeWidth={2}
                        dot={{ r: 4, fill: "#ef4444", strokeWidth: 2 }}
                        activeDot={{ r: 6, fill: "#ef4444" }}
                        name="Expenses"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
};
