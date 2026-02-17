import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json();

        // Ensure organizationId is set
        if (!data.organizationId || data.organizationId === 'default') {
            const firstOrg = await db.organization.findFirst();
            if (firstOrg) {
                data.organizationId = firstOrg.id;
            }
        }

        const totalAmount = data.totalAmount || data.total || 0;
        const paidAmount = data.paidAmount !== undefined ? data.paidAmount : totalAmount;

        const transaction = await db.transaction.create({
            data: {
                organizationId: data.organizationId,
                type: data.type || 'SALE',
                totalAmount: totalAmount,
                paidAmount: paidAmount,
                paymentMode: data.paymentMode || data.paymentMethod || 'CASH',
                items: JSON.stringify(data.items.map((item: any) => ({
                    productId: item.productId,
                    quantity: item.quantity,
                    price: item.price
                })))
            }
        });

        // Update product stock
        for (const item of data.items) {
            await db.product.update({
                where: { id: item.productId },
                data: {
                    stock: {
                        decrement: item.quantity
                    }
                }
            });
        }

        const response = NextResponse.json(transaction);
        response.headers.set('Access-Control-Allow-Origin', '*');
        response.headers.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
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
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
