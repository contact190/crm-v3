/**
 * Database Wrapper
 * Routes operations to either Prisma (online) or IndexedDB (offline)
 * Maintains backward compatibility with existing code
 */

// import { db } from './db'; // Prisma client - REMOVED for Client Compatibility
import { offlineDB, OfflineProduct, OfflineTransaction } from './offline/db';
import { isOnline } from './offline/connection-monitor';
import { v4 as uuid } from 'uuid';

// ==================== PRODUCTS ====================

// Helper to get organizationId from various data formats
function resolveOrgId(data: any): string {
    const id = data.organizationId || data.orgId || (data.organization?.id);
    if (!id) {
        console.warn("DB-WRAPPER: Could not resolve organizationId from data:", data);
        // Fallback to a global/last-known if needed, but for now we log
    }
    return id;
}

export async function createProduct(data: {

    barcode: string;
    name: string;
    price: number;
    stock: number;
    category?: string;
    organizationId: string;
    cost: number;
    minStock?: number;
    sku?: string;
    image?: string;
    unit?: string;
    categoryId?: string;
    warehouseId?: string;
    location?: { aisle?: string; shelf?: string; bin?: string };
}) {
    if (isOnline()) {
        try {
            const { createProduct: serverCreateProduct } = await import('@/app/actions');
            // Adapt data structure if necessary, or pass mostly as is
            // serverCreateProduct expects flattened format sometimes, let's map it
            return await serverCreateProduct({
                name: data.name,
                barcode: data.barcode,
                price: data.price,
                stock: data.stock,
                cost: data.cost,
                minStock: data.minStock,
                sku: data.sku,
                image: data.image,
                unit: data.unit,
                categoryId: data.categoryId || data.category,
                warehouseId: data.warehouseId,
                location: data.location,
                orgId: resolveOrgId(data)
            });
        } catch (error) {
            console.error("DB-WRAPPER: Failed to load server action, falling back to offline", error);
        }
    }

    // Fallback or explicit offline path
    {
        // Offline: Use IndexedDB
        const localId = uuid();
        const product: OfflineProduct = {
            _localId: localId,
            ...data,
            _syncStatus: 'pending',
            _timestamp: Date.now()
        };

        await offlineDB.products.add(product);

        // Add to sync queue
        await offlineDB.syncQueue.add({
            table: 'products',
            action: 'create',
            localId,
            data,
            _timestamp: Date.now(),
            _retryCount: 0
        });

        console.log("DB-WRAPPER: Product created offline");
        return { success: true, id: localId, ...data };
    }
}

export async function updateProduct(id: string, data: Partial<{
    barcode: string;
    name: string;
    price: number;
    stock: number;
    category?: string;
}>) {
    if (isOnline()) {
        try {
            const { updateProduct: serverUpdateProduct } = await import('@/app/actions');
            return await serverUpdateProduct(id, data);
        } catch (error) {
            console.error("DB-WRAPPER: Update product server failed", error);
        }
    }
    // Offline logic...
    await offlineDB.products
        .where('_localId').equals(id)
        .modify({
            ...data,
            _syncStatus: 'pending',
            _timestamp: Date.now()
        });

    await offlineDB.syncQueue.add({
        table: 'products',
        action: 'update',
        localId: id,
        data,
        _timestamp: Date.now(),
        _retryCount: 0
    });

    console.log("DB-WRAPPER: Product updated offline", { id, data });
    return { success: true, id, ...data };
}

export async function deleteProduct(id: string) {
    if (isOnline()) {
        try {
            const { deleteProduct: serverDelete } = await import('@/app/actions');
            return await serverDelete(id);
        } catch (error) {
            console.error("DB-WRAPPER: Delete product server failed", error);
        }
    }
    // Offline logic...
    // Soft delete
    await offlineDB.products
        .where('_localId').equals(id)
        .modify({
            _deletedAt: Date.now(),
            _syncStatus: 'pending',
            _timestamp: Date.now()
        });

    await offlineDB.syncQueue.add({
        table: 'products',
        action: 'delete',
        localId: id,
        data: {},
        _timestamp: Date.now(),
        _retryCount: 0
    });

    return { id };
}

export async function getProducts(organizationId: string) {
    if (isOnline()) {
        try {
            const { getProducts: serverGetProducts } = await import('@/app/actions');
            return await serverGetProducts(organizationId);
        } catch (error) {
            console.error("DB-WRAPPER: Get products server failed", error);
            return []; // Fallback to empty instead of crash
        }
    }
    // Offline logic...
    const products = await offlineDB.products
        .where('organizationId').equals(organizationId)
        .and(p => !p._deletedAt) // Exclude soft-deleted
        .toArray();

    return products.map(p => ({
        id: p._localId,
        barcode: p.barcode,
        name: p.name,
        price: p.price,
        stock: p.stock,
        category: p.category,
        organizationId: p.organizationId
    }));
}

