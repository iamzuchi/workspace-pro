import * as z from "zod";

export const TeamMemberSchema = z.object({
    id: z.string().optional(),
    name: z.string().min(1, "Name is required"),
    contact: z.string().optional(),
    occupation: z.string().optional(),
    address: z.string().optional(),
});

export const CreateTeamSchema = z.object({
    name: z.string().min(1, "Team name is required"),
    description: z.string().optional(),
    projectId: z.string().optional().nullable(),
    members: z.array(TeamMemberSchema),
});

