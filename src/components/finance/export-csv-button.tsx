"use client";

import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";
import { format } from "date-fns";

interface ExportCsvButtonProps {
    data: any[];
    filename: string;
    type: "INVOICE" | "WORKSPACE";
}

export const ExportCsvButton = ({ data, filename, type }: ExportCsvButtonProps) => {
    const handleExport = () => {
        let headers: string[] = [];
        let rows: string[][] = [];

        if (type === "INVOICE") {
            headers = ["Number", "Status", "Total Amount", "Amount Paid", "Due Date", "Project", "Team"];
            rows = data.map(inv => {
                const paid = inv.payments?.reduce((acc: number, p: any) => acc + Number(p.amount), 0) || 0;
                return [
                    `"${inv.number}"`,
                    inv.status,
                    Number(inv.totalAmount).toString(),
                    paid.toString(),
                    inv.dueDate ? format(new Date(inv.dueDate), "MMM d, yyyy") : "",
                    `"${inv.project?.name || ""}"`,
                    `"${inv.team?.name || ""}"`
                ];
            });
        }

        const csvContent = "data:text/csv;charset=utf-8," 
            + headers.join(",") + "\n" 
            + rows.map(e => e.join(",")).join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `${filename}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <Button variant="outline" size="sm" onClick={handleExport} className="h-8">
            <Download className="mr-2 h-4 w-4" />
            Export CSV
        </Button>
    );
};
