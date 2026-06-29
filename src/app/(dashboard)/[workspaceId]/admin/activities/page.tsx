import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { checkPermissions } from "@/lib/permissions";
import { Role } from "@prisma/client";
import { getWorkspaceActivities } from "@/actions/activities";
import { ActivityLogTable } from "@/components/admin/activity-log-table";
import prisma from "@/lib/db";

const AdminActivitiesPage = async ({
    params
}: {
    params: Promise<{ workspaceId: string }>
}) => {
    const { workspaceId } = await params;
    const user = await currentUser();
    if (!user || !user.id) redirect("/login");

    // Protect the route: Only ADMIN is allowed to view
    const { isAllowed } = await checkPermissions(user.id, workspaceId, [Role.ADMIN]);
    if (!isAllowed) {
        redirect(`/${workspaceId}`);
    }

    const activities = await getWorkspaceActivities(workspaceId);
    
    // Fetch users for dropdown filtering
    const members = await prisma.workspaceMember.findMany({
        where: { workspaceId },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    image: true
                }
            }
        }
    });

    const workspaceUsers = members.map((m: any) => m.user);

    return (
        <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
            <div>
                <h2 className="text-2xl md:text-3xl font-bold tracking-tight">Workspace Activity Log</h2>
                <p className="text-sm text-muted-foreground">
                    Admin Audit Log showing all system actions and user operations in this workspace.
                </p>
            </div>
            <ActivityLogTable activities={activities} users={workspaceUsers} />
        </div>
    );
};

export default AdminActivitiesPage;
