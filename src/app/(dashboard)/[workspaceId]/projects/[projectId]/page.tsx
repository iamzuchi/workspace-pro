import prisma from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { getProjectTasks } from "@/actions/task";
import { getProjectMembers, getContractors } from "@/actions/project-member";
import { getComments, getActivities } from "@/actions/activities";
import { getDocuments } from "@/actions/document";
import { CreateTaskModal } from "@/components/project/create-task-modal";
import { ProjectTabs } from "@/components/project/project-tabs";
import { ProjectBudgetCard } from "@/components/project/project-budget-card";
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
            allocations: {
                include: {
                    item: true
                }
            },
            invoices: {
                orderBy: {
                    createdAt: "desc"
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
        return null; // Satisfy TS that execution stops here
    }

    const workspaceItems = await prisma.inventoryItem.findMany({
        where: { workspaceId }
    });

    const totalPaid = project.payments.reduce((acc, p) => acc + Number(p.amount), 0);

    const [comments, activities, documents, tasks, members, contractors] = await Promise.all([
        getComments(projectId),
        getActivities(projectId),
        getDocuments(workspaceId, projectId),
        getProjectTasks(projectId),
        getProjectMembers(projectId),
        getContractors(workspaceId)
    ]);

    // Check permissions for current user to pass to EditSheet
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

    const plainProject = serializeDecimal(project);
    const plainWorkspaceItems = serializeDecimal(workspaceItems);
    const plainContractors = serializeDecimal(contractors);

    // comments, activities, documents, tasks, members should be fine unless they have decimals, 
    // but safe to serialize if unsure. For now, let's assume they are fine as verified before 
    // (except maybe deeply nested ones?), but let's stick to known Decimal locations.
    // Tasks, Members, Document models don't have Decimal. Comments/Activities don't.

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-start justify-between space-y-2">
                <div>
                    <div className="flex items-center gap-2">
                        <h2 className="text-3xl font-bold tracking-tight">{project.name}</h2>
                        <Badge variant="outline" className="h-fit">{project.status}</Badge>
                    </div>
                    <p className="text-muted-foreground">{project.description || "No description provided."}</p>
                </div>
                <div className="flex items-center gap-2">
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
                comments={comments}
                activities={activities}
                documents={documents}
                tasks={tasks}
                members={members}
                contractors={plainContractors}
                totalPaid={totalPaid}
            />
        </div>
    );
};

export default ProjectDetailsPage;


