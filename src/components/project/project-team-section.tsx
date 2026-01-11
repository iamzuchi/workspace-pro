import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Mail, Briefcase, MapPin, DollarSign, TrendingUp } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

import { formatCurrency } from "@/lib/currency";

interface ProjectTeamSectionProps {
    team: {
        id: string;
        name: string;
        description: string | null;
        members: {
            id: string;
            name: string;
            contact: string | null;
            occupation: string | null;
            address: string | null;
        }[];
        metrics?: {
            totalProjects: number;
            totalPaid: number;
            amountPending: number;
        };
    } | null;
    workspaceId: string;
    contractors?: any[];
    currency: string;
}

export const ProjectTeamSection = ({ team, workspaceId, contractors, currency }: ProjectTeamSectionProps) => {
    if (!team) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Team
                    </CardTitle>
                    <CardDescription>No team assigned to this project</CardDescription>
                </CardHeader>
                <CardContent>
                    <p className="text-sm text-muted-foreground">
                        Assign a team to track members and financial metrics for this project.
                    </p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <Users className="h-5 w-5" />
                            {team.name}
                        </CardTitle>
                        {team.description && (
                            <CardDescription className="mt-1">{team.description}</CardDescription>
                        )}
                    </div>
                    <Link href={`/${workspaceId}/team`}>
                        <Badge variant="outline" className="cursor-pointer hover:bg-zinc-100">
                            View Team Details
                        </Badge>
                    </Link>
                </div>
            </CardHeader>
            <CardContent className="space-y-6">
                {/* Team Members */}
                <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Users className="h-4 w-4" />
                        Team Members ({team.members.length})
                    </h4>
                    <div className="grid gap-3 md:grid-cols-2">
                        {team.members.map((member) => (
                            <div key={member.id} className="p-3 rounded-lg border bg-zinc-50/50 space-y-1">
                                <p className="font-medium text-sm">{member.name}</p>
                                {member.occupation && (
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Briefcase className="h-3 w-3" />
                                        {member.occupation}
                                    </p>
                                )}
                                {member.contact && (
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Mail className="h-3 w-3" />
                                        {member.contact}
                                    </p>
                                )}
                                {member.address && (
                                    <p className="text-xs text-muted-foreground flex items-center gap-1">
                                        <MapPin className="h-3 w-3" />
                                        {member.address}
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Contractors Section */}
                <div>
                    <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                        <Briefcase className="h-4 w-4" />
                        Contractors
                    </h4>
                    {contractors && contractors.length > 0 ? (
                        <div className="grid gap-3 md:grid-cols-2">
                            {contractors.map((contractor) => (
                                <div key={contractor.id} className="p-3 rounded-lg border bg-zinc-50/50 space-y-1">
                                    <p className="font-medium text-sm">{contractor.companyName}</p>
                                    <p className="text-xs text-muted-foreground">{contractor.contactName || "No contact name"}</p>
                                    {contractor.email && (
                                        <p className="text-xs text-muted-foreground flex items-center gap-1">
                                            <Mail className="h-3 w-3" />
                                            {contractor.email}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className="text-sm text-muted-foreground">No contractors assigned.</p>
                    )}
                </div>

                {/* Financial Metrics */}
                {team.metrics && (
                    <div>
                        <h4 className="text-sm font-semibold mb-3 flex items-center gap-2">
                            <DollarSign className="h-4 w-4" />
                            Financial Overview
                        </h4>
                        <div className="grid gap-3 md:grid-cols-3">
                            <div className="p-3 rounded-lg border bg-emerald-50/50">
                                <p className="text-xs text-muted-foreground mb-1">Total Paid</p>
                                <p className="text-lg font-bold text-emerald-700">
                                    {formatCurrency(team.metrics.totalPaid, currency)}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg border bg-amber-50/50">
                                <p className="text-xs text-muted-foreground mb-1">Amount Pending</p>
                                <p className="text-lg font-bold text-amber-700">
                                    {formatCurrency(team.metrics.amountPending, currency)}
                                </p>
                            </div>
                            <div className="p-3 rounded-lg border bg-blue-50/50">
                                <p className="text-xs text-muted-foreground mb-1">Total Projects</p>
                                <p className="text-lg font-bold text-blue-700 flex items-center gap-1">
                                    <TrendingUp className="h-4 w-4" />
                                    {team.metrics.totalProjects}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};
