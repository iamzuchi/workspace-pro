"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState, useTransition, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
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
import { Minus, Plus, ImageIcon, X } from "lucide-react";

import { CreateInventoryItemSchema } from "@/schemas/inventory";
import { updateInventoryItem } from "@/actions/inventory";
import { toast } from "sonner";

interface EditInventoryModalProps {
    isOpen: boolean;
    onClose: () => void;
    workspaceId: string;
    item: any;
}

export const EditInventoryModal = ({
    isOpen,
    onClose,
    workspaceId,
    item
}: EditInventoryModalProps) => {
    const router = useRouter();
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
                toast.success("Image uploaded");
            } else {
                console.error("Upload failed", data);
                toast.error("Upload failed");
            }
        } catch (error) {
            console.error("Error uploading image:", error);
            toast.error("Error uploading image");
        } finally {
            setIsUploading(false);
        }
    };

    const form = useForm<z.infer<typeof CreateInventoryItemSchema>>({
        resolver: zodResolver(CreateInventoryItemSchema) as any,
        defaultValues: {
            name: item.name,
            sku: item.sku || "",
            category: item.category || "",
            quantity: item.quantity,
            unitCost: Number(item.unitCost),
            lowStockThreshold: item.lowStockThreshold || 5,
            image: item.image || "",
        },
    });

    const imageUrl = form.watch("image");

    useEffect(() => {
        if (item) {
            form.reset({
                name: item.name,
                sku: item.sku || "",
                category: item.category || "",
                quantity: item.quantity,
                unitCost: Number(item.unitCost),
                lowStockThreshold: item.lowStockThreshold || 5,
                image: item.image || "",
            });
        }
    }, [item, form]);

    const onSubmit = (values: z.infer<typeof CreateInventoryItemSchema>) => {
        startTransition(() => {
            updateInventoryItem(workspaceId, item.id, values).then((data) => {
                if (data?.success) {
                    toast.success("Item updated successfully");
                    onClose();
                    router.refresh();
                } else if (data?.error) {
                    toast.error(data.error);
                }
            });
        });
    };

    const adjustQuantity = (amount: number) => {
        const currentQty = form.getValues("quantity");
        const newQty = Math.max(0, currentQty + amount);
        form.setValue("quantity", newQty);
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[480px]">
                <DialogHeader>
                    <DialogTitle>Edit Inventory Item</DialogTitle>
                    <DialogDescription>
                        Update details for {item.name}.
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
                                            type="button"
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
                                    id="edit-image-upload"
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
                                    onClick={() => document.getElementById("edit-image-upload")?.click()}
                                >
                                    {isUploading ? "Uploading..." : "Change Image"}
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
                                        <Input disabled={isPending} {...field} />
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
                                            <Input disabled={isPending} {...field} />
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
                                            <Input disabled={isPending} {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <FormField
                            control={form.control}
                            name="quantity"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>Quantity</FormLabel>
                                    <div className="flex items-center gap-3">
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => adjustQuantity(-1)}
                                            disabled={isPending}
                                            className="h-10 w-10 shrink-0"
                                        >
                                            <Minus className="h-4 w-4" />
                                        </Button>
                                        <FormControl>
                                            <Input
                                                disabled={isPending}
                                                type="number"
                                                className="text-center text-lg font-bold h-10"
                                                {...field}
                                            />
                                        </FormControl>
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="icon"
                                            onClick={() => adjustQuantity(1)}
                                            disabled={isPending}
                                            className="h-10 w-10 shrink-0"
                                        >
                                            <Plus className="h-4 w-4" />
                                        </Button>
                                    </div>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <div className="grid grid-cols-2 gap-4">
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
                            <FormField
                                control={form.control}
                                name="lowStockThreshold"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Low Stock Alert</FormLabel>
                                        <FormControl>
                                            <Input disabled={isPending} type="number" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <div className="flex items-center justify-end w-full pt-4 space-x-2">
                            <Button disabled={isPending} type="button" variant="outline" onClick={onClose}>Cancel</Button>
                            <Button disabled={isPending} type="submit">Save Changes</Button>
                        </div>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
