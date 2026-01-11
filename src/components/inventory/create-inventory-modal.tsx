"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition } from "react";
import { useParams, useRouter } from "next/navigation";

import { ImageIcon, X } from "lucide-react";

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogTrigger
} from "@/components/ui/dialog";
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

import { CreateInventoryItemSchema } from "@/schemas/inventory";
import { createInventoryItem } from "@/actions/inventory";

export const CreateInventoryModal = ({ children }: { children: React.ReactNode }) => {
    const params = useParams();
    const router = useRouter();
    const [open, setOpen] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [isUploading, setIsUploading] = useState(false);

    const handleImageUpload = async (file: File) => {
        setIsUploading(true);
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "workspace_pro");

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dchanu88"}/image/upload`,
                {
                    method: "POST",
                    body: formData,
                }
            );

            const data = await response.json();
            if (data.secure_url) {
                form.setValue("image", data.secure_url);
            } else {
                console.error("Upload failed", data);
                alert("Upload failed");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            alert("Error uploading image");
        } finally {
            setIsUploading(false);
        }
    };

    const form = useForm<z.infer<typeof CreateInventoryItemSchema>>({
        resolver: zodResolver(CreateInventoryItemSchema) as any,
        defaultValues: {
            name: "",
            sku: "",
            category: "",
            quantity: 0,
            unitCost: 0,
            lowStockThreshold: 5,
            image: ""
        },
    });

    const onSubmit = (values: z.infer<typeof CreateInventoryItemSchema>) => {
        const workspaceId = params.workspaceId as string;
        startTransition(() => {
            createInventoryItem(workspaceId, values).then((data) => {
                if (data?.success) {
                    form.reset();
                    setOpen(false);
                    router.refresh();
                } else if (data?.error) {
                    alert(data.error);
                }
            });
        });
    };

    const imageUrl = form.watch("image");

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                {children}
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Add Inventory Item</DialogTitle>
                    <DialogDescription>
                        Track new items in your workspace.
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <div className="flex items-center gap-x-4">
                            <div className="relative h-24 w-24 bg-zinc-100 rounded-md flex items-center justify-center overflow-hidden border">
                                {imageUrl ? (
                                    <>
                                        <img src={imageUrl} alt="Preview" className="h-full w-full object-cover" />
                                        <button
                                            onClick={() => form.setValue("image", "")}
                                            className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-0.5 hover:bg-red-600 transition"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </>
                                ) : (
                                    <ImageIcon className="h-8 w-8 text-zinc-400" />
                                )}
                            </div>
                            <div className="flex flex-col gap-2">
                                <Input
                                    type="file"
                                    accept="image/*"
                                    className="hidden"
                                    id="image-upload"
                                    disabled={isPending || isUploading}
                                    onChange={(e) => {
                                        const file = e.target.files?.[0];
                                        if (file) {
                                            handleImageUpload(file);
                                        }
                                    }}
                                />
                                <Button
                                    type="button"
                                    variant="secondary"
                                    size="sm"
                                    disabled={isPending || isUploading}
                                    onClick={() => document.getElementById("image-upload")?.click()}
                                >
                                    {isUploading ? "Uploading..." : "Upload Image"}
                                </Button>
                            </div>
                        </div>

                        <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Name</FormLabel>
                                    <FormControl>
                                        <Input disabled={isPending} placeholder="Item Name" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="sku"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>SKU</FormLabel>
                                        <FormControl>
                                            <Input disabled={isPending} placeholder="SKU-123" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="category"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Category</FormLabel>
                                        <FormControl>
                                            <Input disabled={isPending} placeholder="Hardware" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FormField
                                control={form.control}
                                name="quantity"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Initial Quantity</FormLabel>
                                        <FormControl>
                                            <Input disabled={isPending} type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={form.control}
                                name="unitCost"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Unit Cost ($)</FormLabel>
                                        <FormControl>
                                            <Input disabled={isPending} type="number" step="0.01" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>
                        <FormField
                            control={form.control}
                            name="lowStockThreshold"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Low Stock Alert Level</FormLabel>
                                    <FormControl>
                                        <Input disabled={isPending} type="number" {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />
                        <div className="flex items-center justify-end w-full pt-4 space-x-2">
                            <Button disabled={isPending} type="button" variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
                            <Button disabled={isPending} type="submit">Create Item</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
