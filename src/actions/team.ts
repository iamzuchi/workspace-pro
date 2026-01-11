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

    const { isAllowed } = await checkPermissions(user.id, workspaceId, [...PERMISSIONS.WORKSPACE.UPDATE]); // Assuming workspace admin/manager can create teams
    if (!isAllowed) return { error: "Permission denied" };

    const validatedFields = CreateTeamSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Invalid fields" };

    const { name, description, projectId, members } = validatedFields.data;

    try {
        // @ts-ignore
        const team = await prisma.team.create({
            data: {
                workspaceId,
                projectId,
                name,
                description,
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

    const { isAllowed } = await checkPermissions(user.id, workspaceId, [...PERMISSIONS.WORKSPACE.UPDATE]);
    if (!isAllowed) return { error: "Permission denied" };

    const validatedFields = CreateTeamSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Invalid fields" };

    const { name, description, projectId, members } = validatedFields.data;

    try {
        await prisma.$transaction(async (tx) => {
            // @ts-ignore
            await tx.team.update({
                where: { id: teamId, workspaceId },
                data: {
                    name,
                    description,
                    projectId,
                }
            });

            // For simplicity, we replace all members. 
            // In a more complex app, we'd diff them.
            // @ts-ignore
            await tx.teamMember.deleteMany({
                where: { teamId }
            });

            if (members && members.length > 0) {
                // @ts-ignore
                await tx.teamMember.createMany({
                    data: members.map(member => ({
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

    const { isAllowed } = await checkPermissions(user.id, workspaceId, [...PERMISSIONS.WORKSPACE.UPDATE]);
    if (!isAllowed) return { error: "Permission denied" };

    try {
        // @ts-ignore
        const team = await prisma.team.delete({
            where: { id: teamId, workspaceId }
        });

        await logActivity(workspaceId, team.projectId || null, "DELETED_TEAM", `Team "${team.name}" deleted`);


        revalidatePath(`/${workspaceId}/team`);
        return { success: "Team deleted successfully" };
    } catch (error) {
        console.error(error);
        return { error: "Failed to delete team" };
    }
};

export const getTeams = async (workspaceId: string) => {
    try {
        // @ts-ignore
        const teams = await prisma.team.findMany({

            where: { workspaceId },
            include: {
                members: true,
                project: true,
                invoices: {
                    include: {
                        payments: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        // Calculate metrics
        const teamsWithMetrics = teams.map((team: any) => {
            const totalProjects = team.projectId ? 1 : 0;

            const totalPaid = team.invoices.reduce((acc: number, inv: any) => {
                const paid = inv.payments.reduce((pAcc: number, p: any) => pAcc + Number(p.amount), 0);
                return acc + paid;
            }, 0);

            const totalAmount = team.invoices.reduce((acc: number, inv: any) => acc + Number(inv.totalAmount), 0);
            const amountPending = totalAmount - totalPaid;

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

