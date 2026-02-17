import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(request: NextRequest) {
    try {
        const data = await request.json(); // { productId, quantity, type, reason }
        const { productId, quantity, type } = data;

        const product = await db.product.findUnique({
            where: { id: productId }
        });

        if (!product) {
            return NextResponse.json({ error: 'Product not found' }, { status: 404 });
        }

        let newStock = product.stock;
        if (type === 'SET') {
            newStock = quantity;
        } else if (type === 'ADD') {
            newStock += quantity;
        } else if (type === 'SUB') {
            newStock -= quantity;
        }

        // Find the first warehouse for this organization
        const warehouse = await db.warehouse.findFirst({
            where: { organizationId: product.organizationId }
        });

        if (!warehouse) {
            return NextResponse.json({ error: 'No warehouse found for this organization' }, { status: 404 });
        }

        const updatedProduct = await db.product.update({
            where: { id: productId },
            data: { stock: newStock }
        });

        // Log stock movement
        await db.stockMovement.create({
            data: {
                productId,
                warehouseId: warehouse.id,
                quantity: type === 'SET' ? (quantity - product.stock) : (type === 'SUB' ? -Math.abs(quantity) : quantity),
                type: type === 'SET' ? 'ADJUST' : (type === 'ADD' ? 'IN' : 'OUT'),
                reason: data.reason || 'Mobile Adjustment'
            }
        });

        const response = NextResponse.json(updatedProduct);
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
