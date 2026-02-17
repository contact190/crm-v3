/**
 * API Route: /api/sync/pull
 * Pull changes from server to local IndexedDB
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

        const { lastSync } = await request.json();
        const lastSyncDate = new Date(lastSync);
        const organizationId = session.user.organizationId;

        // Helper to map entities with _localId
        const mapEntities = (entities: any[]) => entities.map(e => ({ _localId: e.id, ...e }));

        // Fetch products updated since last sync
        const products = await db.product.findMany({
            where: {
                organizationId,
                updatedAt: { gte: lastSyncDate }
            },
            select: {
                id: true,
                barcode: true,
                sku: true,
                name: true,
                price: true,
                lastCost: true,
                stock: true,
                minStock: true,
                category: true,
                unit: true,
                organizationId: true,
                updatedAt: true
            }
        });

        // Fetch clients
        const clients = await db.client.findMany({
            where: {
                organizationId,
                updatedAt: { gte: lastSyncDate }
            },
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                address: true,
                nif: true,
                nis: true,
                rc: true,
                totalDebt: true,
                organizationId: true,
                updatedAt: true
            }
        });

        // Fetch warehouses
        const warehouses = await db.warehouse.findMany({
            where: {
                organizationId
            },
            select: {
                id: true,
                name: true,
                address: true,
                organizationId: true
            }
        });

        // Fetch categories
        const categories = await db.category.findMany({
            where: {
                organizationId
            },
            select: {
                id: true,
                name: true,
                organizationId: true
            }
        });

        // Fetch suppliers
        const suppliers = await db.supplier.findMany({
            where: {
                organizationId,
                updatedAt: { gte: lastSyncDate }
            },
            select: {
                id: true,
                name: true,
                contactName: true,
                phone: true,
                email: true,
                address: true,
                totalDebt: true,
                organizationId: true,
                updatedAt: true
            }
        });

        // Fetch accounts
        const accounts = await db.account.findMany({
            where: {
                organizationId,
                updatedAt: { gte: lastSyncDate }
            },
            select: {
                id: true,
                name: true,
                type: true,
                balance: true,
                isDefault: true,
                organizationId: true,
                updatedAt: true
            }
        });

        // Fetch employees
        const employees = await db.employee.findMany({
            where: {
                organizationId,
                updatedAt: { gte: lastSyncDate }
            },
            select: {
                id: true,
                name: true,
                phone: true,
                email: true,
                role: true,
                contractType: true,
                isActive: true,
                baseSalary: true,
                commissionPct: true,
                monthlyGoal: true,
                userId: true,
                organizationId: true,
                updatedAt: true
            }
        });

        // Fetch roles
        const roles = await db.role.findMany({
            where: {
                organizationId,
                updatedAt: { gte: lastSyncDate }
            },
            select: {
                id: true,
                name: true,
                description: true,
                organizationId: true,
                updatedAt: true,
                permissions: {
                    select: {
                        permissionId: true
                    }
                }
            }
        });

        // Fetch all permissions (system-wide, not org-specific)
        const permissions = await db.permission.findMany({
            select: {
                id: true,
                slug: true,
                description: true
            }
        });

        // Fetch users (for offline login)
        const users = await db.user.findMany({
            where: {
                organizationId
            },
            select: {
                id: true,
                username: true,
                email: true,
                name: true,
                password: true, // Hashed
                pinCode: true,
                roleId: true,
                organizationId: true
            }
        });

        // Fetch transactions
        const transactions = await db.transaction.findMany({
            where: {
                organizationId,
                updatedAt: { gte: lastSyncDate }
            },
            select: {
                id: true,
                totalAmount: true,
                paidAmount: true,
                paymentMode: true,
                type: true,
                items: true,
                clientId: true,
                warehouseId: true,
                accountId: true,
                organizationId: true,
                createdAt: true,
                updatedAt: true
            }
        });

        // Fetch stock movements
        const movements = await db.stockMovement.findMany({
            where: {
                product: { organizationId },
                updatedAt: { gte: lastSyncDate }
            },
            select: {
                id: true,
                productId: true,
                warehouseId: true,
                type: true,
                quantity: true,
                reason: true,
                product: { select: { organizationId: true } },
                createdAt: true,
                updatedAt: true
            }
        });

        // Fetch expenses
        const expenses = await db.expense.findMany({
            where: {
                organizationId,
                updatedAt: { gte: lastSyncDate }
            },
            select: {
                id: true,
                amount: true,
                label: true,
                category: true,
                organizationId: true,
                createdAt: true,
                updatedAt: true
            }
        });

        // Fetch attendances
        const attendances = await db.attendance.findMany({
            where: {
                organizationId,
                updatedAt: { gte: lastSyncDate }
            },
            select: {
                id: true,
                employeeId: true,
                date: true,
                status: true,
                clockIn: true,
                clockOut: true,
                organizationId: true,
                updatedAt: true
            }
        });

        // Fetch salary advances
        const salaryAdvances = await db.salaryAdvance.findMany({
            where: {
                organizationId,
                updatedAt: { gte: lastSyncDate }
            },
            select: {
                id: true,
                employeeId: true,
                amount: true,
                status: true,
                requestDate: true,
                organizationId: true,
                updatedAt: true
            }
        });

        // Fetch payrolls
        const payrolls = await db.payroll.findMany({
            where: {
                organizationId,
                updatedAt: { gte: lastSyncDate }
            },
            select: {
                id: true,
                employeeId: true,
                month: true,
                baseSalary: true,
                netPayable: true,
                status: true,
                organizationId: true,
                updatedAt: true
            }
        });

        console.log(`📥 Pull completed: ${products.length} products, ${transactions.length} transactions, ${movements.length} movements`);

        return NextResponse.json({
            products: mapEntities(products),
            clients: mapEntities(clients),
            warehouses: mapEntities(warehouses),
            categories: mapEntities(categories),
            suppliers: mapEntities(suppliers),
            accounts: mapEntities(accounts),
            employees: mapEntities(employees),
            roles: roles.map(r => ({
                _localId: r.id,
                ...r,
                permissions: r.permissions.map(p => p.permissionId)
            })),
            permissions: mapEntities(permissions),
            users: mapEntities(users),
            transactions: mapEntities(transactions.map(t => ({ ...t, items: JSON.parse(t.items as string || '[]') }))),
            movements: mapEntities(movements.map(m => ({ ...m, organizationId: (m as any).product.organizationId, product: undefined }))),
            expenses: mapEntities(expenses.map(e => ({ ...e, date: e.createdAt }))),
            attendances: mapEntities(attendances),
            salaryAdvances: mapEntities(salaryAdvances),
            payrolls: mapEntities(payrolls),
            timestamp: new Date().toISOString()
        });

    } catch (error: any) {
        console.error('❌ Sync pull error:', error);
        return NextResponse.json(
            { error: 'Sync failed', details: error.message },
            { status: 500 }
        );
    }
}
