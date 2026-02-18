const { PrismaClient } = require('./src/generated/client');

async function checkAllUniqueConstraints() {
    const prisma = new PrismaClient();
    try {
        console.log("Checking for duplicate Accounts...");
        const accounts = await prisma.account.findMany();
        const accountGroups = {};
        accounts.forEach(a => {
            const key = `${a.name.trim().toLowerCase()}||${a.organizationId}`;
            if (!accountGroups[key]) accountGroups[key] = [];
            accountGroups[key].push(a.id);
        });
        Object.entries(accountGroups).forEach(([key, ids]) => {
            if (ids.length > 1) console.log(`Duplicate Account: ${key} -> IDS: ${ids.join(', ')}`);
        });

        console.log("Checking for duplicate Roles...");
        const roles = await prisma.role.findMany();
        const roleGroups = {};
        roles.forEach(r => {
            const key = `${r.name.trim().toLowerCase()}||${r.organizationId}`;
            if (!roleGroups[key]) roleGroups[key] = [];
            roleGroups[key].push(r.id);
        });
        Object.entries(roleGroups).forEach(([key, ids]) => {
            if (ids.length > 1) console.log(`Duplicate Role: ${key} -> IDS: ${ids.join(', ')}`);
        });

        console.log("Checking for duplicate Users (email)...");
        const users = await prisma.user.findMany();
        const userEmails = {};
        users.forEach(u => {
            const key = u.email.toLowerCase();
            if (!userEmails[key]) userEmails[key] = [];
            userEmails[key].push(u.id);
        });
        Object.entries(userEmails).forEach(([key, ids]) => {
            if (ids.length > 1) console.log(`Duplicate User Email: ${key} -> IDS: ${ids.join(', ')}`);
        });

        console.log("Diagnostic complete.");
    } catch (error) {
        console.error("Diagnostic error:", error);
    } finally {
        await prisma.$disconnect();
    }
}

checkAllUniqueConstraints();
