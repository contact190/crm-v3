import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ barcode: string }> }
) {
    try {
        const { searchParams } = new URL(request.url);
        let orgId = searchParams.get('orgId');
        const { barcode } = await params;

        // If no orgId is provided, fallback to the first organization found
        if (!orgId || orgId === 'your-org-id' || orgId === 'default') {
            const firstOrg = await db.organization.findFirst();
            if (!firstOrg) {
                return NextResponse.json({ error: 'No organization found' }, { status: 404 });
            }
            orgId = firstOrg.id;
        }

        const product = await db.product.findFirst({
            where: {
                organizationId: orgId,
                barcode: barcode
            }
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        const response = NextResponse.json(product);
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
