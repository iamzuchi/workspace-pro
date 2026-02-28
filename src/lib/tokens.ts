import { v4 as uuidv4 } from "uuid";
import prisma from "@/lib/db";
import { getPasswordResetTokenByEmail } from "@/data/password-reset-token";

export const generatePasswordResetToken = async (email: string) => {
    const token = uuidv4();
    const expires = new Date(new Date().getTime() + 3600 * 1000); // 1 hour

    const existingToken = await getPasswordResetTokenByEmail(email);

    if (existingToken) {
        await prisma.passwordResetToken.delete({
            where: { id: existingToken.id }
        });
    }

    const passwordResetToken = await prisma.passwordResetToken.create({
        data: {
            email,
            token,
            expires
        }
    });

    return passwordResetToken;
};
