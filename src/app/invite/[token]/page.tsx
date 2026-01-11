import { joinWorkspace, getInvitationDetails } from "@/actions/invitation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { currentUser } from "@/lib/auth";
import Image from "next/image";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Building2 } from "lucide-react";

interface InvitePageProps {
    params: Promise<{ token: string }>;
}

export default async function InvitePage({ params }: InvitePageProps) {
    const user = await currentUser();
    const { token } = await params;

    const { invitation, error } = await getInvitationDetails(token);

    if (error || !invitation) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Card className="w-full max-w-md">
                    <CardHeader>
                        <CardTitle className="text-destructive">Invalid Invitation</CardTitle>
                        <CardDescription>
                            This invitation link is invalid or has expired.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Link href="/">
                            <Button variant="outline" className="w-full">
                                Return Home
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            </div>
        );
    }

    if (!user) {
        return redirect(`/register?callbackUrl=/invite/${token}`);
    }

    const onJoin = async () => {
        "use server";
        const res = await joinWorkspace(token);
        if (res.workspaceId) {
            redirect(`/${res.workspaceId}`);
        } else if (res.error) {
            // In a real app we'd show a toast, but for this server component we might need a client component wrapper
            // or just redirect to an error page. For simplicity, we redirect to home if error.
            redirect("/?error=" + encodeURIComponent(res.error));
        }
    };

    return (
        <div className="flex min-h-screen items-center justify-center p-4 bg-muted/50">
            <Card className="w-full max-w-md">
                <CardHeader className="text-center flex flex-col items-center">
                    <div className="h-20 w-20 rounded-xl bg-primary/10 flex items-center justify-center mb-4 overflow-hidden relative border">
                        {invitation.workspace.logo ? (
                            <Image
                                src={invitation.workspace.logo}
                                alt={invitation.workspace.name}
                                fill
                                className="object-cover"
                            />
                        ) : (
                            <Building2 className="h-10 w-10 text-primary" />
                        )}
                    </div>
                    <CardTitle className="text-2xl">Join {invitation.workspace.name}</CardTitle>
                    <CardDescription>
                        You have been invited to join this workspace.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="bg-muted p-4 rounded-lg text-sm text-center">
                        Signed in as <strong>{user.email}</strong>
                    </div>
                    <form action={onJoin}>
                        <Button className="w-full" size="lg">
                            Join Workspace
                        </Button>
                    </form>
                    <Link href="/">
                        <Button variant="ghost" className="w-full">
                            Cancel
                        </Button>
                    </Link>
                </CardContent>
            </Card>
        </div>
    );
}
