"use server";

import * as z from "zod";
import prisma from "@/lib/db";
import { Prisma } from "@prisma/client"; // Added import for Decimal handling
import { UpdateProjectSchema } from "@/schemas/project";
import { currentUser } from "@/lib/auth";
import { ProjectStatus } from "@prisma/client";
import { checkPermissions, PERMISSIONS } from "@/lib/permissions";
import { logActivity } from "./activities";
import { revalidatePath } from "next/cache";

export const updateProject = async (
    workspaceId: string,
    projectId: string,
    values: z.infer<typeof UpdateProjectSchema>
) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    const { isAllowed } = await checkPermissions(
        user.id,
        workspaceId,
        [...PERMISSIONS.PROJECTS.UPDATE]
    );
    if (!isAllowed) return { error: "Permission denied" };

    const validatedFields = UpdateProjectSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Invalid fields" };

    const {
        name,
        description,
        status,
        startDate,
        endDate,
        budget,
    } = validatedFields.data;

    try {
        await prisma.project.update({
            where: {
                id: projectId,
                workspaceId,
            },
            data: {
                name,
                description,
                status,
                startDate,
                endDate,
                budget: new Prisma.Decimal(budget),
            },
        });

        return { success: "Project updated" };
    } catch (error) {
        console.error("UpdateProject Error:", error);
        return {
            error: `Failed to update project: ${error instanceof Error ? error.message : String(error)
                }`,
        };
    }
};