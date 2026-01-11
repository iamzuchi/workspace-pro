import * as z from "zod";
import { ProjectStatus } from "@prisma/client";

export const CreateProjectSchema = z.object({
    name: z.string().min(1, {
        message: "Name is required",
    }),
    description: z.string().optional(),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    budget: z.coerce.number().default(0),
});

export const UpdateProjectSchema = CreateProjectSchema.extend({
    status: z.nativeEnum(ProjectStatus).optional(),
});
