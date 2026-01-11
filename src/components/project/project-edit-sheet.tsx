"use client";

import { useState, useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { ProjectStatus } from "@prisma/client";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { CalendarIcon, Settings, Trash, Plus } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
    Sheet,
    SheetContent,
    SheetDescription,
    SheetHeader,
    SheetTitle,
    SheetTrigger,
    SheetFooter,
} from "@/components/ui/sheet";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

import { UpdateProjectSchema } from "@/schemas/project";
import { updateProject } from "@/actions/update-project";
import { addProjectMember, removeProjectMember } from "@/actions/project-member";
import { cn } from "@/lib/utils";

interface ProjectEditSheetProps {
    workspaceId: string;
    project: any;
    userRole?: string;
    members?: any[];
    workspaceMembers?: any[];
    workspaceTeams?: any[];
}

type FormValues = z.infer<typeof UpdateProjectSchema>;

export const ProjectEditSheet = ({
    workspaceId,
    project,
    userRole,
    members = [],
    workspaceMembers = [],
    workspaceTeams = [],
    defaultOpen = false
}: ProjectEditSheetProps & { defaultOpen?: boolean }) => {
    const router = useRouter();
    const [open, setOpen] = useState(defaultOpen);
    const [isPending, setIsPending] = useState(false);

    useEffect(() => {
        if (defaultOpen) {
            setOpen(true);
        }
    }, [defaultOpen]);

    const form = useForm<FormValues>({
        resolver: zodResolver(UpdateProjectSchema) as any,
        defaultValues: {
            name: project.name,
            description: project.description || "",
            status: project.status,
            budget: Number(project.budget) || 0,
            startDate: project.startDate ? new Date(project.startDate) : undefined,
            endDate: project.endDate ? new Date(project.endDate) : undefined,
        },
    });

    const onSubmit: SubmitHandler<FormValues> = async (values) => {
        setIsPending(true);
        try {
            const data = await updateProject(workspaceId, project.id, values);
            if (data.error) {
                toast.error(data.error);
            } else {
                toast.success(data.success);
                setOpen(false);
                router.refresh();
            }
        } catch (error) {
            toast.error("Something went wrong");
        } finally {
            setIsPending(false);
        }
    };

    const isAllowed = userRole === "OWNER" || userRole === "ADMIN" || userRole === "PROJECT_MANAGER";

    if (!isAllowed) return null;

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="outline" size="sm">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                </Button>
            </SheetTrigger>
            <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto px-6">
                <SheetHeader>
                    <SheetTitle>Edit Project</SheetTitle>
                    <SheetDescription>
                        Make changes to your project settings here.
                    </SheetDescription>
                </SheetHeader>

                <Tabs defaultValue="general" className="mt-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="general">General</TabsTrigger>
                        <TabsTrigger value="team">Team & Members</TabsTrigger>
                    </TabsList>

                    <TabsContent value="general" className="space-y-4 pt-4">
                        <Form {...form}>
                            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
                                <FormField
                                    control={form.control}
                                    name="description"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Description</FormLabel>
                                            <FormControl>
                                                <Textarea disabled={isPending} {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <FormField
                                        control={form.control}
                                        name="status"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Status</FormLabel>
                                                <Select
                                                    onValueChange={field.onChange}
                                                    defaultValue={field.value}
                                                    disabled={isPending}
                                                >
                                                    <FormControl>
                                                        <SelectTrigger>
                                                            <SelectValue placeholder="Select status" />
                                                        </SelectTrigger>
                                                    </FormControl>
                                                    <SelectContent>
                                                        {Object.values(ProjectStatus).map((status) => (
                                                            <SelectItem key={status} value={status}>
                                                                {status}
                                                            </SelectItem>
                                                        ))}
                                                    </SelectContent>
                                                </Select>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                    <FormField
                                        control={form.control}
                                        name="budget"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Budget</FormLabel>
                                                <FormControl>
                                                    <Input type="number" disabled={isPending} {...field} />
                                                </FormControl>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>
                                <div className="grid gap-4">
                                    <FormField
                                        control={form.control}
                                        name="startDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>Start Date</FormLabel>
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
                                        name="endDate"
                                        render={({ field }) => (
                                            <FormItem className="flex flex-col">
                                                <FormLabel>End Date</FormLabel>
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
                                </div>
                                <SheetFooter>
                                    <Button disabled={isPending} type="submit">Save Changes</Button>
                                </SheetFooter>
                            </form>
                        </Form>
                    </TabsContent>

                    <TabsContent value="team" className="space-y-4 pt-4">
                        <div className="space-y-4">
                            {/* Teams Section */}
                            <div className="space-y-4 pb-4 border-b">
                                <div className="flex items-center justify-between">
                                    <h3 className="text-sm font-medium">Assigned Team</h3>
                                </div>
                                <div className="flex gap-2">
                                    <Select onValueChange={async (teamId) => {
                                        setIsPending(true);
                                        try {
                                            const { assignTeamToProject } = await import("@/actions/team-assignment");
                                            const res = await assignTeamToProject(workspaceId, project.id, teamId);
                                            if (res.error) toast.error(res.error);
                                            else {
                                                toast.success("Team assigned");
                                                router.refresh();
                                            }
                                        } catch {
                                            toast.error("Failed to assign team");
                                        } finally {
                                            setIsPending(false);
                                        }
                                    }} disabled={isPending}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue placeholder={project.teams?.[0]?.name || "Select a team to assign..."} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {workspaceTeams
                                                .filter(t => t.projectId !== project.id) // Filter already assigned (though schema implies 1 team per project, or 1 project per team?)
                                                // Actually schema: Team has projectId. One Team -> One Project.
                                                // So filter teams that are NOT assigned to ANY project.
                                                .filter(t => !t.projectId || t.projectId === project.id)
                                                .map((t) => (
                                                    <SelectItem key={t.id} value={t.id}>
                                                        {t.name}
                                                    </SelectItem>
                                                ))}
                                        </SelectContent>
                                    </Select>
                                    {project.teams?.[0] && (
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            disabled={isPending}
                                            onClick={async () => {
                                                setIsPending(true);
                                                try {
                                                    const { unassignTeamFromProject } = await import("@/actions/team-assignment");
                                                    const res = await unassignTeamFromProject(workspaceId, project.id, project.teams[0].id);
                                                    if (res.error) toast.error(res.error);
                                                    else {
                                                        toast.success("Team unassigned");
                                                        router.refresh();
                                                    }
                                                } catch {
                                                    toast.error("Failed to unassign team");
                                                } finally {
                                                    setIsPending(false);
                                                }
                                            }}
                                        >
                                            <Trash className="h-4 w-4 text-destructive" />
                                        </Button>
                                    )}
                                </div>
                                {project.teams?.[0] && (
                                    <div className="p-3 rounded-lg border bg-blue-50/50 flex items-center justify-between">
                                        <span className="text-sm font-medium text-blue-700">{project.teams[0].name}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between pb-2 border-b">
                                <h3 className="text-sm font-medium">Individual Members ({members.length})</h3>
                            </div>

                            <div className="flex gap-2">
                                <Select onValueChange={async (userId) => {
                                    setIsPending(true);
                                    try {
                                        const res = await addProjectMember(workspaceId, project.id, userId);
                                        if (res.error) toast.error(res.error);
                                        else {
                                            toast.success("Member added");
                                            router.refresh();
                                        }
                                    } catch {
                                        toast.error("Failed to add member");
                                    } finally {
                                        setIsPending(false);
                                    }
                                }} disabled={isPending}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue placeholder="Add a member from workspace..." />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {workspaceMembers
                                            .filter(wm => !members.some(pm => pm.userId === wm.userId))
                                            .map((wm) => (
                                                <SelectItem key={wm.id} value={wm.userId}>
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-6 w-6">
                                                            <AvatarImage src={wm.user.image || ""} />
                                                            <AvatarFallback>{wm.user.name?.[0]}</AvatarFallback>
                                                        </Avatar>
                                                        {wm.user.name} ({wm.role})
                                                    </div>
                                                </SelectItem>
                                            ))}
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-3">
                                {members.map((member) => (
                                    <div key={member.id} className="flex items-center justify-between p-2 rounded-lg border bg-card">
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-8 w-8">
                                                <AvatarImage src={member.user.image || ""} />
                                                <AvatarFallback>{member.user.name?.[0]}</AvatarFallback>
                                            </Avatar>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{member.user.name}</span>
                                                <span className="text-xs text-muted-foreground">{member.user.email}</span>
                                            </div>
                                        </div>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            disabled={isPending}
                                            onClick={async () => {
                                                setIsPending(true);
                                                try {
                                                    const res = await removeProjectMember(workspaceId, project.id, member.userId);
                                                    if (res.error) toast.error(res.error);
                                                    else {
                                                        toast.success("Member removed");
                                                        router.refresh();
                                                    }
                                                } catch {
                                                    toast.error("Failed to remove member");
                                                } finally {
                                                    setIsPending(false);
                                                }
                                            }}
                                        >
                                            <Trash className="h-4 w-4 text-destructive" />
                                        </Button>
                                    </div>
                                ))}
                                {members.length === 0 && (
                                    <p className="text-sm text-center text-muted-foreground py-4">
                                        No members in this project yet.
                                    </p>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </SheetContent>
        </Sheet>
    );
};
