import * as z from "zod";

export const WorkSiteSchema = z.object({
    name: z.string().min(1, "Name is required"),
});