export async function getProductByBarcode(barcode: string, organizationId: string) {
    if (isOnline()) {
        const { findProductByBarcode: serverFindProduct } = await import('@/app/actions');
        const res = await serverFindProduct(barcode, organizationId);
        return res.success ? res.product : null;
    } else {
        const product = await offlineDB.products
            .where('[barcode+organizationId]')
            .equals([barcode, organizationId])
            .and(p => !p._deletedAt)
            .first();

        if (!product) return null;

        return {
            id: product._localId,
            barcode: product.barcode,
            name: product.name,
            price: product.price,
            stock: product.stock,
            category: product.category,
            organizationId: product.organizationId
        };
    }
}

export async function adjustStock(data: {
    productId: string;
    quantity: number;
    type: 'IN' | 'OUT' | 'ADJUST' | 'TRANSFER';
    reason?: string;
    warehouseId: string;
    organizationId: string;
    unitId?: string;
    location?: { aisle?: string; shelf?: string; bin?: string };
    supplierId?: string;
    cost?: number;
}) {
    if (isOnline()) {
        try {
            const { adjustStock: serverAdjustStock } = await import('@/app/actions');
            return await serverAdjustStock({
                productId: data.productId,
                quantity: data.quantity,
                type: data.type,
                warehouseId: data.warehouseId,
                unitId: data.unitId,
                reason: data.reason,
                location: data.location,
                supplierId: data.supplierId,
                cost: data.cost,
                orgId: data.organizationId
            });
        } catch (error) {
            console.error("DB-WRAPPER: Adjust stock server failed", error);
        }
    }
    // Offline logic...
    await offlineDB.products
        .where('_localId').equals(data.productId)
        .modify(product => {
            const amount = data.type === 'IN' ? data.quantity : (data.type === 'OUT' ? -data.quantity : 0);
            if (data.type === 'ADJUST') {
                product.stock = data.quantity;
            } else {
                product.stock += amount;
            }
            product._syncStatus = 'pending';
            product._timestamp = Date.now();
        });

    await offlineDB.syncQueue.add({
        table: 'products',
        action: 'update',
        localId: data.productId,
        data: { stockAdjustment: { quantity: data.quantity, type: data.type } },
        _timestamp: Date.now(),
        _retryCount: 0
    });

    return { success: true };
}


// ==================== TRANSACTIONS (POS) ====================

export async function createTransaction(data: {
    amount: number;
    paidAmount?: number;
    type: string;
    mode: string;
    orgId: string;
    items: string | any[];
    clientId?: string;
    warehouseId?: string;
    accountId?: string;
}) {
    if (isOnline()) {
        try {
            const { createTransaction: serverCreateTransaction } = await import('@/app/actions');
            const itemsString = typeof data.items === 'string' ? data.items : JSON.stringify(data.items);
            return await serverCreateTransaction({
                amount: data.amount,
                paidAmount: data.paidAmount,
                type: data.type,
                mode: data.mode,
                orgId: resolveOrgId(data),
                items: itemsString,
                clientId: data.clientId,
                warehouseId: data.warehouseId,
                accountId: data.accountId
            });
        } catch (error) {
            console.error("DB-WRAPPER: Create transaction failed, using offline", error);
        }
    }

    const itemsArray = typeof data.items === 'string' ? JSON.parse(data.items) : data.items;
    const localId = uuid();
    const transaction: OfflineTransaction = {
        _localId: localId,
        total: data.amount,
        paymentMethod: data.mode,
        items: itemsArray.map((item: any) => ({
            productId: item.productId || item.id,
            quantity: item.quantity,
            price: item.price,
            name: item.name
        })),
        userId: 'system',
        organizationId: data.orgId,
        createdAt: new Date().toISOString(),
        _syncStatus: 'pending',
        _timestamp: Date.now()
    };

    await offlineDB.transactions.add(transaction);

    for (const item of itemsArray) {
        const productId = item.productId || item.id;
        await offlineDB.products
            .where('_localId').equals(productId)
            .modify(product => {
                product.stock -= item.quantity;
                product._syncStatus = 'pending';
                product._timestamp = Date.now();
            });
    }

    await offlineDB.syncQueue.add({
        table: 'transactions',
        action: 'create',
        localId,
        data: {
            ...data,
            items: itemsArray
        },
        _timestamp: Date.now(),
        _retryCount: 0
    });

    return { success: true, transaction: { id: localId, ...data } };
}

