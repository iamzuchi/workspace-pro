import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getWorkspaces } from "@/actions/workspace";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, FolderKanban, Plus, ArrowRight } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const WorkspacesPage = async () => {
    const user = await currentUser();
    if (!user || !user.id) redirect("/login");

    const workspaces = await getWorkspaces(user.id);

    return (
        <div className="min-h-screen bg-gradient-to-br from-zinc-50 to-zinc-100 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight">Your Workspaces</h1>
                        <p className="text-muted-foreground mt-2">Select a workspace to continue or create a new one</p>
                    </div>
                    <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700" asChild>
                        <Link href="/onboarding">
                            <Plus className="h-5 w-5 mr-2" />
                            Create Workspace
                        </Link>
                    </Button>
                </div>

                {workspaces.length === 0 ? (
                    <Card className="border-dashed border-2 border-zinc-300 bg-white/50">
                        <CardContent className="flex flex-col items-center justify-center py-16">
                            <Building2 className="h-16 w-16 text-zinc-400 mb-4" />
                            <h3 className="text-xl font-bold text-zinc-700 mb-2">No workspaces yet</h3>
                            <p className="text-zinc-500 mb-6 text-center max-w-md">
                                Get started by creating your first workspace to manage projects, teams, and finances.
                            </p>
                            <Button size="lg" className="bg-emerald-600 hover:bg-emerald-700" asChild>
                                <Link href="/onboarding">
                                    <Plus className="h-5 w-5 mr-2" />
                                    Create Your First Workspace
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {workspaces.map((workspace) => (
                            <Card
                                key={workspace.id}
                                className="group hover:shadow-xl transition-all duration-300 border-none bg-white hover:scale-[1.02] cursor-pointer"
                            >
                                <Link href={`/${workspace.id}`}>
                                    <CardHeader className="space-y-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                {workspace.logo ? (
                                                    <div className="relative h-12 w-12 rounded-lg overflow-hidden bg-zinc-100 flex-shrink-0">
                                                        <Image
                                                            src={workspace.logo}
                                                            alt={workspace.name}
                                                            fill
                                                            className="object-cover"
                                                        />
                                                    </div>
                                                ) : (
                                                    <div className="h-12 w-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center flex-shrink-0">
                                                        <Building2 className="h-6 w-6 text-white" />
                                                    </div>
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <CardTitle className="text-lg truncate">{workspace.name}</CardTitle>
                                                    <CardDescription className="text-xs truncate">
                                                        {workspace.slug}
                                                    </CardDescription>
                                                </div>
                                            </div>
                                            <ArrowRight className="h-5 w-5 text-zinc-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all flex-shrink-0" />
                                        </div>
                                        {workspace.description && (
                                            <p className="text-sm text-zinc-600 line-clamp-2">{workspace.description}</p>
                                        )}
                                    </CardHeader>
                                    <CardContent>
                                        <div className="flex items-center gap-4 text-xs text-zinc-500">
                                            <div className="flex items-center gap-1">
                                                <Users className="h-3.5 w-3.5" />
                                                <span>{workspace._count.members} members</span>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <FolderKanban className="h-3.5 w-3.5" />
                                                <span>{workspace._count.projects} projects</span>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Link>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default WorkspacesPage;
