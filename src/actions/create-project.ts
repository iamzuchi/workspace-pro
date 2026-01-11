"use server";
import * as z from "zod";
import prisma from "@/lib/db";
import { CreateProjectSchema } from "@/schemas/project";
import { currentUser } from "@/lib/auth";
import { checkPermissions, PERMISSIONS } from "@/lib/permissions";
import { logActivity } from "./activities";
import { revalidatePath } from "next/cache";

export const createProject = async (
    workspaceId: string,
    values: z.infer<typeof CreateProjectSchema>
) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    const { isAllowed } = await checkPermissions(user.id, workspaceId, [...PERMISSIONS.PROJECTS.CREATE]);
    if (!isAllowed) return { error: "Permission denied" };

    const validatedFields = CreateProjectSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Invalid fields" };

    const { name, description, startDate, endDate } = validatedFields.data;

    try {
        const project = await prisma.project.create({
            data: {
                name,
                description,
                startDate,
                endDate,
                workspaceId
            }
        });

        await logActivity(workspaceId, project.id, "CREATED_PROJECT", `Project "${name}" created`);

        revalidatePath(`/${workspaceId}/projects`);
        return { success: "Project created", projectId: project.id };
    } catch {
        return { error: "Failed to create project" };
    }
}