export async function getTransactions(organizationId: string, limit = 100) {
    if (isOnline()) {
        const { getTransactions: serverGetTransactions } = await import('@/app/actions');
        return await serverGetTransactions(organizationId, limit);
    } else {
        const transactions = await offlineDB.transactions
            .where('organizationId').equals(organizationId)
            .reverse()
            .limit(limit)
            .toArray();

        return transactions.map(t => ({
            id: t._localId,
            total: t.total,
            paymentMethod: t.paymentMethod,
            items: t.items,
            userId: t.userId,
            organizationId: t.organizationId,
            createdAt: new Date(t.createdAt)
        }));
    }
}

// ==================== HELPER FUNCTIONS ====================

/**
 * Check if we can perform operations (license valid)
 */
export async function canOperate(): Promise<{ allowed: boolean; message?: string }> {
    if (isOnline()) {
        return { allowed: true };
    }

    // Offline: Check license
    const licenseCheck = await offlineDB.isLicenseValid();

    if (!licenseCheck.valid) {
        return { allowed: false, message: licenseCheck.error };
    }

    // Warn if close to expiration
    if (licenseCheck.daysLeft && licenseCheck.daysLeft <= 3) {
        return {
            allowed: true,
            message: `⚠️ Plus que ${licenseCheck.daysLeft} jours offline. Connectez-vous à Internet.`
        };
    }

    return { allowed: true };
}

// ==================== CLIENTS ====================

export async function createClient(data: any) {
    if (isOnline()) {
        try {
            const { createClient: serverCreateClient } = await import('@/app/actions');
            return await serverCreateClient({
                ...data,
                orgId: resolveOrgId(data)
            });
        } catch (error) {
            console.error("DB-WRAPPER: Create client server failed", error);
        }
    }
    // Offline logic...
    const localId = uuid();
    const client = {
        _localId: localId,
        ...data,
        organizationId: resolveOrgId(data) as string,
        totalDebt: 0,
        _syncStatus: 'pending' as const,
        _timestamp: Date.now()
    };

    await offlineDB.clients.add(client);

    console.log("DB-WRAPPER: Client created offline", client);
    return { success: true, id: localId, ...data };
}

export async function updateClient(id: string, data: any) {
    if (isOnline()) {
        const { updateClient: serverUpdateClient } = await import('@/app/actions');
        return await serverUpdateClient(id, data);
    } else {
        await offlineDB.clients.where('_localId').equals(id).modify({ ...data, _syncStatus: 'pending', _timestamp: Date.now() });
        await offlineDB.syncQueue.add({
            table: 'clients',
            action: 'update',
            localId: id,
            data,
            _timestamp: Date.now(),
            _retryCount: 0
        });
        return { success: true, id, ...data };
    }
}

export async function getClients(organizationId: string) {
    if (isOnline()) {
        const { getClients: serverGetClients } = await import('@/app/actions');
        return await serverGetClients(organizationId);
    } else {
        const clients = await offlineDB.clients
            .where('organizationId').equals(organizationId)
            .and(c => !c._deletedAt)
            .toArray();

        return clients.map(c => ({
            id: c._localId,
            name: c.name,
            phone: c.phone,
            email: c.email,
            address: c.address,
            totalDebt: c.totalDebt,
            type: c.type,
            organizationId: c.organizationId
        }));
    }
}

export async function collectClientDebt(clientId: string, amount: number, orgId: string, accountId: string) {
    if (isOnline()) {
        const { collectClientDebt: serverCollectDebt } = await import('@/app/actions');
        return await serverCollectDebt(clientId, amount, orgId, accountId);
    } else {
        await offlineDB.clients
            .where('_localId').equals(clientId)
            .modify(client => {
                client.totalDebt -= amount;
                client._syncStatus = 'pending';
                client._timestamp = Date.now();
            });

        await offlineDB.syncQueue.add({
            table: 'clients',
            action: 'update',
            localId: clientId,
            data: { debtCollection: { amount, accountId } },
            _timestamp: Date.now(),
            _retryCount: 0
        });

        return { success: true };
    }
}

// ==================== WAREHOUSES & CATEGORIES ====================

export async function createWarehouse(data: { name: string, address?: string, orgId?: string, organizationId?: string }) {
    const orgId = resolveOrgId(data);
    if (isOnline()) {
        try {
            const { createWarehouse: serverCreateWarehouse } = await import('@/app/actions');
            return await serverCreateWarehouse({ ...data, orgId });
        } catch (error) {
            console.error("DB-WRAPPER: Create warehouse server failed", error);
        }
    }
    // Offline logic...
    const localId = uuid();
    const warehouse = {
        _localId: localId,
        name: data.name,
        address: data.address,
        organizationId: orgId,
        _syncStatus: 'pending' as const,
        _timestamp: Date.now()
    };
    await offlineDB.warehouses.add(warehouse);
    await offlineDB.syncQueue.add({
        table: 'warehouses',
        action: 'create',
        localId,
        data,
        _timestamp: Date.now(),
        _retryCount: 0
    });
    return { success: true, id: localId };
}

