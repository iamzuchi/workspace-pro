"use server";
import * as z from "zod";
import prisma from "@/lib/db";
import { CreateWorkspaceSchema } from "@/schemas/workspace";
import { currentUser } from "@/lib/auth";

export const createWorkspace = async (values: z.infer<typeof CreateWorkspaceSchema>) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    const validatedFields = CreateWorkspaceSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Invalid fields" };

    const { name } = validatedFields.data;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + "-" + Math.random().toString(36).substr(2, 5);

    try {
        const workspace = await prisma.workspace.create({
            data: {
                name,
                slug,
                ownerId: user.id,
                members: {
                    create: {
                        userId: user.id,
                        role: "ADMIN"
                    }
                }
            }
        });

        // Revalidate to ensure the new workspace appears in the sidebar/switcher immediately
        // We revalidate the root path and the dashboard path
        // revalidatePath("/"); 
        // Note: In some Next.js setups, revalidating layout data can be tricky. 
        // Since we are redirecting to a new path, that path will fetch fresh data.
        // But revalidating "/" helps if the user navigates back.

        return { success: "Workspace created", workspaceId: workspace.id };
    } catch {
        return { error: "Failed to create workspace" };
    }
}
