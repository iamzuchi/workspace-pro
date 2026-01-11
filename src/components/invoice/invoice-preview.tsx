"use client";

import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

interface InvoicePreviewProps {
    workspace: any;
    invoice: any;
}

export const InvoicePreview = ({ workspace, invoice }: InvoicePreviewProps) => {
    const subtotal = Number(invoice.totalAmount) - Number(invoice.taxAmount);

    const currencyFormatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: invoice.currency || "USD",
    });

    return (
        <div className="bg-white p-8 md:p-12 shadow-lg rounded-xl border max-w-4xl mx-auto min-h-[1056px] flex flex-col">
            {/* Header */}
            <div className="flex justify-between items-start mb-12">
                <div>
                    {workspace.logo && (
                        <div className="mb-6 relative h-16 w-16">
                            <img
                                src={workspace.logo}
                                alt={workspace.name}
                                className="object-contain h-full w-full"
                            />
                        </div>
                    )}
                    <h1 className="text-4xl font-bold tracking-tight text-zinc-900">{workspace.name}</h1>
                    <p className="text-zinc-500 mt-1 max-w-[300px]">{workspace.description || "Business Solutions"}</p>
                </div>
                <div className="text-right">
                    <h2 className="text-2xl font-bold text-zinc-900 uppercase tracking-wider">Invoice</h2>
                    <p className="text-zinc-500 mt-1">#{invoice.number}</p>
                    <Badge className="mt-2 uppercase" variant={invoice.status === "PAID" ? "default" : "secondary"}>
                        {invoice.status}
                    </Badge>
                </div>
            </div>

            {/* Bill To & Info Section */}
            <div className="grid grid-cols-2 gap-12 mb-12">
                <div>
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Bill To</h3>
                    <div className="text-zinc-900">
                        {invoice.recipientName ? (
                            <>
                                <p className="font-bold text-lg">{invoice.recipientName}</p>
                                <p>{invoice.recipientEmail}</p>
                            </>
                        ) : invoice.contractor ? (
                            <>
                                <p className="font-bold text-lg">{invoice.contractor.companyName}</p>
                                <p>{invoice.contractor.contactName}</p>
                                <p>{invoice.contractor.email}</p>
                            </>
                        ) : (
                            <p className="italic text-zinc-400">No client information assigned.</p>
                        )}
                    </div>

                </div>
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Date Issued</h3>
                        <p className="text-zinc-900 font-medium">{format(new Date(invoice.createdAt), "MMMM d, yyyy")}</p>
                    </div>
                    <div>
                        <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Due Date</h3>
                        <p className="text-zinc-900 font-medium">
                            {invoice.dueDate ? format(new Date(invoice.dueDate), "MMMM d, yyyy") : "On Receipt"}
                        </p>
                    </div>
                    {invoice.project && (
                        <div className="col-span-2">
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Project</h3>
                            <p className="text-zinc-900 font-medium">{invoice.project.name}</p>
                        </div>
                    )}
                    {invoice.team && (
                        <div className="col-span-2">
                            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-2">Team</h3>
                            <p className="text-zinc-900 font-medium">{invoice.team.name}</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Items Table */}
            <div className="flex-grow">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-zinc-50 hover:bg-zinc-50">
                            <TableHead className="w-[50%] font-bold text-zinc-900">Description</TableHead>
                            <TableHead className="text-center font-bold text-zinc-900">Qty</TableHead>
                            <TableHead className="text-right font-bold text-zinc-900">Price</TableHead>
                            <TableHead className="text-right font-bold text-zinc-900">Amount</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {invoice.items.map((item: any, index: number) => (
                            <TableRow key={index}>
                                <TableCell className="font-medium text-zinc-700">{item.description}</TableCell>
                                <TableCell className="text-center text-zinc-600">{item.quantity}</TableCell>
                                <TableCell className="text-right text-zinc-600">
                                    {currencyFormatter.format(Number(item.unitPrice))}
                                </TableCell>
                                <TableCell className="text-right font-semibold text-zinc-900">
                                    {currencyFormatter.format(Number(item.amount))}
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            {/* Totals */}
            <div className="flex justify-end mt-12">
                <div className="w-full max-w-[300px] space-y-3">
                    <div className="flex justify-between text-zinc-500">
                        <span>Subtotal</span>
                        <span>{currencyFormatter.format(subtotal)}</span>
                    </div>
                    <div className="flex justify-between text-zinc-500">
                        <span>Tax ({((Number(invoice.taxAmount) / subtotal) * 100).toFixed(0)}%)</span>
                        <span>{currencyFormatter.format(Number(invoice.taxAmount))}</span>
                    </div>
                    <div className="flex justify-between pt-3 border-t border-zinc-200">
                        <span className="text-lg font-bold text-zinc-900">Total</span>
                        <span className="text-xl font-black text-zinc-900">{currencyFormatter.format(Number(invoice.totalAmount))}</span>
                    </div>
                </div>
            </div>

            {/* Notes */}
            {invoice.notes && (
                <div className="mt-12 pt-8 border-t border-zinc-100">
                    <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-widest mb-3">Notes</h3>
                    <p className="text-zinc-600 text-sm whitespace-pre-wrap leading-relaxed">{invoice.notes}</p>
                </div>
            )}

            {/* Footer */}

            <div className="mt-24 pt-8 border-t border-zinc-100 text-center text-zinc-400 text-xs uppercase tracking-[0.2em]">
                Thank you for your business
            </div>
        </div>
    );
};