export async function getWarehouses(organizationId: string) {
    if (isOnline()) {
        const { getWarehouses: serverGetWarehouses } = await import('@/app/actions');
        return await serverGetWarehouses(organizationId);
    } else {
        const warehouses = await offlineDB.warehouses.where('organizationId').equals(organizationId).toArray();
        return warehouses.map(w => ({ id: w._localId, ...w }));
    }
}

export async function createCategory(name: string, organizationId: string, parentId?: string) {
    const orgId = organizationId; // Simple for this one
    if (isOnline()) {
        try {
            const { createCategory: serverCreateCategory } = await import('@/app/actions');
            return await serverCreateCategory(name, orgId, parentId);
        } catch (error) {
            console.error("DB-WRAPPER: Create category server failed", error);
        }
    }
    // Offline logic...
    const localId = uuid();
    const category = {
        _localId: localId,
        name,
        parentId,
        organizationId: orgId,
        _syncStatus: 'pending' as const,
        _timestamp: Date.now()
    };
    await offlineDB.categories.add(category);
    await offlineDB.syncQueue.add({
        table: 'categories',
        action: 'create',
        localId,
        data: { name, parentId, orgId },
        _timestamp: Date.now(),
        _retryCount: 0
    });
    return { success: true, id: localId };
}

export async function getCategories(organizationId: string) {
    if (isOnline()) {
        const { getCategories: serverGetCategories } = await import('@/app/actions');
        return await serverGetCategories(organizationId);
    } else {
        const categories = await offlineDB.categories.where('organizationId').equals(organizationId).toArray();
        return categories.map(c => ({ id: c._localId, ...c }));
    }
}

// ==================== SUPPLIERS ====================

export async function createSupplier(data: any) {
    if (isOnline()) {
        try {
            const { createSupplier: serverCreateSupplier } = await import('@/app/actions');
            return await serverCreateSupplier(data);
        } catch (error) {
            console.error("DB-WRAPPER: Create supplier server failed", error);
        }
    }
    // Offline logic...
    const localId = uuid();
    const supplier = {
        _localId: localId,
        ...data,
        organizationId: resolveOrgId(data) as string,
        totalDebt: 0,
        _syncStatus: 'pending',
        _timestamp: Date.now()
    };
    await offlineDB.suppliers.add(supplier);
    await offlineDB.syncQueue.add({
        table: 'suppliers',
        action: 'create',
        localId,
        data,
        _timestamp: Date.now(),
        _retryCount: 0
    });
    return { success: true, id: localId, supplier };
}

export async function updateSupplier(id: string, data: any) {
    if (isOnline()) {
        try {
            const { updateSupplier: serverUpdateSupplier } = await import('@/app/actions');
            return await serverUpdateSupplier(id, data);
        } catch (error) {
            console.error("DB-WRAPPER: Update supplier server failed", error);
        }
    }
    // Offline logic...
    await offlineDB.suppliers.where('_localId').equals(id).modify({ ...data, _syncStatus: 'pending', _timestamp: Date.now() });
    await offlineDB.syncQueue.add({
        table: 'suppliers',
        action: 'update',
        localId: id,
        data,
        _timestamp: Date.now(),
        _retryCount: 0
    });
    return { success: true };
}

export async function getSuppliers(organizationId: string) {
    if (isOnline()) {
        try {
            const { getSuppliers: serverGetSuppliers } = await import('@/app/actions');
            return await serverGetSuppliers(organizationId);
        } catch (error) {
            console.error("DB-WRAPPER: Get suppliers server failed", error);
        }
    }
    // Offline logic...
    const suppliers = await offlineDB.suppliers.where('organizationId').equals(organizationId).toArray();
    return suppliers.map(s => ({ id: s._localId, ...s }));
}

export async function paySupplierDebt(supplierId: string, amount: number, orgId: string, accountId: string) {
    if (isOnline()) {
        try {
            const { paySupplierDebt: serverPayDebt } = await import('@/app/actions');
            return await serverPayDebt(supplierId, amount, orgId, accountId);
        } catch (error) {
            console.error("DB-WRAPPER: Pay supplier debt server failed", error);
        }
    }
    // Offline logic...
    await offlineDB.suppliers.where('_localId').equals(supplierId).modify(s => {
        s.totalDebt -= amount;
        s._syncStatus = 'pending';
        s._timestamp = Date.now();
    });
    await offlineDB.syncQueue.add({
        table: 'suppliers',
        action: 'update',
        localId: supplierId,
        data: { debtPayment: { amount, accountId } },
        _timestamp: Date.now(),
        _retryCount: 0
    });
    return { success: true };
}

