const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
(async () => {
    try {
        const result = await prisma.project.update({
            where: { id: 'nonexistent-id', workspaceId: 'nonexistent-ws' },
            data: { budget: new Prisma.Decimal('1000') }
        });
        console.log('Update succeeded:', result);
    } catch (e) {
        console.error('Error during update:', e.message);
    } finally {
        await prisma.$disconnect();
    }
})();
