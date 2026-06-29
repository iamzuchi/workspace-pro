const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const { PrismaPg } = require('@prisma/adapter-pg');
const { Pool } = require('pg');

// Manually parse .env file to get DATABASE_URL
let databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
    try {
        const envPath = path.join(__dirname, '../.env');
        if (fs.existsSync(envPath)) {
            const envContent = fs.readFileSync(envPath, 'utf8');
            const match = envContent.match(/DATABASE_URL=["']?([^"'\r\n]+)["']?/);
            if (match) {
                databaseUrl = match[1];
            }
        }
    } catch (e) {
        console.error("Failed to read .env file", e);
    }
}

if (!databaseUrl) {
    console.error("DATABASE_URL is not set in environment or .env file!");
    process.exit(1);
}

const pool = new Pool({ connectionString: databaseUrl });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

(async () => {
    try {
        console.log("Starting backfill of workspaceId for existing Activities...");
        
        const activities = await prisma.activity.findMany({
            include: {
                project: true,
                invoice: true
            }
        });
        
        console.log(`Found ${activities.length} total activities.`);
        let updatedCount = 0;
        
        for (const activity of activities) {
            let targetWorkspaceId = activity.workspaceId;
            
            if (!targetWorkspaceId) {
                if (activity.project) {
                    targetWorkspaceId = activity.project.workspaceId;
                } else if (activity.invoice) {
                    targetWorkspaceId = activity.invoice.workspaceId;
                }
            }
            
            if (targetWorkspaceId && targetWorkspaceId !== activity.workspaceId) {
                await prisma.activity.update({
                    where: { id: activity.id },
                    data: { workspaceId: targetWorkspaceId }
                });
                updatedCount++;
            }
        }
        
        console.log(`Successfully backfilled workspaceId for ${updatedCount} activities.`);
    } catch (e) {
        console.error("Backfill failed:", e);
    } finally {
        await prisma.$disconnect();
        await pool.end();
    }
})();
