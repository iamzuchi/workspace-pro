import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getTeams } from "@/actions/team";
import { TeamList } from "@/components/team/team-list";
import { TeamHeader } from "@/components/team/team-header";
import prisma from "@/lib/db";

const TeamPage = async ({
    params
}: {
    params: Promise<{ workspaceId: string }>
}) => {
    const { workspaceId } = await params;
    const user = await currentUser();
    if (!user) redirect("/login");

    const workspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: { currency: true }
    });

    const teams = await getTeams(workspaceId);
    const projects = await prisma.project.findMany({
        where: { workspaceId },
        select: { id: true, name: true }
    });

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <TeamHeader workspaceId={workspaceId} projects={projects} />
            <TeamList teams={teams} workspaceId={workspaceId} projects={projects} currency={workspace?.currency || "USD"} />
        </div>
    );
};

export default TeamPage;
