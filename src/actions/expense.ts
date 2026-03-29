"use server";

import * as z from "zod";
import prisma from "@/lib/db";
import { CreateExpenseSchema } from "@/schemas/expense";
import { currentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { checkPermissions, PERMISSIONS } from "@/lib/permissions";
import { Role, ExpenseStatus } from "@prisma/client";

export const createExpense = async (workspaceId: string, values: z.infer<typeof CreateExpenseSchema>) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    const validatedFields = CreateExpenseSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Invalid fields" };

    const { title, category, amount, date, receiptUrl, projectId, teamId, teamMemberId, status } = validatedFields.data;

    try {
        const expense = await prisma.expense.create({
            data: {
                workspaceId,
                title,
                category,
                amount,
                date,
                receiptUrl,
                projectId,
                teamId,
                teamMemberId,
                status: status as ExpenseStatus,
            }
        });

        revalidatePath(`/${workspaceId}/finance`);
        if (projectId) revalidatePath(`/${workspaceId}/projects/${projectId}`);
        if (teamId) revalidatePath(`/${workspaceId}/team`);
        
        return { success: "Expense created", expense };
    } catch (error) {
        console.error(error);
        return { error: "Failed to create expense" };
    }
};

export const updateExpense = async (workspaceId: string, expenseId: string, values: z.infer<typeof CreateExpenseSchema>) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    // Role check
    const member = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: user.id } }
    });

    if (member?.role !== Role.ADMIN && member?.role !== Role.ACCOUNTANT) {
        return { error: "Only admins and accountants can edit expenses" };
    }

    const validatedFields = CreateExpenseSchema.safeParse(values);
    if (!validatedFields.success) return { error: "Invalid fields" };

    const { title, category, amount, date, receiptUrl, projectId, teamId, teamMemberId, status } = validatedFields.data;

    try {
        const expense = await prisma.expense.update({
            where: { id: expenseId, workspaceId },
            data: {
                title,
                category,
                amount,
                date,
                receiptUrl,
                projectId,
                teamId,
                teamMemberId,
                status: status as ExpenseStatus,
            }
        });

        revalidatePath(`/${workspaceId}/finance`);
        if (projectId) revalidatePath(`/${workspaceId}/projects/${projectId}`);
        if (teamId) revalidatePath(`/${workspaceId}/team`);
        
        return { success: "Expense updated", expense };
    } catch (error) {
        console.error(error);
        return { error: "Failed to update expense" };
    }
}

export const deleteExpense = async (workspaceId: string, expenseId: string) => {
    const user = await currentUser();
    if (!user?.id) return { error: "Unauthorized" };

    // Role check
    const member = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: user.id } }
    });

    if (member?.role !== Role.ADMIN && member?.role !== Role.ACCOUNTANT) {
        return { error: "Only admins and accountants can delete expenses" };
    }

    try {
        const expense = await prisma.expense.delete({
            where: { id: expenseId, workspaceId }
        });

        revalidatePath(`/${workspaceId}/finance`);
        if ((expense as any).projectId) revalidatePath(`/${workspaceId}/projects/${(expense as any).projectId}`);
        if ((expense as any).teamId) revalidatePath(`/${workspaceId}/team`);

        return { success: "Expense deleted" };
    } catch (error) {
        console.error(error);
        return { error: "Failed to delete expense" };
    }
};
