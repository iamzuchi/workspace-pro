"use client";

import { Check, ChevronsUpDown, PlusCircle, Building } from "lucide-react";
import { useState } from "react";
import { useRouter, useParams } from "next/navigation";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { CreateWorkspaceModal } from "@/components/workspace/create-workspace-modal";

interface WorkspaceSwitcherProps {
    items: {
        id: string;
        name: string;
    }[];
};

export const WorkspaceSwitcher = ({
    items = []
}: WorkspaceSwitcherProps) => {
    const params = useParams();
    const router = useRouter();
    const formattedItems = items.map((item) => ({
        label: item.name,
        value: item.id
    }));

    const currentWorkspace = formattedItems.find((item) => item.value === params.workspaceId);

    const [open, setOpen] = useState(false);
    const [modalOpen, setModalOpen] = useState(false);

    const onSelect = (workspaceId: string) => {
        setOpen(false);
        router.push(`/${workspaceId}`);
    };

    return (
        <>
            <CreateWorkspaceModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
            <Popover open={open} onOpenChange={setOpen}>
                <PopoverTrigger asChild>
                    <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={open}
                        className="w-full justify-between bg-zinc-800 text-white border-zinc-700 hover:bg-zinc-700 hover:text-white"
                    >
                        <Building className="mr-2 h-4 w-4" />
                        <span className="truncate">{currentWorkspace?.label || "Select workspace..."}</span>
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[200px] p-0 bg-gray-800 text-white border-gray-700 z-[9999]">
                    <Command className="bg-transparent">
                        <CommandInput placeholder="Search workspace..." className="text-white placeholder:text-gray-400" />
                        <CommandList>
                            <CommandEmpty className="text-gray-400 text-sm p-2">No workspace found.</CommandEmpty>
                            <CommandGroup heading="Workspaces" className="text-gray-400">
                                {formattedItems.map((item) => (
                                    <CommandItem
                                        key={item.value}
                                        onSelect={() => onSelect(item.value)}
                                        className="text-sm cursor-pointer text-gray-200 aria-selected:bg-gray-700 aria-selected:text-white hover:bg-gray-700"
                                    >
                                        <Building className="mr-2 h-4 w-4" />
                                        {item.label}
                                        <Check
                                            className={cn(
                                                "ml-auto h-4 w-4",
                                                currentWorkspace?.value === item.value
                                                    ? "opacity-100"
                                                    : "opacity-0"
                                            )}
                                        />
                                    </CommandItem>
                                ))}
                            </CommandGroup>
                        </CommandList>
                    </Command>
                    <div className="p-2 border-t border-gray-700 bg-gray-800">
                        <Button
                            size="sm"
                            variant="ghost"
                            className="w-full justify-start text-sm font-medium text-gray-200 hover:text-white hover:bg-gray-700"
                            onClick={() => {
                                setOpen(false);
                                setModalOpen(true);
                            }}
                        >
                            <PlusCircle className="mr-2 h-4 w-4" />
                            Create Workspace
                        </Button>
                    </div>
                </PopoverContent>
            </Popover>
        </>
    );
};