export async function adjustSupplierDebt(data: { supplierId: string, amount: number, type: 'INCREMENT' | 'DECREMENT', orgId: string, organizationId?: string }) {
    if (isOnline()) {
        const { adjustSupplierDebt: serverAdjustDebt } = await import('@/app/actions');
        return await serverAdjustDebt(data);
    } else {
        await offlineDB.suppliers.where('_localId').equals(data.supplierId).modify(s => {
            const amount = data.type === 'INCREMENT' ? data.amount : -data.amount;
            s.totalDebt += amount;
            s._syncStatus = 'pending';
            s._timestamp = Date.now();
        });
        await offlineDB.syncQueue.add({
            table: 'suppliers',
            action: 'update',
            localId: data.supplierId,
            data: { debtAdjustment: data },
            _timestamp: Date.now(),
            _retryCount: 0
        });
        return { success: true };
    }
}

// ==================== PRODUCT UNITS (UOM) ====================

export async function createProductUnit(data: any) {
    if (isOnline()) {
        const { createProductUnit: serverCreateUnit } = await import('@/app/actions');
        return await serverCreateUnit(data);
    } else {
        // Local logic omitted for brevity in POC, routing to sync queue
        await offlineDB.syncQueue.add({
            table: 'productUnits',
            action: 'create',
            localId: uuid(),
            data,
            _timestamp: Date.now(),
            _retryCount: 0
        });
        return { success: true };
    }
}

export async function deleteProductUnit(id: string) {
    if (isOnline()) {
        const { deleteProductUnit: serverDeleteUnit } = await import('@/app/actions');
        return await serverDeleteUnit(id);
    } else {
        await offlineDB.syncQueue.add({
            table: 'productUnits',
            action: 'delete',
            localId: id,
            data: {},
            _timestamp: Date.now(),
            _retryCount: 0
        });
        return { success: true };
    }
}

// ==================== Z-REPORT & PRINTING ====================

export async function getZReportData(orgId: string) {
    if (isOnline()) {
        const { getZReportData: serverGetZ } = await import('@/app/actions');
        return await serverGetZ(orgId);
    } else {
        // Provide empty/local data if offline
        const today = new Date().toISOString().split('T')[0];
        const transactions = await offlineDB.transactions.where('organizationId').equals(orgId).toArray();
        const todayTransactions = transactions.filter(t => t.createdAt.startsWith(today));
        const todaySales = todayTransactions.reduce((acc, t) => acc + t.total, 0);

        return {
            todaySales,
            todayTransactions: todayTransactions.length,
            recentTransactions: todayTransactions,
            accounts: [],
            warehouses: []
        };
    }
}

export async function printJob(content: string, printerName: string) {
    if (isOnline()) {
        const { printJob: serverPrint } = await import('@/app/actions');
        return await serverPrint(content, printerName);
    } else {
        console.log('Offline: Print job queued (Mock)', { content, printerName });
        return { success: true };
    }
}



export async function deleteWarehouse(id: string) {
    if (isOnline()) {
        const { deleteWarehouse: serverDelete } = await import('@/app/actions');
        return await serverDelete(id);
    } else {
        await offlineDB.warehouses.where('_localId').equals(id).delete();
        await offlineDB.syncQueue.add({
            table: 'warehouses',
            action: 'delete',
            localId: id,
            data: {},
            _timestamp: Date.now(),
            _retryCount: 0
        });
        return { success: true };
    }
}

export async function deleteCategory(id: string) {
    if (isOnline()) {
        const { deleteCategory: serverDelete } = await import('@/app/actions');
        return await serverDelete(id);
    } else {
        await offlineDB.categories.where('_localId').equals(id).delete();
        await offlineDB.syncQueue.add({
            table: 'categories',
            action: 'delete',
            localId: id,
            data: {},
            _timestamp: Date.now(),
            _retryCount: 0
        });
        return { success: true };
    }
}

export async function deleteSupplier(id: string) {
    if (isOnline()) {
        const { deleteSupplier: serverDelete } = await import('@/app/actions');
        return await serverDelete(id);
    } else {
        await offlineDB.suppliers.where('_localId').equals(id).delete();
        await offlineDB.syncQueue.add({
            table: 'suppliers',
            action: 'delete',
            localId: id,
            data: {},
            _timestamp: Date.now(),
            _retryCount: 0
        });
        return { success: true };
    }
}

export async function createExpense(data: any) {
    if (isOnline()) {
        const { createExpense: serverCreate } = await import('@/app/actions');
        return await serverCreate(data);
    } else {
        const localId = uuid();
        // Update local account balance if paid
        if (data.isPaid && data.accountId) {
            await offlineDB.accounts.where('_localId').equals(data.accountId).modify(acc => {
                acc.balance -= data.amount;
                acc._syncStatus = 'pending';
                acc._timestamp = Date.now();
            });
        }

        await offlineDB.syncQueue.add({
            table: 'expenses',
            action: 'create',
            localId,
            data,
            _timestamp: Date.now(),
            _retryCount: 0
        });
        return { success: true, id: localId };
    }
}

