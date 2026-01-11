"use client";

import { User, Contractor, ProjectMember } from "@prisma/client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, Mail, Phone } from "lucide-react";

interface ProjectTeamProps {
    members: (ProjectMember & {
        user: {
            id: string;
            name: string | null;
            email: string;
            image: string | null;
        };
    })[];
    contractors: Contractor[];
}

export const ProjectTeam = ({
    members,
    contractors,
}: ProjectTeamProps) => {
    return (
        <div className="grid gap-6 md:grid-cols-2">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-bold">Project Members</CardTitle>
                    <Users className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {members.length === 0 && (
                            <p className="text-sm text-muted-foreground italic">No members assigned.</p>
                        )}
                        {members.map((member) => (
                            <div key={member.id} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <Avatar>
                                        <AvatarImage src={member.user.image || ""} />
                                        <AvatarFallback>{member.user.name?.[0] || "U"}</AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="text-sm font-medium leading-none">{member.user.name}</p>
                                        <p className="text-xs text-muted-foreground">{member.user.email}</p>
                                    </div>
                                </div>
                                <Badge variant="secondary">{member.role}</Badge>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-bold">Contractors</CardTitle>
                    <Briefcase className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {contractors.length === 0 && (
                            <p className="text-sm text-muted-foreground italic">No contractors associated with this workspace.</p>
                        )}
                        {contractors.map((contractor) => (
                            <div key={contractor.id} className="space-y-1">
                                <div className="flex items-center justify-between">
                                    <p className="text-sm font-medium">{contractor.companyName}</p>
                                    {contractor.contractValue && (
                                        <p className="text-xs font-bold text-green-600">
                                            ${Number(contractor.contractValue).toLocaleString()}
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <Mail className="h-3 w-3" />
                                    <span>{contractor.email || "N/A"}</span>
                                    {contractor.phone && (
                                        <>
                                            <span className="mx-1">•</span>
                                            <Phone className="h-3 w-3" />
                                            <span>{contractor.phone}</span>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};
