"use server";

import prisma from "@/lib/db";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const updateProfile = async (name: string) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    try {
        await prisma.user.update({
            where: { id: user.id },
            data: { name }
        });
        revalidatePath("/profile");
        return { success: "Profile updated" };
    } catch {
        return { error: "Failed to update profile" };
    }
}

export const deleteAccount = async () => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    try {
        await prisma.user.delete({
            where: { id: user.id }
        });
        return { success: "Account deleted" };
    } catch {
        return { error: "Failed to delete account" };
    }
}
