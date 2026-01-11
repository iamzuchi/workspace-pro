import { Navbar } from "@/components/dashboard/navbar";
import { Sidebar } from "@/components/dashboard/sidebar";
import prisma from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";

const WorkspaceLayout = async ({
    children,
    params
}: {
    children: React.ReactNode;
    params: Promise<{ workspaceId: string }>;
}) => {
    const { workspaceId } = await params;
    const user = await currentUser();
    if (!user || !user.id) redirect("/login");

    // Verify membership
    const member = await prisma.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId: workspaceId,
                userId: user.id
            }
        }
    });

    if (!member) {
        redirect("/");
    }

    const workspaces = await prisma.workspace.findMany({
        where: {
            members: {
                some: {
                    userId: user.id
                }
            }
        }
    });

    const currentWorkspace = await prisma.workspace.findUnique({
        where: { id: workspaceId },
        select: {
            id: true,
            name: true,
            logo: true
        }
    });

    return (
        <div className="h-full relative">
            <div className="hidden h-full md:flex md:w-72 md:flex-col md:fixed md:inset-y-0 z-[80] bg-gray-900">
                <Sidebar workspaces={workspaces} currentWorkspace={currentWorkspace} />
            </div>
            <main className="md:pl-72">
                <Navbar workspaces={workspaces} />
                {children}
            </main>
        </div>
    );
};
export default WorkspaceLayout;
