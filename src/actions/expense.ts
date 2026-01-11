"use server";

import * as z from "zod";
import prisma from "@/lib/db";
import { CreateExpenseSchema } from "@/schemas/expense";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export const createExpense = async (workspaceId: string, values: z.infer<typeof CreateExpenseSchema>) => {
    const user = await currentUser();
    if (!user) return { error: "Unauthorized" };

    const validatedFields = CreateExpenseSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Invalid fields" };

    const { title, category, amount, date, receiptUrl } = validatedFields.data;

    try {
        const expense = await prisma.expense.create({
            data: {
                workspaceId,
                title,
                category,
                amount,
                date,
                receiptUrl,
            }
        });

        revalidatePath(`/${workspaceId}/finance`);
        return { success: "Expense created", expense };
    } catch (error) {
        console.error(error);
        return { error: "Failed to create expense" };
    }
};

export const deleteExpense = async (workspaceId: string, expenseId: string) => {
    const user = await currentUser();
    if (!user) return { error: "Unauthorized" };

    try {
        await prisma.expense.delete({
            where: { id: expenseId }
        });

        revalidatePath(`/${workspaceId}/finance`);
        return { success: "Expense deleted" };
    } catch (error) {
        console.error(error);
        return { error: "Failed to delete expense" };
    }
};