// ==================== HR MODULE ====================

export async function createEmployee(data: any) {
    if (isOnline()) {
        const { createEmployee: serverCreateEmployee } = await import('@/app/actions-hr');
        return await serverCreateEmployee(data);
    } else {
        const localId = uuid();
        const employee = {
            _localId: localId,
            ...data,
            baseSalary: Number(data.baseSalary),
            commissionPct: Number(data.commissionPct || 0),
            monthlyGoal: Number(data.monthlyGoal || 0),
            isActive: true,
            _syncStatus: 'pending' as const,
            _timestamp: Date.now()
        };

        await offlineDB.employees.add(employee);

        await offlineDB.syncQueue.add({
            table: 'employees',
            action: 'create',
            localId,
            data,
            _timestamp: Date.now(),
            _retryCount: 0
        });

        return { success: true, data: employee };
    }
}

export async function updateEmployee(id: string, data: any) {
    if (isOnline()) {
        const { updateEmployee: serverUpdateEmployee } = await import('@/app/actions-hr');
        return await serverUpdateEmployee(id, data);
    } else {
        await offlineDB.employees
            .where('_localId').equals(id)
            .modify(emp => {
                Object.assign(emp, data);
                if (data.baseSalary) emp.baseSalary = Number(data.baseSalary);
                if (data.commissionPct) emp.commissionPct = Number(data.commissionPct);
                if (data.monthlyGoal) emp.monthlyGoal = Number(data.monthlyGoal);
                emp._syncStatus = 'pending';
                emp._timestamp = Date.now();
            });

        await offlineDB.syncQueue.add({
            table: 'employees',
            action: 'update',
            localId: id,
            data,
            _timestamp: Date.now(),
            _retryCount: 0
        });

        return { success: true };
    }
}

export async function getEmployees(orgId: string) {
    if (isOnline()) {
        const { getEmployees: serverGetEmployees } = await import('@/app/actions-hr');
        return await serverGetEmployees(orgId);
    } else {
        const employees = await offlineDB.employees
            .where('organizationId').equals(orgId)
            .filter(e => e.isActive)
            .toArray();

        // Simplified enrichment for offline
        const enriched = employees.map(emp => ({
            id: emp._localId,
            ...emp,
            isPresent: false // Would need complex join with attendances
        }));

        return { success: true, data: enriched };
    }
}

export async function clockIn(pin: string, orgId: string, ip: string) {
    if (isOnline()) {
        const { clockIn: serverClockIn } = await import('@/app/actions-hr');
        return await serverClockIn(pin, orgId, ip);
    } else {
        const employee = await offlineDB.employees
            .where({ pinCode: pin, organizationId: orgId })
            .first();

        if (!employee) return { success: false, error: "Code PIN invalide" };

        const localId = uuid();
        const now = new Date();
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();

        await offlineDB.attendances.add({
            _localId: localId,
            employeeId: employee._localId,
            organizationId: orgId,
            date: today,
            clockIn: now.toISOString(),
            status: "PRESENT",
            _syncStatus: 'pending',
            _timestamp: Date.now()
        });

        await offlineDB.syncQueue.add({
            table: 'attendances',
            action: 'create',
            localId,
            data: { pin, orgId, ip, type: 'clockIn' },
            _timestamp: Date.now(),
            _retryCount: 0
        });

        return { success: true, employeeName: employee.name };
    }
}

export async function clockOut(pin: string, orgId: string) {
    if (isOnline()) {
        const { clockOut: serverClockOut } = await import('@/app/actions-hr');
        return await serverClockOut(pin, orgId);
    } else {
        const employee = await offlineDB.employees
            .where({ pinCode: pin, organizationId: orgId })
            .first();

        if (!employee) return { success: false, error: "Code PIN invalide" };

        const openSessions = await offlineDB.attendances
            .where('employeeId').equals(employee._localId)
            .filter(a => !a.clockOut)
            .toArray();

        for (const session of openSessions) {
            await offlineDB.attendances.update(session.id!, {
                clockOut: new Date().toISOString(),
                _syncStatus: 'pending',
                _timestamp: Date.now()
            });

            await offlineDB.syncQueue.add({
                table: 'attendances',
                action: 'update',
                localId: session._localId,
                data: { pin, orgId, type: 'clockOut' },
                _timestamp: Date.now(),
                _retryCount: 0
            });
        }

        return { success: true, employeeName: employee.name };
    }
}

