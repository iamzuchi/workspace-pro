"use client";

import * as z from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

import { CalendarIcon, Trash, Plus } from "lucide-react";
import { format } from "date-fns";

import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { CreateInvoiceSchema } from "@/schemas/invoice";
import { createInvoice, updateInvoice } from "@/actions/invoice";
import { Textarea } from "@/components/ui/textarea";
import { TeamSelectField } from "@/components/invoice/team-select-field";
import { CurrencySelect } from "@/components/invoice/currency-select";


interface InvoiceFormProps {
    initialData?: any;
    invoiceId?: string;
}

export const InvoiceForm = ({ initialData, invoiceId }: InvoiceFormProps) => {
    const params = useParams();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isPending, startTransition] = useTransition();

    const queryProjectId = searchParams.get("projectId");

    const form = useForm<z.infer<typeof CreateInvoiceSchema>>({
        resolver: zodResolver(CreateInvoiceSchema) as any,
        defaultValues: {
            projectId: initialData?.projectId || queryProjectId || "",
            contractorId: initialData?.contractorId || "",
            teamId: initialData?.teamId || "",
            recipientName: initialData?.recipientName || "",
            recipientEmail: initialData?.recipientEmail || "",
            notes: initialData?.notes || "",
            dueDate: initialData?.dueDate ? new Date(initialData.dueDate) : undefined,
            items: initialData?.items?.map((item: any) => ({
                description: item.description,
                quantity: item.quantity,
                unitPrice: Number(item.unitPrice)
            })) || [{ description: "", quantity: 1, unitPrice: 0 }],
            taxRate: Number(initialData?.taxAmount) > 0 ? (Number(initialData.taxAmount) / (Number(initialData.totalAmount) - Number(initialData.taxAmount)) * 100) : 0
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "items",
    });

    const onSubmit = (values: z.infer<typeof CreateInvoiceSchema>) => {
        const workspaceId = params.workspaceId as string;
        startTransition(() => {
            const action = initialData ? updateInvoice(workspaceId, invoiceId!, values) : createInvoice(workspaceId, values);

            action.then((data) => {
                if (data?.success) {
                    router.push(`/${workspaceId}/finance?tab=invoices`);
                    router.refresh();
                }
            });
        });
    };

    const watchItems = form.watch("items");
    const subtotal = watchItems.reduce((acc, item) => acc + (Number(item.quantity) * Number(item.unitPrice) || 0), 0);
    const taxRate = form.watch("taxRate") || 0;
    const taxAmount = subtotal * (taxRate / 100);
    const total = subtotal + taxAmount;

    const currency = form.watch("currency") || "USD";
    const currencyFormatter = new Intl.NumberFormat("en-US", {
        style: "currency",
        currency: currency,
    });

    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 pb-20">
                <div className="flex items-center justify-between">
                    <h2 className="text-3xl font-bold tracking-tight">
                        {initialData ? "Edit Invoice" : "New Invoice"}
                    </h2>
                    <div className="flex items-center space-x-2">
                        <Button variant="outline" type="button" onClick={() => router.back()}>Cancel</Button>
                        <Button disabled={isPending} type="submit">
                            {initialData ? "Update Invoice" : "Create Invoice"}
                        </Button>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recipient Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <FormField
                                control={form.control}
                                name="recipientName"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Client Name</FormLabel>
                                        <FormControl>
                                            <Input disabled={isPending} placeholder="Acme Corp" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="recipientEmail"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Client Email</FormLabel>
                                        <FormControl>
                                            <Input disabled={isPending} type="email" placeholder="billing@acme.com" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Invoice settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <TeamSelectField control={form.control} disabled={isPending} />
                            <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Currency</FormLabel>
                                        <FormControl>
                                            <CurrencySelect
                                                value={field.value}
                                                onChange={field.onChange}
                                                disabled={isPending}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="dueDate"
                                render={({ field }) => (
                                    <FormItem className="flex flex-col text-left">
                                        <FormLabel>Due Date</FormLabel>
                                        <Popover>
                                            <PopoverTrigger asChild>
                                                <FormControl>
                                                    <Button
                                                        variant={"outline"}
                                                        className={cn(
                                                            "w-full pl-3 text-left font-normal",
                                                            !field.value && "text-muted-foreground"
                                                        )}
                                                    >
                                                        {field.value ? (
                                                            format(field.value, "PPP")
                                                        ) : (
                                                            <span>Pick a date</span>
                                                        )}
                                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                    </Button>
                                                </FormControl>
                                            </PopoverTrigger>
                                            <PopoverContent className="w-auto p-0" align="start">
                                                <Calendar
                                                    mode="single"
                                                    selected={field.value}
                                                    onSelect={field.onChange}
                                                    disabled={(date) =>
                                                        date < new Date("1900-01-01")
                                                    }
                                                    initialFocus
                                                />
                                            </PopoverContent>
                                        </Popover>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="taxRate"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Tax Rate (%)</FormLabel>
                                        <FormControl>
                                            <Input type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>
                </div>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Invoice Items</CardTitle>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => append({ description: "", quantity: 1, unitPrice: 0 })}
                        >
                            <Plus className="mr-2 h-4 w-4" /> Add Item
                        </Button>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid grid-cols-12 gap-4 pb-2 border-b text-sm font-semibold text-muted-foreground">
                            <div className="col-span-6">Description</div>
                            <div className="col-span-2 text-center">Qty</div>
                            <div className="col-span-3 text-right">Unit Price</div>
                            <div className="col-span-1"></div>
                        </div>
                        {fields.map((field, index) => (
                            <div key={field.id} className="grid grid-cols-12 gap-4 items-start">
                                <div className="col-span-6">
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.description`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input placeholder="Item description" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="col-span-2">
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.quantity`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input type="number" className="text-center" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="col-span-3">
                                    <FormField
                                        control={form.control}
                                        name={`items.${index}.unitPrice`}
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormControl>
                                                    <Input type="number" step="0.01" className="text-right" {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="col-span-1">
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="text-muted-foreground hover:text-destructive"
                                        onClick={() => remove(index)}
                                        disabled={fields.length === 1}
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </CardContent>
                </Card>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormControl>
                                            <Textarea
                                                disabled={isPending}
                                                placeholder="Payment instructions, bank details, or additional info..."
                                                className="min-h-[120px]"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Invoice Summary</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex justify-between items-center pb-2 border-b border-dashed">
                                <span className="text-muted-foreground text-sm uppercase tracking-wider font-semibold">Subtotal</span>
                                <span className="font-bold tracking-tight">{currencyFormatter.format(subtotal)}</span>
                            </div>
                            <div className="flex justify-between items-center pb-2 border-b border-dashed">
                                <span className="text-muted-foreground text-sm uppercase tracking-wider font-semibold">Tax ({taxRate}%)</span>
                                <span className="font-bold tracking-tight">{currencyFormatter.format(taxAmount)}</span>
                            </div>
                            <div className="flex justify-between items-center pt-4">
                                <span className="text-lg font-black uppercase tracking-widest">Total</span>
                                <span className="text-2xl font-black text-primary">{currencyFormatter.format(total)}</span>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </form>
        </Form>
    );
};

