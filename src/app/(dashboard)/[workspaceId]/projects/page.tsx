import prisma from "@/lib/db";
import { CreateProjectModal } from "@/components/project/create-project-modal";
import { Button } from "@/components/ui/button";
import { Plus, ListTodo, CheckCircle2, Clock } from "lucide-react";
import { format } from "date-fns";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { ProjectActions } from "@/components/project/project-actions";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ProjectsPage = async ({ params }: { params: Promise<{ workspaceId: string }> }) => {
    const { workspaceId } = await params;
    const user = await currentUser();
    if (!user) redirect("/login");

    const projects = await prisma.project.findMany({
        where: {
            workspaceId: workspaceId
        },
        orderBy: {
            createdAt: 'desc'
        }
    });

    const totalProjects = projects.length;
    const inProgressProjects = projects.filter(p => p.status === "IN_PROGRESS").length;
    const completedProjects = projects.filter(p => p.status === "COMPLETED").length;

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Projects Tracker</h2>
                <div className="flex items-center space-x-2">
                    <CreateProjectModal>
                        <Button>
                            <Plus className="mr-2 h-4 w-4" /> New Project
                        </Button>
                    </CreateProjectModal>
                </div>
            </div>

            {/* Stats Dashboard */}
            <div className="grid gap-4 md:grid-cols-3">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                        <ListTodo className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{totalProjects}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">In Progress</CardTitle>
                        <Clock className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{inProgressProjects}</div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Completed</CardTitle>
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{completedProjects}</div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                {projects.map((project) => (
                    <div key={project.id} className="group relative rounded-xl border bg-card text-card-foreground shadow hover:shadow-md transition">
                        <div className="absolute top-3 right-3 z-10">
                            <ProjectActions workspaceId={workspaceId} projectId={project.id} />
                        </div>
                        <Link href={`/${workspaceId}/projects/${project.id}`}>
                            <div className="p-6 pt-8 cursor-pointer">
                                <div className="mb-4">
                                    <h3 className="tracking-tight text-lg font-semibold truncate pr-6">{project.name}</h3>
                                    <Badge variant={project.status === "COMPLETED" ? "default" : "secondary"} className="mt-2">
                                        {project.status.replace("_", " ")}
                                    </Badge>
                                </div>

                                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px]">
                                    {project.description || "No description provided."}
                                </p>

                                <div className="mt-4 flex items-center justify-between text-xs text-muted-foreground">
                                    <span>
                                        {project.startDate ? format(project.startDate, "MMM d") : "No date"}
                                    </span>
                                    <span>
                                        {format(project.createdAt, "MMM d, yyyy")}
                                    </span>
                                </div>
                            </div>
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};
export default ProjectsPage;
