import * as z from "zod";

export const CreateWorkspaceSchema = z.object({
    name: z.string().min(1, {
        message: "Workspace name is required",
    }),
    description: z.string().optional(),
});

export const UpdateWorkspaceSchema = z.object({
    name: z.string().min(1, "Workspace name is required"),
    description: z.string().optional(),
    address: z.string().optional(),
    currency: z.string().default("USD"),
});
