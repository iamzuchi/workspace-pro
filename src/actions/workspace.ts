"use server";

import * as z from "zod";
import prisma from "@/lib/db";
import { UpdateWorkspaceSchema } from "@/schemas/workspace";
import { currentUser } from "@/lib/auth";
import { checkPermissions, PERMISSIONS } from "@/lib/permissions";
import { revalidatePath } from "next/cache";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";

export const getWorkspaces = async (userId: string) => {
    try {
        const workspaces = await prisma.workspace.findMany({
            where: {
                members: {
                    some: {
                        userId
                    }
                }
            },
            include: {
                _count: {
                    select: {
                        members: true,
                        projects: true
                    }
                }
            },
            orderBy: {
                updatedAt: "desc"
            }
        });

        return workspaces;
    } catch (error) {
        console.error(error);
        return [];
    }
};

export const updateWorkspace = async (
    workspaceId: string,
    values: z.infer<typeof UpdateWorkspaceSchema>
) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    const { isAllowed } = await checkPermissions(user.id, workspaceId, [...PERMISSIONS.WORKSPACE.UPDATE]);
    if (!isAllowed) return { error: "Permission denied" };

    const validatedFields = UpdateWorkspaceSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Invalid fields" };

    const { name, description, address, currency } = validatedFields.data;

    try {
        await prisma.workspace.update({
            where: { id: workspaceId },
            data: {
                name,
                description,
                address,
                currency,
            }
        });

        revalidatePath(`/${workspaceId}`);
        revalidatePath(`/workspaces`);
        return { success: "Workspace updated successfully" };
    } catch (error) {
        console.error(error);
        return { error: "Failed to update workspace" };
    }
};

export const uploadWorkspaceLogo = async (
    workspaceId: string,
    formData: FormData
) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    const { isAllowed } = await checkPermissions(user.id, workspaceId, [...PERMISSIONS.WORKSPACE.UPDATE]);
    if (!isAllowed) return { error: "Permission denied" };

    try {
        const file = formData.get("logo") as File;
        if (!file) return { error: "No file provided" };

        // Validate file type
        const allowedTypes = ["image/jpeg", "image/png", "image/svg+xml", "image/webp"];
        if (!allowedTypes.includes(file.type)) {
            return { error: "Invalid file type. Only JPG, PNG, SVG, and WebP are allowed" };
        }

        // Validate file size (2MB max)
        const maxSize = 2 * 1024 * 1024; // 2MB
        if (file.size > maxSize) {
            return { error: "File size exceeds 2MB limit" };
        }

        // Create uploads directory if it doesn't exist
        const uploadsDir = join(process.cwd(), "public", "uploads", "workspaces");
        if (!existsSync(uploadsDir)) {
            await mkdir(uploadsDir, { recursive: true });
        }

        // Generate unique filename
        const extension = file.name.split(".").pop();
        const filename = `${workspaceId}-${Date.now()}.${extension}`;
        const filepath = join(uploadsDir, filename);

        // Write file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        await writeFile(filepath, buffer);

        // Update workspace with logo path
        const logoPath = `/uploads/workspaces/${filename}`;
        await prisma.workspace.update({
            where: { id: workspaceId },
            data: { logo: logoPath }
        });

        revalidatePath(`/${workspaceId}`);
        revalidatePath(`/workspaces`);
        return { success: "Logo uploaded successfully", logoPath };
    } catch (error) {
        console.error(error);
        return { error: "Failed to upload logo" };
    }
};

export const getWorkspaceById = async (workspaceId: string) => {
    try {
        const workspace = await prisma.workspace.findUnique({
            where: { id: workspaceId },
            select: {
                id: true,
                name: true,
                description: true,
                logo: true,
                address: true,
                currency: true,
                _count: {
                    select: {
                        members: true,
                        projects: true,
                        invoices: true
                    }
                }
            }
        });

        return workspace;
    } catch (error) {
        console.error(error);
        return null;
    }
};

