/**
 * API Route: /api/sync/push
 * Push local changes from IndexedDB to server
 */

import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

export async function POST(request: NextRequest) {
    try {
        const session = await getSession();

        if (!session?.user?.organizationId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { changes } = await request.json();
        const organizationId = session.user.organizationId;

        let synced = 0;
        const errors: Array<{ table: string; action: string; error: string }> = [];

        // Helper to safely process entity
        const processEntity = async (table: string, items: any[], processor: (item: any) => Promise<void>) => {
            if (!items || items.length === 0) return;

            for (const item of items) {
                try {
                    await processor(item);
                    synced++;
                } catch (error: any) {
                    console.error(`Error syncing ${table}:`, error);
                    errors.push({ table, action: item.action, error: error.message });
                }
            }
        };

        // Process products
        await processEntity('products', changes.products, async (item) => {
            if (item.action === 'create') {
                await db.product.create({
                    data: { ...item.data, organizationId }
                });
            } else if (item.action === 'update') {
                await db.product.update({
                    where: { id: item.localId },
                    data: item.data
                });
            } else if (item.action === 'delete') {
                await db.product.delete({ where: { id: item.localId } });
            }
        });

        // Process clients
        await processEntity('clients', changes.clients, async (item) => {
            if (item.action === 'create') {
                await db.client.create({
                    data: { ...item.data, organizationId }
                });
            } else if (item.action === 'update') {
                await db.client.update({
                    where: { id: item.localId },
                    data: item.data
                });
            } else if (item.action === 'delete') {
                await db.client.delete({ where: { id: item.localId } });
            }
        });

        // Process warehouses
        await processEntity('warehouses', changes.warehouses, async (item) => {
            if (item.action === 'create') {
                await db.warehouse.create({
                    data: { ...item.data, organizationId }
                });
            } else if (item.action === 'update') {
                await db.warehouse.update({
                    where: { id: item.localId },
                    data: item.data
                });
            }
        });

        // Process categories
        await processEntity('categories', changes.categories, async (item) => {
            if (item.action === 'create') {
                await db.category.create({
                    data: { ...item.data, organizationId }
                });
            } else if (item.action === 'update') {
                await db.category.update({
                    where: { id: item.localId },
                    data: item.data
                });
            }
        });

        // Process suppliers
        await processEntity('suppliers', changes.suppliers, async (item) => {
            if (item.action === 'create') {
                await db.supplier.create({
                    data: { ...item.data, organizationId }
                });
            } else if (item.action === 'update') {
                await db.supplier.update({
                    where: { id: item.localId },
                    data: item.data
                });
            } else if (item.action === 'delete') {
                await db.supplier.delete({ where: { id: item.localId } });
            }
        });

        // Process transactions
        await processEntity('transactions', changes.transactions, async (item) => {
            if (item.action === 'create') {
                await db.transaction.create({
                    data: {
                        type: item.data.type || 'SALE',
                        totalAmount: Number(item.data.total),
                        paidAmount: Number(item.data.paidAmount || 0),
                        paymentMode: item.data.paymentMethod || 'CASH',
                        items: JSON.stringify(item.data.items || []),
                        organizationId,
                        clientId: item.data.clientId,
                        warehouseId: item.data.warehouseId,
                        accountId: item.data.accountId
                    }
                });
            }
        });

        // Process accounts
        await processEntity('accounts', changes.accounts, async (item) => {
            if (item.action === 'create') {
                await db.account.create({
                    data: { ...item.data, organizationId }
                });
            } else if (item.action === 'update') {
                await db.account.update({
                    where: { id: item.localId },
                    data: item.data
                });
            }
        });

        // Process expenses
        await processEntity('expenses', changes.expenses, async (item) => {
            if (item.action === 'create') {
                await db.expense.create({
                    data: {
                        label: item.data.label || item.data.description,
                        amount: Number(item.data.amount),
                        category: item.data.category || 'OPERATIONAL',
                        organizationId,
                        accountId: item.data.accountId
                    }
                });
            } else if (item.action === 'update') {
                await db.expense.update({
                    where: { id: item.localId },
                    data: {
                        label: item.data.label,
                        amount: item.data.amount ? Number(item.data.amount) : undefined,
                        category: item.data.category
                    }
                });
            }
        });

        // Process movements (stock adjustments)
        await processEntity('movements', changes.movements, async (item) => {
            if (item.action === 'create') {
                await db.stockMovement.create({
                    data: {
                        productId: item.data.productId,
                        warehouseId: item.data.warehouseId,
                        type: item.data.type,
                        quantity: Number(item.data.quantity),
                        reason: item.data.reason
                    }
                });
            }
        });

        // Process employees
        await processEntity('employees', changes.employees, async (item) => {
            if (item.action === 'create') {
                await db.employee.create({
                    data: { ...item.data, organizationId }
                });
            } else if (item.action === 'update') {
                await db.employee.update({
                    where: { id: item.localId },
                    data: item.data
                });
            } else if (item.action === 'delete') {
                await db.employee.delete({ where: { id: item.localId } });
            }
        });

        // Process attendances
        await processEntity('attendances', changes.attendances, async (item) => {
            if (item.action === 'create') {
                await db.attendance.create({
                    data: { ...item.data, organizationId }
                });
            } else if (item.action === 'update') {
                await db.attendance.update({
                    where: { id: item.localId },
                    data: item.data
                });
            }
        });

        // Process salary advances
        await processEntity('salaryAdvances', changes.salaryAdvances, async (item) => {
            if (item.action === 'create') {
                await db.salaryAdvance.create({
                    data: { ...item.data, organizationId }
                });
            }
        });

        // Process payrolls
        await processEntity('payrolls', changes.payrolls, async (item) => {
            if (item.action === 'create') {
                await db.payroll.create({
                    data: { ...item.data, organizationId }
                });
            }
        });

        // Process roles
        await processEntity('roles', changes.roles, async (item) => {
            if (item.action === 'create') {
                await db.role.create({
                    data: { ...item.data, organizationId }
                });
            } else if (item.action === 'update') {
                await db.role.update({
                    where: { id: item.localId },
                    data: item.data
                });
            } else if (item.action === 'delete') {
                await db.role.delete({ where: { id: item.localId } });
            }
        });

        // Process permission assignments
        await processEntity('permissions', changes.permissions, async (item) => {
            if (item.action === 'assign') {
                // Clear existing permissions for this role
                await db.rolePermission.deleteMany({
                    where: { roleId: item.data.roleId }
                });
                // Assign new permissions
                if (item.data.permissionIds && item.data.permissionIds.length > 0) {
                    await db.rolePermission.createMany({
                        data: item.data.permissionIds.map((permId: string) => ({
                            roleId: item.data.roleId,
                            permissionId: permId
                        }))
                    });
                }
            }
        });

        console.log(`✅ Sync push completed: ${synced} items synced, ${errors.length} errors`);

        return NextResponse.json({
            success: true,
            synced,
            errors: errors.length > 0 ? errors : undefined,
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('❌ Sync push error:', error);
        return NextResponse.json(
            { error: 'Sync failed', details: error.message },
            { status: 500 }
        );
    }
}
