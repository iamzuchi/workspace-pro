"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Users, Briefcase, DollarSign, Clock, MapPin, Phone, BriefcaseBusiness, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { EditTeamModal } from "./edit-team-modal";

import { formatCurrency } from "@/lib/currency";

interface TeamListProps {
    teams: any[];
    workspaceId: string;
    projects: { id: string; name: string }[];
    currency: string;
}

export const TeamList = ({ teams, workspaceId, projects, currency }: TeamListProps) => {
    const [editingTeam, setEditingTeam] = useState<any>(null);

    if (teams.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[400px] border-2 border-dashed rounded-xl border-zinc-200">
                <Users className="h-10 w-10 text-zinc-400 mb-4" />
                <p className="text-zinc-500 font-medium">No teams registered yet.</p>
                <p className="text-zinc-400 text-sm">Register your first team to start tracking projects and payments.</p>
            </div>
        );
    }

    return (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {teams.map((team) => (
                <Card key={team.id} className="overflow-hidden shadow-sm hover:shadow-md transition bg-white border-zinc-100">
                    <CardHeader className="pb-3 border-b bg-zinc-50/30">
                        <div className="flex items-center justify-between">
                            <CardTitle className="text-xl font-bold">{team.name}</CardTitle>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline" className="bg-emerald-50 text-emerald-700 border-emerald-200">
                                    {team.members.length} Members
                                </Badge>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-zinc-400 hover:text-emerald-600"
                                    onClick={() => setEditingTeam(team)}
                                >
                                    <Pencil className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                        {team.project && (
                            <div className="flex items-center gap-1 text-sm text-zinc-500 mt-1">
                                <Briefcase className="h-3.5 w-3.5" />
                                <span>{team.project.name}</span>
                            </div>
                        )}
                    </CardHeader>
                    <CardContent className="pt-6 space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Total Paid</p>
                                <div className="flex items-center gap-1 text-emerald-600 font-bold text-lg">
                                    <span>{formatCurrency(team.metrics.totalPaid, currency)}</span>
                                </div>
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">Pending</p>
                                <div className="flex items-center gap-1 text-amber-600 font-bold text-lg">
                                    <span>{formatCurrency(team.metrics.amountPending, currency)}</span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">Team Members</p>
                            <div className="space-y-2">
                                {team.members.map((member: any) => (
                                    <div key={member.id} className="p-2 px-3 rounded-lg bg-zinc-50 border border-zinc-100 group hover:bg-white hover:border-emerald-200 transition">
                                        <div className="flex items-center justify-between mb-1">
                                            <p className="text-sm font-bold text-zinc-800">{member.name}</p>
                                            <p className="text-[9px] text-zinc-500 bg-white border border-zinc-200 px-1.5 py-0.5 rounded uppercase font-bold">
                                                {member.occupation || "Member"}
                                            </p>
                                        </div>
                                        <div className="grid grid-cols-1 gap-1 mt-1.5">
                                            {member.contact && (
                                                <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                                                    <Phone className="h-3 w-3 text-zinc-400" />
                                                    <span>{member.contact}</span>
                                                </div>
                                            )}
                                            {member.address && (
                                                <div className="flex items-center gap-2 text-[11px] text-zinc-500">
                                                    <MapPin className="h-3 w-3 text-zinc-400" />
                                                    <span className="truncate">{member.address}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}

            {editingTeam && (
                <EditTeamModal
                    workspaceId={workspaceId}
                    isOpen={!!editingTeam}
                    onClose={() => setEditingTeam(null)}
                    projects={projects}
                    team={editingTeam}
                />
            )}
        </div>
    );
};
