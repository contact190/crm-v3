const { PrismaClient } = require('./src/generated/client');
const prisma = new PrismaClient();

async function findDuplicates() {
    try {
        const accounts = await prisma.account.findMany();
        const seen = new Set();
        const duplicates = [];

        for (const acc of accounts) {
            const key = `${acc.name.trim().toLowerCase()}||${acc.organizationId}`;
            if (seen.has(key)) {
                duplicates.push(acc);
            } else {
                seen.add(key);
            }
        }

        console.log("--- DUPLICATE ACCOUNTS FOUND ---");
        console.log(JSON.stringify(duplicates, null, 2));
        console.log("--------------------------------");

        if (duplicates.length === 0) {
            console.log("No duplicates found by name and organizationId.");
        }

    } catch (error) {
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

findDuplicates();
