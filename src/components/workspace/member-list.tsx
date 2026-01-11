"use client";

import { useTransition } from "react";
import { updateMemberRole, removeMember } from "@/actions/workspace-members";
import { Role } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface MemberListProps {
    workspaceId: string;
    members: any[];
    currentUserId: string;
}

export const MemberList = ({ workspaceId, members, currentUserId }: MemberListProps) => {
    const [isPending, startTransition] = useTransition();

    const onRoleChange = (memberId: string, role: Role) => {
        startTransition(() => {
            updateMemberRole(workspaceId, memberId, role).then((data) => {
                if (data.error) alert(data.error);
            });
        });
    };

    const onRemove = (memberId: string) => {
        if (confirm("Are you sure you want to remove this member?")) {
            startTransition(() => {
                removeMember(workspaceId, memberId).then((data) => {
                    if (data.error) alert(data.error);
                });
            });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle>Members</CardTitle>
                <CardDescription>Manage member roles and permissions.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {members.map((member) => (
                        <div key={member.id} className="flex items-center justify-between gap-4 p-2 rounded-lg hover:bg-zinc-50 transition">
                            <div className="flex items-center gap-3">
                                <Avatar>
                                    <AvatarImage src={member.user.image} />
                                    <AvatarFallback>{member.user.name?.[0] || member.user.email[0]}</AvatarFallback>
                                </Avatar>
                                <div>
                                    <div className="text-sm font-medium">{member.user.name || "User"}</div>
                                    <div className="text-xs text-zinc-500">{member.user.email}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Select
                                    defaultValue={member.role}
                                    onValueChange={(value) => onRoleChange(member.id, value as Role)}
                                    disabled={isPending || member.userId === currentUserId}
                                >
                                    <SelectTrigger className="w-[150px] text-xs">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value={Role.ADMIN}>Admin</SelectItem>
                                        <SelectItem value={Role.PROJECT_MANAGER}>Project Manager</SelectItem>
                                        <SelectItem value={Role.ACCOUNTANT}>Accountant</SelectItem>
                                        <SelectItem value={Role.TEAM_MEMBER}>Team Member</SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => onRemove(member.id)}
                                    disabled={isPending || member.userId === currentUserId}
                                    className="text-destructive hover:text-destructive hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            </CardContent>
        </Card>
    );
};
