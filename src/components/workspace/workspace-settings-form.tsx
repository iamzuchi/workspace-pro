"use client";

import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UpdateWorkspaceSchema } from "@/schemas/workspace";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
    FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, Building2, X } from "lucide-react";
import { useState, useTransition, useRef } from "react";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { updateWorkspace, uploadWorkspaceLogo } from "@/actions/workspace";
import { CURRENCY_OPTIONS } from "@/lib/currency";
import { toast } from "sonner";
import Image from "next/image";

interface WorkspaceSettingsFormProps {
    workspace: {
        id: string;
        name: string;
        description: string | null;
        address: string | null;
        logo: string | null;
        currency: string;
    };
}

export const WorkspaceSettingsForm = ({ workspace }: WorkspaceSettingsFormProps) => {
    const [isPending, startTransition] = useTransition();
    const [logoPreview, setLogoPreview] = useState<string | null>(workspace.logo);
    const [isUploadingLogo, setIsUploadingLogo] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const form = useForm<any>({
        resolver: zodResolver(UpdateWorkspaceSchema),
        defaultValues: {
            name: workspace.name,
            description: workspace.description || "",
            address: workspace.address || "",
            currency: workspace.currency || "USD",
        },
    });

    const onSubmit = (values: z.infer<typeof UpdateWorkspaceSchema>) => {
        startTransition(() => {
            updateWorkspace(workspace.id, values).then((data) => {
                if (data.success) {
                    toast.success(data.success);
                } else if (data.error) {
                    toast.error(data.error);
                }
            });
        });
    };

    const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Client-side validation for file size (1MB)
        if (file.size > 1024 * 1024) {
            toast.error("Image size must be less than 1MB");
            return;
        }

        // Show preview
        const reader = new FileReader();
        reader.onloadend = () => {
            setLogoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);

        // Upload to server
        setIsUploadingLogo(true);
        const formData = new FormData();
        formData.append("logo", file);

        try {
            const result = await uploadWorkspaceLogo(workspace.id, formData);
            if (result.success) {
                toast.success(result.success);
            } else if (result.error) {
                toast.error(result.error);
                setLogoPreview(workspace.logo); // Revert preview
            }
        } catch (error) {
            toast.error("Failed to upload logo");
            setLogoPreview(workspace.logo);
        } finally {
            setIsUploadingLogo(false);
        }
    };

    const removeLogo = () => {
        setLogoPreview(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = "";
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Workspace Logo</CardTitle>
                    <CardDescription>Upload a logo to personalize your workspace</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center gap-6">
                        <div className="relative h-24 w-24 rounded-lg overflow-hidden bg-zinc-100 flex items-center justify-center border-2 border-dashed border-zinc-300">
                            {logoPreview ? (
                                <>
                                    <Image
                                        src={logoPreview}
                                        alt="Workspace logo"
                                        fill
                                        className="object-cover"
                                    />
                                    <button
                                        onClick={removeLogo}
                                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-rose-500 text-white flex items-center justify-center hover:bg-rose-600 transition"
                                        type="button"
                                    >
                                        <X className="h-4 w-4" />
                                    </button>
                                </>
                            ) : (
                                <Building2 className="h-10 w-10 text-zinc-400" />
                            )}
                        </div>
                        <div className="flex-1">
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/jpeg,image/png,image/svg+xml,image/webp"
                                onChange={handleLogoUpload}
                                className="hidden"
                                id="logo-upload"
                            />
                            <label htmlFor="logo-upload">
                                <Button
                                    type="button"
                                    variant="outline"
                                    disabled={isUploadingLogo}
                                    onClick={() => fileInputRef.current?.click()}
                                    asChild
                                >
                                    <span>
                                        <Upload className="h-4 w-4 mr-2" />
                                        {isUploadingLogo ? "Uploading..." : "Upload Logo"}
                                    </span>
                                </Button>
                            </label>
                            <p className="text-xs text-muted-foreground mt-2">
                                JPG, PNG, SVG, or WebP. Max 2MB.
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Workspace Details</CardTitle>
                    <CardDescription>Update your workspace information</CardDescription>
                </CardHeader>
                <CardContent>
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Workspace Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="My Workspace" disabled={isPending} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Describe your workspace..." disabled={isPending} rows={3} />
                                        </FormControl>
                                        <FormDescription>
                                            A brief description of what this workspace is for
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="address"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Business Address</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="123 Main St, City, Country" disabled={isPending} rows={2} />
                                        </FormControl>
                                        <FormDescription>
                                            Physical or business address (optional)
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="currency"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Currency</FormLabel>
                                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                                            <FormControl>
                                                <SelectTrigger>
                                                    <SelectValue placeholder="Select a currency" />
                                                </SelectTrigger>
                                            </FormControl>
                                            <SelectContent>
                                                {CURRENCY_OPTIONS.map((option) => (
                                                    <SelectItem key={option.value} value={option.value}>
                                                        {option.label}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                        <FormDescription>
                                            This currency symbol will be used across the workspace.
                                        </FormDescription>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <div className="flex justify-end">
                                <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700">
                                    {isPending ? "Saving..." : "Save Changes"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </CardContent>
            </Card>
        </div>
    );
};
