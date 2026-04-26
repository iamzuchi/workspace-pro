import prisma from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { getProjectTasks } from "@/actions/task";
import { getProjectMembers, getContractors } from "@/actions/project-member";
import { getComments, getActivities } from "@/actions/activities";
import { getDocuments } from "@/actions/document";
import { CreateTaskModal } from "@/components/project/create-task-modal";
import { ProjectTabs } from "@/components/project/project-tabs";
import { ProjectEditSheet } from "@/components/project/project-edit-sheet";
import { serializeDecimal } from "@/lib/utils";

const ProjectDetailsPage = async ({
    params,
    searchParams
}: {
    params: Promise<{ workspaceId: string; projectId: string }>,
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) => {
    const { workspaceId, projectId } = await params;
    const { edit } = await searchParams;
    const defaultEditOpen = edit === 'true';

    const user = await currentUser();
    if (!user) redirect("/login");

    const project = await prisma.project.findUnique({
        where: {
            id: projectId,
            workspaceId: workspaceId
        },
        include: {
            workspace: true,
            inventory: {
                include: {
                    item: true
                }
            },
            memberInventory: {
                include: {
                    item: true,
                    teamMember: true,
                    usages: true
                }
            },
            expenses: {
                orderBy: {
                    date: "desc"
                }
            },
            teams: {
                include: {
                    members: true
                }
            },
            payments: true
        }
    });

    if (!project) {
        redirect(`/${workspaceId}/projects`);
        return null;
    }

    const workspaceItems = await prisma.inventoryItem.findMany({
        where: { workspaceId }
    });

    const totalExpenses = project.expenses.reduce((acc: number, e: any) => acc + Number(e.amount), 0);

    const [comments, activities, documents, tasks, members, contractors] = await Promise.all([
        getComments(projectId),
        getActivities(projectId),
        getDocuments(workspaceId, projectId),
        getProjectTasks(projectId),
        getProjectMembers(projectId),
        getContractors(workspaceId)
    ]);

    const member = await prisma.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId,
                userId: user?.id as string
            }
        }
    });

    const workspaceMembers = await prisma.workspaceMember.findMany({
        where: { workspaceId },
        include: { user: true }
    });

    const workspaceTeams = await prisma.team.findMany({
        where: { workspaceId }
    });

    const allTeamMembers = project.teams.flatMap(t => t.members);

    const plainProject = serializeDecimal(project);
    const plainWorkspaceItems = serializeDecimal(workspaceItems);
    const plainContractors = serializeDecimal(contractors);

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div className="mb-2">
                <Link href={`/${workspaceId}/projects`} className="flex w-fit items-center text-sm text-muted-foreground hover:text-foreground">
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    Back to Projects
                </Link>
            </div>
            <div className="flex flex-col sm:flex-row items-start justify-between gap-y-4 sm:gap-y-0">
                <div className="space-y-1">
                    <div className="flex items-center flex-wrap gap-2">
                        <h2 className="text-2xl md:text-3xl font-bold tracking-tight">{project.name}</h2>
                        <Badge variant="outline" className="h-fit whitespace-nowrap">{project.status}</Badge>
                    </div>
                    <p className="text-sm md:text-base text-muted-foreground line-clamp-2 md:line-clamp-none">
                        {project.description || "No description provided."}
                    </p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    <ProjectEditSheet
                        workspaceId={workspaceId}
                        project={plainProject}
                        userRole={project.workspace.ownerId === user?.id ? "OWNER" : member?.role}
                        members={members}
                        workspaceMembers={workspaceMembers}
                        workspaceTeams={workspaceTeams}
                        defaultOpen={defaultEditOpen}
                    />
                    <CreateTaskModal workspaceId={workspaceId} projectId={projectId} members={members.map((m: any) => m.user)} />
                </div>
            </div>

            <ProjectTabs
                workspaceId={workspaceId}
                projectId={projectId}
                project={plainProject}
                workspaceItems={plainWorkspaceItems}
                projectStock={plainProject.inventory}
                memberStock={plainProject.memberInventory}
                teamMembers={allTeamMembers}
                comments={comments}
                activities={activities}
                documents={documents}
                tasks={tasks}
                members={members}
                contractors={plainContractors}
                totalExpenses={totalExpenses}
                currentUserId={user.id as string}
            />
        </div>
    );
};

export default ProjectDetailsPage;
