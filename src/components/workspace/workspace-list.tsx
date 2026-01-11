"use client";

import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CreateWorkspaceModal } from "./create-workspace-modal";
import { useState } from "react";
import Link from "next/link";
import { ChevronRight, Globe, Plus } from "lucide-react";

interface WorkspaceListProps {
    workspaces: {
        id: string;
        name: string;
        slug: string;
    }[];
}

export const WorkspaceList = ({ workspaces }: WorkspaceListProps) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-50/50 p-4">
            <CreateWorkspaceModal isOpen={isOpen} onClose={() => setIsOpen(false)} />

            <Card className="w-full max-w-xl transition-all duration-300 border-none shadow-xl bg-white/80 backdrop-blur-sm">
                <CardHeader className="text-center space-y-2 pb-8">
                    <div className="mx-auto w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-2">
                        <Globe className="w-6 h-6 text-primary" />
                    </div>
                    <CardTitle className="text-3xl font-bold tracking-tight text-slate-900">Your Workspaces</CardTitle>
                    <CardDescription className="text-slate-500 text-lg">
                        Select a workspace to continue working on your projects
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4 px-8">
                    {workspaces.map((workspace) => (
                        <Link
                            key={workspace.id}
                            href={`/${workspace.id}`}
                            className="group flex items-center justify-between p-4 rounded-xl border border-slate-200 bg-white hover:border-primary/50 hover:bg-primary/5 hover:shadow-md transition-all duration-200"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-lg bg-slate-100 group-hover:bg-primary/10 flex items-center justify-center font-bold text-slate-600 group-hover:text-primary transition-colors">
                                    {workspace.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex flex-col">
                                    <span className="font-semibold text-slate-900 group-hover:text-primary transition-colors">
                                        {workspace.name}
                                    </span>
                                    <span className="text-xs text-slate-500 font-medium">
                                        workspace-pro.com/{workspace.slug}
                                    </span>
                                </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-slate-400 group-hover:text-primary transform group-hover:translate-x-1 transition-all" />
                        </Link>
                    ))}

                    <Button
                        onClick={() => setIsOpen(true)}
                        variant="outline"
                        className="w-full h-14 border-dashed border-2 border-slate-300 hover:border-primary hover:bg-primary/5 text-slate-600 hover:text-primary font-semibold transition-all duration-200 rounded-xl mt-4 group"
                    >
                        <Plus className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                        Create New Workspace
                    </Button>
                </CardContent>
                <CardFooter className="pt-8 pb-4 text-center">
                    <p className="w-full text-sm text-slate-400 font-medium">
                        logged in as your account
                    </p>
                </CardFooter>
            </Card>
        </div>
    );
};
