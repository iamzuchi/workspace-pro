"use server";

import * as z from "zod";
import prisma from "@/lib/db";
import { CreateTeamSchema } from "@/schemas/team";
import { currentUser } from "@/lib/auth";
import { checkPermissions, PERMISSIONS } from "@/lib/permissions";
import { logActivity } from "./activities";
import { revalidatePath } from "next/cache";
import { serializeDecimal } from "@/lib/utils";

export const createTeam = async (
    workspaceId: string,
    values: z.infer<typeof CreateTeamSchema>
) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    const { isAllowed } = await checkPermissions(user.id, workspaceId, [...PERMISSIONS.TEAMS.CREATE]); // Assuming workspace admin/manager can create teams
    if (!isAllowed) return { error: "Permission denied" };

    const validatedFields = CreateTeamSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Invalid fields" };

    const { name, description, projectId, members } = validatedFields.data;

    try {
        const team = await prisma.team.create({
            data: {
                workspaceId,
                name,
                description,
                projects: projectId ? {
                    connect: { id: projectId }
                } : undefined,
                members: {
                    create: members?.map(member => ({
                        name: member.name,
                        contact: member.contact,
                        occupation: member.occupation,
                        address: member.address,
                    }))
                }
            }
        });

        await logActivity(
            workspaceId,
            projectId || null,
            "CREATED_TEAM",
            `Team "${name}" created with ${members?.length || 0} members`
        );


        revalidatePath(`/${workspaceId}/team`);
        return { success: "Team created successfully", teamId: team.id };
    } catch (error) {
        console.error(error);
        return { error: "Failed to create team" };
    }
};

export const updateTeam = async (
    workspaceId: string,
    teamId: string,
    values: z.infer<typeof CreateTeamSchema>
) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    const { isAllowed } = await checkPermissions(user.id, workspaceId, [...PERMISSIONS.TEAMS.UPDATE]);
    if (!isAllowed) return { error: "Permission denied" };

    const validatedFields = CreateTeamSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Invalid fields" };

    const { name, description, projectId, members } = validatedFields.data;

    try {
        await prisma.$transaction(async (tx: any) => {
            await tx.team.update({
                where: { id: teamId, workspaceId },
                data: {
                    name,
                    description,
                    // Note: We don't update projects here as it's many-to-many and managed separately
                    // but we can optionally handle the single projectId if provided in the schema
                }
            });
            // Diff members instead of replacing all to preserve task assignments
            const currentMembers = await tx.teamMember.findMany({
                where: { teamId }
            });
            const currentMemberIds = currentMembers.map((m: any) => m.id);

            // 1. Identify members to delete
            const incomingIds = members ? (members.map((m: any) => m.id).filter(Boolean) as string[]) : [];
            const membersToDelete = currentMembers.filter((m: any) => !incomingIds.includes(m.id));

            if (membersToDelete.length > 0) {
                // @ts-ignore
                await tx.teamMember.deleteMany({
                    where: {
                        id: { in: membersToDelete.map((m: any) => m.id) }
                    }
                });
            }

            // 2. Identify members to update
            const membersToUpdate = members ? members.filter((m: any) => m.id && currentMemberIds.includes(m.id)) : [];
            for (const member of membersToUpdate) {
                // @ts-ignore
                await tx.teamMember.update({
                    where: { id: member.id },
                    data: {
                        name: member.name,
                        contact: member.contact,
                        occupation: member.occupation,
                        address: member.address,
                    }
                });
            }

            // 3. Identify members to create
            const membersToCreate = members ? members.filter((m: any) => !m.id || !currentMemberIds.includes(m.id)) : [];
            if (membersToCreate.length > 0) {
                // @ts-ignore
                await tx.teamMember.createMany({
                    data: membersToCreate.map((member: any) => ({
                        teamId,
                        name: member.name,
                        contact: member.contact,
                        occupation: member.occupation,
                        address: member.address,
                    }))
                });
            }
        });

        await logActivity(workspaceId, projectId || null, "UPDATED_TEAM", `Team "${name}" updated`);

        revalidatePath(`/${workspaceId}/team`);
        return { success: "Team updated successfully" };
    } catch (error) {
        console.error(error);
        return { error: "Failed to update team" };
    }
};

export const deleteTeam = async (workspaceId: string, teamId: string) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    const { isAllowed } = await checkPermissions(user.id, workspaceId, [...PERMISSIONS.TEAMS.DELETE]);
    if (!isAllowed) return { error: "Permission denied" };

    try {
        const team = await prisma.team.delete({
            where: { id: teamId, workspaceId },
            include: { projects: true }
        });

        // Log activity for each project the team was part of
        if (team.projects && team.projects.length > 0) {
            for (const project of team.projects) {
                await logActivity(workspaceId, project.id, "DELETED_TEAM", `Team "${team.name}" deleted`);
            }
        } else {
            await logActivity(workspaceId, null, "DELETED_TEAM", `Team "${team.name}" deleted`);
        }


        revalidatePath(`/${workspaceId}/team`);
        return { success: "Team deleted successfully" };
    } catch (error) {
        console.error(error);
        return { error: "Failed to delete team" };
    }
};

export const getTeams = async (workspaceId: string) => {
    try {
        const teams = await prisma.team.findMany({
            where: { workspaceId },
            include: {
                members: true,
                projects: true,
                expenses: true,
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        // Calculate metrics
        const teamsWithMetrics = teams.map((team: any) => {
            const totalProjects = team.projects?.length || 0;

            const totalPaid = team.expenses
                .filter((ex: any) => ex.status === "PAID")
                .reduce((acc: number, ex: any) => acc + Number(ex.amount), 0);

            const amountPending = team.expenses
                .filter((ex: any) => ex.status === "PENDING")
                .reduce((acc: number, ex: any) => acc + Number(ex.amount), 0);

            return {
                ...team,
                metrics: {
                    totalProjects,
                    totalPaid,
                    amountPending
                }
            };
        });

        return serializeDecimal(teamsWithMetrics);
    } catch (error) {
        console.error(error);
        return [];
    }
};

