import { currentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getWorkspaceMembers } from "@/actions/workspace-members";
import { getWorkspaceById } from "@/actions/workspace";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MemberList } from "@/components/workspace/member-list";
import { InviteMemberForm } from "@/components/workspace/invite-member-form";
import { WorkspaceSettingsForm } from "@/components/workspace/workspace-settings-form";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const SettingsPage = async ({ params }: { params: Promise<{ workspaceId: string }> }) => {
    const { workspaceId } = await params;
    const user = await currentUser();
    if (!user) redirect("/login");

    const workspace = await getWorkspaceById(workspaceId);
    if (!workspace) redirect("/");

    const members = await getWorkspaceMembers(workspaceId);

    return (
        <div className="flex-1 space-y-4 p-8 pt-6">
            <div className="flex items-center justify-between space-y-2">
                <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
            </div>
            <Tabs defaultValue="general" className="space-y-4">
                <TabsList>
                    <TabsTrigger value="general">General</TabsTrigger>
                    <TabsTrigger value="customization">Customization</TabsTrigger>
                    <TabsTrigger value="members">Members</TabsTrigger>
                </TabsList>
                <TabsContent value="general" className="space-y-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Workspace Name</CardTitle>
                            <CardDescription>Update your workspace display name.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex flex-col md:flex-row gap-4">
                                <Input defaultValue={workspace.name} />
                                <Button>Update Name</Button>
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>
                <TabsContent value="customization" className="space-y-4">
                    <WorkspaceSettingsForm workspace={workspace} />
                </TabsContent>
                <TabsContent value="members" className="space-y-6">
                    <InviteMemberForm workspaceId={workspaceId} />
                    <MemberList
                        workspaceId={workspaceId}
                        members={members}
                        currentUserId={user.id!}
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default SettingsPage;
