const prisma = require('../src/lib/db').default;
const { Prisma } = require('@prisma/client');
(async () => {
    try {
        // Create a workspace
        const workspace = await prisma.workspace.create({
            data: {
                name: 'Test Workspace',
                slug: 'test-workspace-' + Date.now(),
                ownerId: 'test-user-id',
            },
        });
        // Create a project with initial budget
        const project = await prisma.project.create({
            data: {
                workspaceId: workspace.id,
                name: 'Test Project',
                status: 'PENDING',
                budget: new Prisma.Decimal('1000'),
            },
        });
        console.log('Created project with budget:', project.budget.toString());
        // Update budget using the same logic as updateProject action
        const updated = await prisma.project.update({
            where: { id: project.id, workspaceId: workspace.id },
            data: { budget: new Prisma.Decimal('2000') },
        });
        console.log('Updated budget to:', updated.budget.toString());
    } catch (e) {
        console.error('Error during test:', e);
    } finally {
        await prisma.$disconnect();
    }
})();
