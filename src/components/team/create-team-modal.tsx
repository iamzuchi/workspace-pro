"use client";

import * as z from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreateTeamSchema } from "@/schemas/team";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
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
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Plus, Trash2, Users, MapPin, Phone } from "lucide-react";
import { useTransition } from "react";
import { createTeam } from "@/actions/team";
import { toast } from "sonner";

interface CreateTeamModalProps {
    workspaceId: string;
    isOpen: boolean;
    onClose: () => void;
    projects: { id: string; name: string }[];
}

export const CreateTeamModal = ({
    workspaceId,
    isOpen,
    onClose,
    projects,
}: CreateTeamModalProps) => {
    const [isPending, startTransition] = useTransition();

    const form = useForm<z.infer<typeof CreateTeamSchema>>({
        resolver: zodResolver(CreateTeamSchema),
        defaultValues: {
            name: "",
            description: "",
            projectId: undefined,
            members: [{ name: "", contact: "", occupation: "", address: "" }],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control: form.control,
        name: "members",
    });

    const onSubmit = (values: z.infer<typeof CreateTeamSchema>) => {
        startTransition(() => {
            createTeam(workspaceId, values).then((data) => {
                if (data.success) {
                    toast.success(data.success);
                    form.reset();
                    onClose();
                } else if (data.error) {
                    toast.error(data.error);
                }
            });
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle className="text-2xl font-bold">Register New Team</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <Card className="border-zinc-100 bg-zinc-50/30 p-4 space-y-4 shadow-none">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold">Team Name</FormLabel>
                                        <FormControl>
                                            <Input {...field} placeholder="e.g. Frontend Development Team" disabled={isPending} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="projectId"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel className="font-bold">Project (Optional)</FormLabel>
                                            <Select
                                                disabled={isPending}
                                                onValueChange={field.onChange}
                                                defaultValue={field.value ?? undefined}
                                            >

                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Select a project" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    {projects.map((project) => (
                                                        <SelectItem key={project.id} value={project.id}>
                                                            {project.name}
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel className="font-bold">Description</FormLabel>
                                        <FormControl>
                                            <Textarea {...field} placeholder="Briefly describe the team's role..." disabled={isPending} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </Card>

                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-bold flex items-center gap-2">
                                    <Users className="h-5 w-5 text-emerald-500" />
                                    Team Members
                                </h3>
                                <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    onClick={() => append({ name: "", contact: "", occupation: "", address: "" })}
                                    disabled={isPending}
                                    className="border-emerald-200 text-emerald-700 hover:bg-emerald-50"
                                >
                                    <Plus className="h-4 w-4 mr-2" /> Add Member
                                </Button>
                            </div>

                            <div className="space-y-4">
                                {fields.map((field, index) => (
                                    <div key={field.id} className="relative p-6 border rounded-xl bg-white shadow-sm space-y-4 group">
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="icon"
                                            onClick={() => remove(index)}
                                            className="absolute top-2 right-2 h-8 w-8 text-rose-500 hover:bg-rose-50 opacity-0 group-hover:opacity-100 transition"
                                            disabled={isPending || fields.length === 1}
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name={`members.${index}.name`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-bold uppercase text-zinc-500">Full Name</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="John Doe" disabled={isPending} className="bg-zinc-50/30" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`members.${index}.occupation`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-bold uppercase text-zinc-500">Occupation / Role</FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="e.g. Architect" disabled={isPending} className="bg-zinc-50/30" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <FormField
                                                control={form.control}
                                                name={`members.${index}.contact`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-bold uppercase text-zinc-500 flex items-center gap-1">
                                                            <Phone className="h-3 w-3" /> Contact Info
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="+1 234 567 890" disabled={isPending} className="bg-zinc-50/30" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                            <FormField
                                                control={form.control}
                                                name={`members.${index}.address`}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel className="text-xs font-bold uppercase text-zinc-500 flex items-center gap-1">
                                                            <MapPin className="h-3 w-3" /> Address
                                                        </FormLabel>
                                                        <FormControl>
                                                            <Input {...field} placeholder="123 Street Code..." disabled={isPending} className="bg-zinc-50/30" />
                                                        </FormControl>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <DialogFooter className="pt-6 border-t flex items-center justify-end gap-2">
                            <Button type="button" variant="ghost" onClick={onClose} disabled={isPending}>
                                Cancel
                            </Button>
                            <Button type="submit" disabled={isPending} className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold">
                                {isPending ? "Registering..." : "Register Team"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    );
};