export async function getAttendanceHistory(employeeId: string, month: string) {
    if (isOnline()) {
        const { getAttendanceHistory: serverGetAttendanceHistory } = await import('@/app/actions-hr');
        return await serverGetAttendanceHistory(employeeId, month);
    } else {
        const records = await offlineDB.attendances
            .where('employeeId').equals(employeeId)
            .filter(a => a.date.startsWith(month))
            .toArray();
        return { success: true, data: records };
    }
}

export async function setAttendanceManual(data: { employeeId: string, organizationId: string, date: string, status: string }) {
    if (isOnline()) {
        const { setAttendanceManual: serverSetAttendanceManual } = await import('@/app/actions-hr');
        return await serverSetAttendanceManual(data);
    } else {
        const localId = uuid();
        await offlineDB.attendances.add({
            _localId: localId,
            ...data,
            clockIn: data.date,
            _syncStatus: 'pending',
            _timestamp: Date.now()
        });

        await offlineDB.syncQueue.add({
            table: 'attendances',
            action: 'create',
            localId,
            data,
            _timestamp: Date.now(),
            _retryCount: 0
        });

        return { success: true };
    }
}

export async function requestAdvance(data: any) {
    if (isOnline()) {
        const { requestAdvance: serverRequestAdvance } = await import('@/app/actions-hr');
        return await serverRequestAdvance(data);
    } else {
        const localId = uuid();
        await offlineDB.salaryAdvances.add({
            _localId: localId,
            employeeId: data.employeeId,
            organizationId: data.organizationId,
            amount: Number(data.amount),
            status: "APPROVED",
            date: new Date().toISOString(),
            _syncStatus: 'pending',
            _timestamp: Date.now()
        });

        await offlineDB.syncQueue.add({
            table: 'salaryAdvances',
            action: 'create',
            localId,
            data,
            _timestamp: Date.now(),
            _retryCount: 0
        });

        return { success: true };
    }
}

export async function getHROverview(orgId: string) {
    if (isOnline()) {
        const { getHROverview: serverGetHROverview } = await import('@/app/actions-hr');
        return await serverGetHROverview(orgId);
    } else {
        const employees = await offlineDB.employees.where('organizationId').equals(orgId).toArray();
        const advances = await offlineDB.salaryAdvances.where('organizationId').equals(orgId).toArray();

        return {
            success: true,
            data: {
                employeeCount: employees.length,
                totalBaseSalary: employees.reduce((acc, e) => acc + e.baseSalary, 0),
                totalAdvances: advances.reduce((acc, a) => acc + a.amount, 0)
            }
        };
    }
}

export async function generatePayroll(employeeId: string, month: string) {
    if (isOnline()) {
        const { generatePayroll: serverGeneratePayroll } = await import('@/app/actions-hr');
        return await serverGeneratePayroll(employeeId, month);
    } else {
        const employee = await offlineDB.employees.where('_localId').equals(employeeId).first();
        if (!employee) return { success: false, error: "Employé introuvable" };

        return {
            success: true,
            data: {
                employeeId,
                employeeName: employee.name,
                month,
                baseSalary: employee.baseSalary,
                attendanceDed: 0,
                advancesDed: 0,
                commissions: 0,
                netPayable: employee.baseSalary,
                absentDays: 0,
                advanceCount: 0
            }
        };
    }
}

export async function savePayroll(data: any) {
    if (isOnline()) {
        const { savePayroll: serverSavePayroll } = await import('@/app/actions-hr');
        return await serverSavePayroll(data);
    } else {
        const localId = uuid();
        await offlineDB.payrolls.add({
            _localId: localId,
            ...data,
            _syncStatus: 'pending',
            _timestamp: Date.now()
        });

        await offlineDB.syncQueue.add({
            table: 'payrolls',
            action: 'create',
            localId,
            data,
            _timestamp: Date.now(),
            _retryCount: 0
        });

        return { success: true };
    }
}

// ==================== ADMIN / USERS MODULE ====================

export async function getRoles(organizationId: string) {
    if (isOnline()) {
        const { getRoles: serverGetRoles } = await import('@/app/actions-users');
        return await serverGetRoles(organizationId);
    } else {
        const roles = await offlineDB.roles.where('organizationId').equals(organizationId).toArray();
        return { success: true, data: roles.map(r => ({ id: r._localId, ...r })) };
    }
}

export async function createRole(data: any) {
    if (isOnline()) {
        const { createRole: serverCreateRole } = await import('@/app/actions-users');
        return await serverCreateRole(data);
    } else {
        const localId = uuid();
        await offlineDB.roles.add({
            _localId: localId,
            ...data,
            _syncStatus: 'pending',
            _timestamp: Date.now()
        });

        await offlineDB.syncQueue.add({
            table: 'roles',
            action: 'create',
            localId,
            data,
            _timestamp: Date.now(),
            _retryCount: 0
        });

        return { success: true, data: { id: localId, ...data } };
    }
}

