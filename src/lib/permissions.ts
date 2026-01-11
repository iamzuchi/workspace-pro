import { Role } from "@prisma/client";
import prisma from "@/lib/db";

export const checkPermissions = async (
    userId: string,
    workspaceId: string,
    allowedRoles: Role[]
) => {
    const member = await prisma.workspaceMember.findUnique({
        where: {
            workspaceId_userId: {
                workspaceId,
                userId
            }
        }
    });

    if (!member) return { isAllowed: false, role: null };

    const isAllowed = allowedRoles.includes(member.role);

    return {
        isAllowed,
        role: member.role,
        member
    };
};

export const PERMISSIONS = {
    PROJECTS: {
        CREATE: [Role.ADMIN, Role.PROJECT_MANAGER],
        UPDATE: [Role.ADMIN, Role.PROJECT_MANAGER],
        DELETE: [Role.ADMIN],
    },
    INVENTORY: {
        CREATE: [Role.ADMIN, Role.PROJECT_MANAGER],
        UPDATE: [Role.ADMIN, Role.PROJECT_MANAGER],
        DELETE: [Role.ADMIN],
        ALLOCATE: [Role.ADMIN, Role.PROJECT_MANAGER],
    },
    INVOICES: {
        CREATE: [Role.ADMIN, Role.ACCOUNTANT, Role.PROJECT_MANAGER],
        UPDATE: [Role.ADMIN, Role.ACCOUNTANT, Role.PROJECT_MANAGER],
        DELETE: [Role.ADMIN],
        SEND: [Role.ADMIN, Role.ACCOUNTANT],
    },
    WORKSPACE: {
        UPDATE: [Role.ADMIN],
        DELETE: [Role.ADMIN],
        MANAGE_MEMBERS: [Role.ADMIN],
    }
} as const;
