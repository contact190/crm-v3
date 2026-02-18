import { db } from "@/lib/db";

export async function cleanupDuplicateAccounts(orgId: string) {
    try {
        const accounts = await db.account.findMany({
            where: {
                organizationId: orgId,
                name: "Caisse Boutique"
            },
            orderBy: { createdAt: 'asc' }
        });

        if (accounts.length <= 1) return { success: true, message: "No duplicates found." };

        const hostAccount = accounts[0];
        const duplicates = accounts.slice(1);

        console.log(`Merging ${duplicates.length} duplicate accounts into ${hostAccount.id}`);

        for (const duplicate of duplicates) {
            // Update Transactions
            await db.transaction.updateMany({
                where: { accountId: duplicate.id },
                data: { accountId: hostAccount.id }
            });

            // Update Expenses
            await db.expense.updateMany({
                where: { accountId: duplicate.id },
                data: { accountId: hostAccount.id }
            });

            // Update AccountFlows
            await db.accountFlow.updateMany({
                where: { accountId: duplicate.id },
                data: { accountId: hostAccount.id }
            });

            // Transfer Balance
            await db.account.update({
                where: { id: hostAccount.id },
                data: { balance: { increment: duplicate.balance } }
            });

            // Delete Duplicate
            await db.account.delete({
                where: { id: duplicate.id }
            });
        }

        return { success: true, message: `Successfully merged ${duplicates.length} accounts.` };
    } catch (error: any) {
        console.error("Cleanup failed:", error);
        return { success: false, error: error.message };
    }
}
