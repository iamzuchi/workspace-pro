"use client";

import { useState, useTransition } from "react";
import { inviteMemberByEmail } from "@/actions/invitation";
// Removed direct import of Role from @prisma/client to avoid client-side build errors
// import { Role } from "@prisma/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Copy, Check } from "lucide-react";
import { toast } from "sonner";

interface InviteMemberFormProps {
    workspaceId: string;
}

export const InviteMemberForm = ({ workspaceId }: InviteMemberFormProps) => {
    const [email, setEmail] = useState("");
    // Defaulting to "TEAM_MEMBER" string instead of enum to avoid import
    const [role, setRole] = useState("TEAM_MEMBER");
    const [isPending, startTransition] = useTransition();
    const [inviteLink, setInviteLink] = useState<string | null>(null);
    const [copied, setCopied] = useState(false);

    const [publicLink, setPublicLink] = useState<string | null>(null);
    const [publicCopied, setPublicCopied] = useState(false);

    const onInvite = () => {
        if (!email) return;

        startTransition(() => {
            inviteMemberByEmail(workspaceId, email).then((data) => {
                if (data.success) {
                    setInviteLink(data.inviteLink || null);
                    setEmail("");
                    toast.success("Invitation sent");
                } else if (data.error) {
                    toast.error(data.error);
                }
            });
        });
    };

    const copyToClipboard = () => {
        if (inviteLink) {
            navigator.clipboard.writeText(inviteLink);
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast.success("Copied to clipboard");
        }
    };

    const generatePublicLink = () => {
        startTransition(() => {
            import("@/actions/invitation").then(({ createInvitationLink }) => {
                createInvitationLink(workspaceId).then((res) => {
                    if (res.success && res.token) {
                        setPublicLink(`${window.location.origin}/invite/${res.token}`);
                        toast.success("Public link ready");
                    } else {
                        toast.error(res.error || "Failed to generate link");
                    }
                });
            });
        });
    };

    const copyPublicLink = () => {
        if (publicLink) {
            navigator.clipboard.writeText(publicLink);
            setPublicCopied(true);
            setTimeout(() => setPublicCopied(false), 2000);
            toast.success("Copied to clipboard");
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Invite Member</CardTitle>
                    <CardDescription>Invite someone to join your workspace via email.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex flex-col md:flex-row gap-4">
                        <Input
                            placeholder="Email address"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            disabled={isPending}
                        />
                        {/* Role selection temporarily disabled as action defaults to TEAM_MEMBER */}
                        {/* <Select
                            value={role}
                            onValueChange={(value) => setRole(value as Role)}
                            disabled={isPending}
                        >
                           ...
                        </Select> */ }
                        <Button onClick={onInvite} disabled={isPending}>
                            Send Invite
                        </Button>
                    </div>
                    {inviteLink && (
                        <div className="mt-4 p-3 bg-zinc-100 rounded-md flex items-center justify-between border border-zinc-200">
                            <div className="truncate text-sm font-mono mr-2">{inviteLink}</div>
                            <Button variant="ghost" size="sm" onClick={copyToClipboard}>
                                {copied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle>Public Invite Link</CardTitle>
                    <CardDescription>Anyone with this link can join your workspace.</CardDescription>
                </CardHeader>
                <CardContent>
                    {!publicLink ? (
                        <Button variant="outline" onClick={generatePublicLink} disabled={isPending}>
                            Generate Link
                        </Button>
                    ) : (
                        <div className="flex items-center gap-4">
                            <div className="flex-1 p-3 bg-zinc-100 rounded-md flex items-center justify-between border border-zinc-200">
                                <div className="truncate text-sm font-mono mr-2">{publicLink}</div>
                                <Button variant="ghost" size="sm" onClick={copyPublicLink}>
                                    {publicCopied ? <Check className="h-4 w-4 text-emerald-500" /> : <Copy className="h-4 w-4" />}
                                </Button>
                            </div>
                            <Button variant="outline" onClick={generatePublicLink} disabled={isPending}>
                                Regenerate
                            </Button>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
};
