import { redirect } from "next/navigation";
import prisma from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { SetupPage } from "@/components/workspace/setup-page";
import { WorkspaceList } from "@/components/workspace/workspace-list";

const DashboardPage = async () => {
    const user = await currentUser();
    if (!user || !user.id) redirect("/login");

    const memberships = await prisma.workspaceMember.findMany({
        where: { userId: user.id },
        include: { workspace: true }
    });

    if (memberships.length === 0) {
        return <SetupPage />;
    }

    if (memberships.length === 1) {
        redirect(`/${memberships[0].workspaceId}`);
    }

    const workspaces = memberships.map(m => ({
        id: m.workspace.id,
        name: m.workspace.name,
        slug: m.workspace.slug,
    }));

    return <WorkspaceList workspaces={workspaces} />;
}
export default DashboardPage;
