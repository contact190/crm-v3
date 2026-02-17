import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        let orgId = searchParams.get('orgId');

        // If no orgId is provided, fallback to the first organization found
        if (!orgId || orgId === 'your-org-id' || orgId === 'default') {
            const firstOrg = await db.organization.findFirst();
            if (!firstOrg) {
                return NextResponse.json({ error: 'No organization found' }, { status: 404 });
            }
            orgId = firstOrg.id;
        }

        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

        // Fetch stats
        const [revenue, expenses, debt, transactions] = await Promise.all([
            // Total Revenue (Sales)
            db.transaction.aggregate({
                where: { organizationId: orgId, type: 'SALE' },
                _sum: { totalAmount: true }
            }),
            // Total Expenses
            db.expense.aggregate({
                where: { organizationId: orgId },
                _sum: { amount: true }
            }),
            // Total Client Debt
            db.client.aggregate({
                where: { organizationId: orgId },
                _sum: { totalDebt: true }
            }),
            // Recent Transactions
            db.transaction.findMany({
                where: { organizationId: orgId },
                orderBy: { createdAt: 'desc' },
                take: 10,
                select: {
                    id: true,
                    type: true,
                    totalAmount: true,
                    createdAt: true
                }
            })
        ]);

        const response = NextResponse.json({
            totalRevenue: revenue._sum.totalAmount || 0,
            totalExpenses: expenses._sum.amount || 0,
            totalProfit: (revenue._sum.totalAmount || 0) - (expenses._sum.amount || 0),
            totalClientDebt: debt._sum.totalDebt || 0,
            recentTransactions: transactions.map((t: any) => ({
                ...t,
                total: t.totalAmount // Map for mobile app compatibility
            })),
            orgId
        });

        // Add CORS headers
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type');

        return response;

    } catch (error: any) {
        console.error('Mobile Stats API Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
