import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(request: NextRequest) {
    try {
        const { searchParams } = new URL(request.url);
        let orgId = searchParams.get('orgId');

        if (!orgId || orgId === 'your-org-id' || orgId === 'default') {
            const firstOrg = await db.organization.findFirst();
            if (!firstOrg) {
                return NextResponse.json({ error: 'No organization found' }, { status: 404 });
            }
            orgId = firstOrg.id;
        }

        const products = await db.product.findMany({
            where: { organizationId: orgId },
            take: 100,
            orderBy: { name: 'asc' }
        });

        const response = NextResponse.json(products);
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'GET, OPTIONS');
        response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
        return response;
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

export async function OPTIONS() {
    return new NextResponse(null, {
        status: 204,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