export async function updateRole(roleId: string, data: any) {
    if (isOnline()) {
        const { updateRole: serverUpdateRole } = await import('@/app/actions-users');
        return await serverUpdateRole(roleId, data);
    } else {
        await offlineDB.roles.where('_localId').equals(roleId).modify(role => {
            Object.assign(role, data);
            role._syncStatus = 'pending';
            role._timestamp = Date.now();
        });

        await offlineDB.syncQueue.add({
            table: 'roles',
            action: 'update',
            localId: roleId,
            data,
            _timestamp: Date.now(),
            _retryCount: 0
        });

        return { success: true };
    }
}

export async function deleteRole(roleId: string) {
    if (isOnline()) {
        const { deleteRole: serverDeleteRole } = await import('@/app/actions-users');
        return await serverDeleteRole(roleId);
    } else {
        await offlineDB.roles.where('_localId').equals(roleId).delete();
        await offlineDB.syncQueue.add({
            table: 'roles',
            action: 'delete',
            localId: roleId,
            data: {},
            _timestamp: Date.now(),
            _retryCount: 0
        });
        return { success: true };
    }
}

export async function getPermissions() {
    if (isOnline()) {
        const { getPermissions: serverGetPermissions } = await import('@/app/actions-users');
        return await serverGetPermissions();
    } else {
        const perms = await offlineDB.permissions.toArray();
        return { success: true, data: perms };
    }
}

export async function getUsers(organizationId: string) {
    if (isOnline()) {
        const { getUsers: serverGetUsers } = await import('@/app/actions-users');
        return await serverGetUsers(organizationId);
    } else {
        const users = await offlineDB.users.where('organizationId').equals(organizationId).toArray();
        return { success: true, data: users.map(u => ({ id: u._localId, ...u })) };
    }
}

export async function createUser(data: any) {
    if (isOnline()) {
        const { createUser: serverCreateUser } = await import('@/app/actions-users');
        return await serverCreateUser(data);
    } else {
        const localId = uuid();
        await offlineDB.users.add({
            _localId: localId,
            ...data,
            _syncStatus: 'pending',
            _timestamp: Date.now()
        });

        await offlineDB.syncQueue.add({
            table: 'users',
            action: 'create',
            localId,
            data,
            _timestamp: Date.now(),
            _retryCount: 0
        });

        return { success: true, data: { id: localId, ...data } };
    }
}

export async function updateUser(userId: string, data: any) {
    if (isOnline()) {
        const { updateUser: serverUpdateUser } = await import('@/app/actions-users');
        return await serverUpdateUser(userId, data);
    } else {
        await offlineDB.users.where('_localId').equals(userId).modify(user => {
            Object.assign(user, data);
            user._syncStatus = 'pending';
            user._timestamp = Date.now();
        });

        await offlineDB.syncQueue.add({
            table: 'users',
            action: 'update',
            localId: userId,
            data,
            _timestamp: Date.now(),
            _retryCount: 0
        });

        return { success: true };
    }
}

export async function deleteUser(userId: string) {
    if (isOnline()) {
        const { deleteUser: serverDeleteUser } = await import('@/app/actions-users');
        return await serverDeleteUser(userId);
    } else {
        await offlineDB.users.where('_localId').equals(userId).delete();
        await offlineDB.syncQueue.add({
            table: 'users',
            action: 'delete',
            localId: userId,
            data: {},
            _timestamp: Date.now(),
            _retryCount: 0
        });
        return { success: true };
    }
}

export async function assignPermissionsToRole(roleId: string, permissionIds: string[]) {
    if (isOnline()) {
        const { assignPermissionsToRole: serverAssign } = await import('@/app/actions-users');
        return await serverAssign(roleId, permissionIds);
    } else {
        // Find permissions by slug
        const perms = await offlineDB.permissions.where('slug').anyOf(permissionIds).toArray();
        const fullPermIds = perms.map(p => p._localId);

        await offlineDB.roles.where('_localId').equals(roleId).modify(role => {
            role.permissions = permissionIds; // Store slugs or IDs? Usually slugs are easier for UI
            role._syncStatus = 'pending';
            role._timestamp = Date.now();
        });

        await offlineDB.syncQueue.add({
            table: 'roles',
            action: 'update',
            localId: roleId,
            data: { permissionIds },
            _timestamp: Date.now(),
            _retryCount: 0
        });

        return { success: true };
    }
}


export async function getAccounts(organizationId: string) {
    if (isOnline()) {
        const { getAccounts: serverGetAccounts } = await import('@/app/actions');
        return await serverGetAccounts(organizationId);
    } else {
        const accounts = await offlineDB.accounts.where('organizationId').equals(organizationId).toArray();
        return accounts.map(a => ({ id: a._localId, ...a }));
    }
}
