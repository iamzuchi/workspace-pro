"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, Loader2 } from "lucide-react";
import {
    Command,
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import { searchTasks, searchProjects } from "@/actions/task";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface GlobalTaskSearchProps {
    workspaceId: string;
}

export const GlobalTaskSearch = ({ workspaceId }: GlobalTaskSearchProps) => {
    const [open, setOpen] = useState(false);
    const [query, setQuery] = useState("");
    const [results, setResults] = useState<{ tasks: any[]; projects: any[] }>({ tasks: [], projects: [] });
    const [isLoading, setIsLoading] = useState(false);
    const router = useRouter();

    useEffect(() => {
        const down = (e: KeyboardEvent) => {
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                setOpen((open) => !open);
            }
        };
        document.addEventListener("keydown", down);
        return () => document.removeEventListener("keydown", down);
    }, []);

    const fetchResults = useCallback(async (searchQuery: string) => {
        if (searchQuery.length < 2) {
            setResults({ tasks: [], projects: [] });
            return;
        }

        setIsLoading(true);
        try {
            const [tasks, projects] = await Promise.all([
                searchTasks(workspaceId, searchQuery),
                searchProjects(workspaceId, searchQuery)
            ]);
            setResults({ tasks, projects });
        } catch (error) {
            console.error("Failed to fetch search results", error);
            setResults({ tasks: [], projects: [] });
        } finally {
            setIsLoading(false);
        }
    }, [workspaceId]);

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchResults(query);
        }, 300);

        return () => clearTimeout(timer);
    }, [query, fetchResults]);

    const onSelectTask = (projectId: string, taskId: string) => {
        setOpen(false);
        router.push(`/${workspaceId}/projects/${projectId}?taskId=${taskId}`);
    };

    const onSelectProject = (projectId: string) => {
        setOpen(false);
        router.push(`/${workspaceId}/projects/${projectId}`);
    };

    return (
        <>
            <div 
                onClick={() => setOpen(true)}
                className="group px-4 py-2 flex items-center gap-x-2 w-full rounded-md border border-input bg-background hover:bg-accent hover:text-accent-foreground cursor-pointer transition"
            >
                <Search className="h-4 w-4 text-muted-foreground group-hover:text-foreground" />
                <p className="font-semibold text-sm text-muted-foreground group-hover:text-foreground transition">
                    Search projects and tasks...
                </p>
                <kbd className="ml-auto pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
                    <span className="text-xs">⌘</span>K
                </kbd>
            </div>

            <CommandDialog open={open} onOpenChange={setOpen} shouldFilter={false}>
                <CommandInput 
                    placeholder="Type project or task title..." 
                    value={query}
                    onValueChange={setQuery}
                />
                <CommandList>
                    <CommandEmpty>
                        {isLoading ? (
                            <div className="flex items-center justify-center py-6">
                                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                            </div>
                        ) : (
                            "No results found."
                        )}
                    </CommandEmpty>
                    
                    {!isLoading && results.projects.length > 0 && (
                        <CommandGroup heading="Projects">
                            {results.projects.map((project) => (
                                <CommandItem 
                                    key={project.id}
                                    onSelect={() => onSelectProject(project.id)}
                                    className="cursor-pointer"
                                >
                                    <div className="flex flex-col gap-y-1 w-full">
                                        <span className="font-medium">{project.name}</span>
                                        {project.description && (
                                            <span className="text-xs text-muted-foreground truncate max-w-[400px]">
                                                {project.description}
                                            </span>
                                        )}
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}

                    {!isLoading && results.tasks.length > 0 && (
                        <CommandGroup heading="Tasks">
                            {results.tasks.map((task) => (
                                <CommandItem 
                                    key={task.id}
                                    onSelect={() => onSelectTask(task.projectId, task.id)}
                                    className="cursor-pointer"
                                >
                                    <div className="flex flex-col gap-y-1 w-full">
                                        <div className="flex items-center justify-between">
                                            <span className="font-medium">{task.title}</span>
                                            <Badge variant="outline" className="text-[10px] uppercase">
                                                {task.project.name}
                                            </Badge>
                                        </div>
                                        <div className="flex items-center gap-x-2 text-xs text-muted-foreground">
                                            <Badge 
                                                className={cn(
                                                    "text-[10px] h-4",
                                                    task.status === "COMPLETED" ? "bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20" : 
                                                    task.status === "IN_PROGRESS" ? "bg-amber-500/10 text-amber-500 hover:bg-amber-500/20" :
                                                    "bg-slate-500/10 text-slate-500 hover:bg-slate-500/20"
                                                )}
                                            >
                                                {task.status.replace("_", " ")}
                                            </Badge>
                                            <span className="truncate max-w-[300px]">
                                                {task.description || "No description"}
                                            </span>
                                        </div>
                                    </div>
                                </CommandItem>
                            ))}
                        </CommandGroup>
                    )}
                </CommandList>
            </CommandDialog>
        </>
    );
};
