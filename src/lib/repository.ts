import { isOnline } from './offline/connection-monitor';
import * as actions from '@/app/actions';
import * as actionsHR from '@/app/actions-hr';
import * as actionsUsers from '@/app/actions-users';
import { offlineDB } from './offline/db';

/**
 * Unified Repository Pattern
 * Centralizes all data operations (Server + Offline Fallback)
 */
export const Repository = {
    /**
     * Product Operations
     */
    async createProduct(data: any) {
        if (isOnline()) {
            try {
                return await actions.createProduct(data);
            } catch (error) {
                console.error("REPO: createProduct online failed", error);
            }
        }

        const localId = typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2);
        await offlineDB.products.add({
            ...data,
            _localId: localId,
            _syncStatus: 'pending',
            _timestamp: Date.now()
        });

        await offlineDB.syncQueue.add({
            table: 'products',
            action: 'create',
            localId,
            data,
            _timestamp: Date.now(),
            _retryCount: 0
        });

        return { success: true, id: localId, offline: true };
    },

    async getProducts(organizationId: string) {
        if (isOnline()) {
            try {
                const res = await actions.getProducts(organizationId);
                return { success: true, data: res };
            } catch (error) {
                console.error("REPO: getProducts online failed", error);
            }
        }

        const localItems = await offlineDB.products.where('organizationId').equals(organizationId).toArray();
        return { success: true, data: localItems.map(item => ({ id: item._localId, ...item })) };
    },

    async updateProduct(id: string, data: any) {
        if (isOnline()) {
            try {
                return await actions.updateProduct(id, data);
            } catch (error) {
                console.error("REPO: updateProduct online failed", error);
            }
        }

        await offlineDB.products.where('_localId').equals(id).modify({
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

        return { success: true, id, error: undefined };
    },

    async deleteProduct(id: string) {
        if (isOnline()) {
            try {
                return await actions.deleteProduct(id);
            } catch (error) {
                console.error("REPO: deleteProduct online failed", error);
            }
        }

        await offlineDB.products.where('_localId').equals(id).modify({
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

        return { success: true, id, error: undefined };
    },

    async getProductByBarcode(barcode: string, organizationId: string) {
        if (isOnline()) {
            try {
                const res = await actions.findProductByBarcode(barcode, organizationId);
                return res.success ? res.product : null;
            } catch (error) {
                console.error("REPO: getProductByBarcode online failed", error);
            }
        }

        const product = await offlineDB.products
            .where('[barcode+organizationId]')
            .equals([barcode, organizationId])
            .and(p => !p._deletedAt)
            .first();

        return product ? { id: product._localId, ...product } : null;
    },

    async importProducts(data: any[], orgId: string) {
        if (isOnline()) {
            try {
                return await actions.importProducts(orgId, data);
            } catch (error) {
                console.error("REPO: importProducts online failed", error);
            }
        }
        return { success: false, error: "Importation CSV nécessite une connexion en ligne" };
    },

    async findProductByBarcode(barcode: string, organizationId: string) {
        return this.getProductByBarcode(barcode, organizationId);
    },

    async recordPurchase(data: any) {
        if (isOnline()) {
            try {
                return await actions.recordPurchase(data);
            } catch (error) {
                console.error("REPO: recordPurchase online failed", error);
            }
        }

        const localId = typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2);
        const movementData = {
            productId: data.productId,
            warehouseId: data.warehouseId,
            type: 'IN' as const,
            quantity: data.quantity,
            reason: data.reason || 'Achat (Offline)',
            organizationId: data.orgId || data.organizationId,
            createdAt: new Date().toISOString()
        };

        await offlineDB.movements.add({
            ...movementData,
            _localId: localId,
            _syncStatus: 'pending',
            _timestamp: Date.now()
        });

        await offlineDB.syncQueue.add({
            table: 'movements',
            action: 'create',
            localId,
            data: movementData,
            _timestamp: Date.now(),
            _retryCount: 0
        });

        // Update local product stock
        if (data.productId) {
            const product = await offlineDB.products.where('_localId').equals(data.productId).first();
            if (product) {
                await offlineDB.products.where('_localId').equals(data.productId).modify({
                    stock: (product.stock || 0) + data.quantity,
                    _timestamp: Date.now(),
                    _syncStatus: 'pending' // Technically movement sync handles the adjustment, but marking product as dirty is safer
                });
            }
        }

        return { success: true, offline: true, error: undefined };
    },

    /**
     * Client Operations
     */
    async createClient(data: any) {
        if (isOnline()) {
            try {
                return await actions.createClient(data);
            } catch (error) {
                console.error("REPO: createClient online failed", error);
            }
        }

        const localId = typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2);
        await offlineDB.clients.add({
            ...data,
            _localId: localId,
            _syncStatus: 'pending',
            _timestamp: Date.now(),
            totalDebt: 0
        });

        await offlineDB.syncQueue.add({
            table: 'clients',
            action: 'create',
            localId,
            data,
            _timestamp: Date.now(),
            _retryCount: 0
        });

        return { success: true, id: localId, offline: true, error: undefined };
    },

    async getClients(organizationId: string) {
        if (isOnline()) {
            try {
                const res = await actions.getClients(organizationId);
                return { success: true, data: res };
            } catch (error) {
                console.error("REPO: getClients online failed", error);
            }
        }

        const localItems = await offlineDB.clients.where('organizationId').equals(organizationId).toArray();
        return { success: true, data: localItems.map(item => ({ id: item._localId, ...item })) };
    },

    async updateClient(id: string, data: any) {
        if (isOnline()) {
            try {
                return await actions.updateClient(id, data);
            } catch (error) {
                console.error("REPO: updateClient online failed", error);
            }
        }

        await offlineDB.clients.where('_localId').equals(id).modify({
            ...data,
            _syncStatus: 'pending',
            _timestamp: Date.now()
        });

        await offlineDB.syncQueue.add({
            table: 'clients',
            action: 'update',
            localId: id,
            data,
            _timestamp: Date.now(),
            _retryCount: 0
        });

        return { success: true, id, error: undefined };
    },

    async collectClientDebt(clientId: string, amount: number, orgId: string, accountId: string) {
        if (isOnline()) {
            try {
                return await actions.collectClientDebt(clientId, amount, orgId, accountId);
            } catch (error) {
                console.error("REPO: collectClientDebt online failed", error);
            }
        }

        await offlineDB.clients.where('_localId').equals(clientId).modify(client => {
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

        return { success: true, error: undefined };
    },

    async getClientHistory(clientId: string) {
        if (isOnline()) {
            try {
                const res = await actions.getClientHistory(clientId);
                return { success: true, data: res };
            } catch (error) {
                console.error("REPO: getClientHistory online failed", error);
            }
        }
        const localTransactions = await offlineDB.transactions.where('clientId').equals(clientId).toArray();
        return { success: true, data: localTransactions.map(t => ({ id: t._localId, ...t })) };
    },

    /**
     * Category Operations
     */
    async createCategory(name: string, orgId: string, parentId?: string) {
        if (isOnline()) {
            try {
                return await actions.createCategory(name, orgId, parentId);
            } catch (error) {
                console.error("REPO: createCategory online failed", error);
            }
        }

        const localId = typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2);
        const data = { name, organizationId: orgId, parentId };
        await offlineDB.categories.add({
            ...data,
            _localId: localId,
            _syncStatus: 'pending',
            _timestamp: Date.now()
        });

        await offlineDB.syncQueue.add({
            table: 'categories',
            action: 'create',
            localId,
            data,
            _timestamp: Date.now(),
            _retryCount: 0
        });

        return { success: true, id: localId, offline: true, error: undefined };
    },

    async getCategories(organizationId: string) {
        if (isOnline()) {
            try {
                const res = await actions.getCategories(organizationId);
                return { success: true, data: res };
            } catch (error) {
                console.error("REPO: getCategories online failed", error);
            }
        }

        const localItems = await offlineDB.categories.where('organizationId').equals(organizationId).toArray();
        return { success: true, data: localItems.map(item => ({ id: item._localId, ...item })) };
    },

    /**
     * Supplier Operations
     */
    async createSupplier(data: any) {
        if (isOnline()) {
            try {
                return await actions.createSupplier(data);
            } catch (error) {
                console.error("REPO: createSupplier online failed", error);
            }
        }

        const localId = typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2);
        await offlineDB.suppliers.add({
            ...data,
            _localId: localId,
            _syncStatus: 'pending',
            _timestamp: Date.now()
        });

        await offlineDB.syncQueue.add({
            table: 'suppliers',
            action: 'create',
            localId,
            data,
            _timestamp: Date.now(),
            _retryCount: 0
        });

        return { success: true, id: localId, offline: true, error: undefined };
    },

    async getSuppliers(organizationId: string) {
        if (isOnline()) {
            try {
                const res = await actions.getSuppliers(organizationId);
                return { success: true, data: res };
            } catch (error) {
                console.error("REPO: getSuppliers online failed", error);
            }
        }

        const localItems = await offlineDB.suppliers.where('organizationId').equals(organizationId).toArray();
        return { success: true, data: localItems.map(item => ({ id: item._localId, ...item })) };
    },

    async updateSupplier(id: string, data: any) {
        if (isOnline()) {
            try {
                return await actions.updateSupplier(id, data);
            } catch (error) {
                console.error("REPO: updateSupplier online failed", error);
            }
        }

        await offlineDB.suppliers.where('_localId').equals(id).modify({
            ...data,
            _syncStatus: 'pending',
            _timestamp: Date.now()
        });

        await offlineDB.syncQueue.add({
            table: 'suppliers',
            action: 'update',
            localId: id,
            data,
            _timestamp: Date.now(),
            _retryCount: 0
        });

        return { success: true, error: undefined };
    },

    async deleteSupplier(id: string) {
        if (isOnline()) {
            try {
                return await actions.deleteSupplier(id);
            } catch (error) {
                console.error("REPO: deleteSupplier online failed", error);
            }
        }
        return { success: false, offline: true };
    },

    async paySupplierDebt(supplierId: string, amount: number, orgId: string, accountId: string) {
        if (isOnline()) {
            try {
                return await actions.paySupplierDebt(supplierId, amount, orgId, accountId);
            } catch (error) {
                console.error("REPO: paySupplierDebt online failed", error);
            }
        }

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

        return { success: true, error: undefined };
    },

    async adjustSupplierDebt(data: any) {
        if (isOnline()) {
            try {
                return await actions.adjustSupplierDebt(data);
            } catch (error) {
                console.error("REPO: adjustSupplierDebt online failed", error);
            }
        }

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

        return { success: true, error: undefined };
    },

    /**
     * Warehouse Operations
     */
    async createWarehouse(data: any) {
        if (isOnline()) {
            try {
                return await actions.createWarehouse(data);
            } catch (error) {
                console.error("REPO: createWarehouse online failed", error);
            }
        }

        const localId = typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2);
        await offlineDB.warehouses.add({
            ...data,
            _localId: localId,
            _syncStatus: 'pending',
            _timestamp: Date.now()
        });

        await offlineDB.syncQueue.add({
            table: 'warehouses',
            action: 'create',
            localId,
            data,
            _timestamp: Date.now(),
            _retryCount: 0
        });

        return { success: true, id: localId, offline: true, error: undefined };
    },

    async getWarehouses(organizationId: string) {
        if (isOnline()) {
            try {
                const res = await actions.getWarehouses(organizationId);
                return { success: true, data: res };
            } catch (error) {
                console.error("REPO: getWarehouses online failed", error);
            }
        }

        const localItems = await offlineDB.warehouses.where('organizationId').equals(organizationId).toArray();
        return { success: true, data: localItems.map(item => ({ id: item._localId, ...item })) };
    },

    async deleteWarehouse(id: string) {
        if (isOnline()) {
            try {
                return await actions.deleteWarehouse(id);
            } catch (error) {
                console.error("REPO: deleteWarehouse online failed", error);
            }
        }
        return { success: false, offline: true };
    },

    async deleteCategory(id: string) {
        if (isOnline()) {
            try {
                return await actions.deleteCategory(id);
            } catch (error) {
                console.error("REPO: deleteCategory online failed", error);
            }
        }
        return { success: false, offline: true };
    },

    /**
     * Transaction Operations
     */
    async createTransaction(data: any) {
        if (isOnline()) {
            try {
                return await actions.createTransaction(data);
            } catch (error) {
                console.error("REPO: createTransaction online failed", error);
            }
        }

        const localId = typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2);
        await offlineDB.transactions.add({
            ...data,
            _localId: localId,
            _syncStatus: 'pending',
            _timestamp: Date.now(),
            createdAt: new Date().toISOString()
        } as any);

        await offlineDB.syncQueue.add({
            table: 'transactions',
            action: 'create',
            localId,
            data,
            _timestamp: Date.now(),
            _retryCount: 0
        });

        return { success: true, id: localId, offline: true, error: undefined };
    },

    async getTransactions(organizationId: string, limit = 100) {
        if (isOnline()) {
            try {
                const res = await actions.getTransactions(organizationId, limit);
                return { success: true, data: res };
            } catch (error) {
                console.error("REPO: getTransactions online failed", error);
            }
        }

        const localItems = await offlineDB.transactions
            .where('organizationId').equals(organizationId)
            .reverse()
            .limit(limit)
            .toArray();

        return { success: true, data: localItems.map(item => ({ id: item._localId, ...item })) };
    },

    /**
     * Stock Movement Operations
     */
    async adjustStock(data: any) {
        if (isOnline()) {
            try {
                return await actions.adjustStock(data);
            } catch (error) {
                console.error("REPO: adjustStock online failed", error);
            }
        }

        const localId = typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2);
        await offlineDB.movements.add({
            ...data,
            _localId: localId,
            _syncStatus: 'pending',
            _timestamp: Date.now(),
            createdAt: new Date().toISOString()
        } as any);

        await offlineDB.syncQueue.add({
            table: 'movements',
            action: 'create',
            localId,
            data,
            _timestamp: Date.now(),
            _retryCount: 0
        });

        return { success: true, id: localId, offline: true, error: undefined };
    },

    /**
     * Finance Operations
     */
    async getAccounts(organizationId: string) {
        if (isOnline()) {
            try {
                const res = await actions.getAccounts(organizationId);
                return { success: true, data: res };
            } catch (error) {
                console.error("REPO: getAccounts online failed", error);
            }
        }

        const localItems = await offlineDB.accounts.where('organizationId').equals(organizationId).toArray();
        return { success: true, data: localItems.map(item => ({ id: item._localId, ...item })) };
    },

    async getZReportData(organizationId: string) {
        if (isOnline()) {
            try {
                return await actions.getZReportData(organizationId);
            } catch (error) {
                console.error("REPO: getZReportData online failed", error);
            }
        }

        // Simplified offline Z-report
        return {
            todaySales: 0,
            todayTransactions: 0,
            recentTransactions: [],
            accounts: [],
            warehouses: []
        };
    },

    async createExpense(data: any) {
        if (isOnline()) {
            try {
                return await actions.createExpense(data);
            } catch (error) {
                console.error("REPO: createExpense online failed", error);
            }
        }

        const localId = typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2);
        await offlineDB.syncQueue.add({
            table: 'expenses',
            action: 'create',
            localId,
            data,
            _timestamp: Date.now(),
            _retryCount: 0
        });

        return { success: true, id: localId, error: undefined };
    },

    /**
     * HR Operations
     */
    async getEmployees(orgId: string) {
        if (isOnline()) {
            try {
                const { getEmployees } = await import('@/app/actions-hr');
                return await getEmployees(orgId);
            } catch (error) {
                console.error("REPO: getEmployees online failed", error);
            }
        }

        const localItems = await offlineDB.employees.where('organizationId').equals(orgId).toArray();
        return { success: true, data: localItems.map(item => ({ id: item._localId, ...item })) };
    },

    async createEmployee(data: any) {
        if (isOnline()) {
            try {
                const { createEmployee } = await import('@/app/actions-hr');
                return await createEmployee(data);
            } catch (error) {
                console.error("REPO: createEmployee online failed", error);
            }
        }

        const localId = typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2);
        await offlineDB.employees.add({
            ...data,
            _localId: localId,
            _syncStatus: 'pending',
            _timestamp: Date.now()
        });

        await offlineDB.syncQueue.add({
            table: 'employees',
            action: 'create',
            localId,
            data,
            _timestamp: Date.now(),
            _retryCount: 0
        });

        return { success: true, data: { id: localId, ...data }, error: undefined };
    },

    async updateEmployee(id: string, data: any) {
        if (isOnline()) {
            try {
                const { updateEmployee } = await import('@/app/actions-hr');
                return await updateEmployee(id, data);
            } catch (error) {
                console.error("REPO: updateEmployee online failed", error);
            }
        }

        await offlineDB.employees.where('_localId').equals(id).modify({
            ...data,
            _syncStatus: 'pending',
            _timestamp: Date.now()
        });

        await offlineDB.syncQueue.add({
            table: 'employees',
            action: 'update',
            localId: id,
            data,
            _timestamp: Date.now(),
            _retryCount: 0
        });

        return { success: true, error: undefined };
    },

    async clockIn(pin: string, orgId: string, ip: string) {
        if (isOnline()) {
            try {
                const { clockIn } = await import('@/app/actions-hr');
                return await clockIn(pin, orgId, ip);
            } catch (error) {
                console.error("REPO: clockIn online failed", error);
            }
        }

        // Find employee by PIN offline
        const employee = await offlineDB.employees.where('pinCode').equals(pin).and(e => e.organizationId === orgId).first();
        if (!employee) return { success: false, error: "Code PIN incorrect ou employé introuvable" };

        const localId = typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2);
        const attendanceData = {
            employeeId: employee._localId,
            date: new Date().toISOString().split('T')[0],
            status: 'PRESENT',
            clockIn: new Date().toISOString(),
            organizationId: orgId
        };

        await offlineDB.attendances.add({
            ...attendanceData,
            _localId: localId,
            _syncStatus: 'pending',
            _timestamp: Date.now()
        });

        await offlineDB.syncQueue.add({
            table: 'attendances',
            action: 'create',
            localId,
            data: attendanceData,
            _timestamp: Date.now(),
            _retryCount: 0
        });

        return { success: true, offline: true, data: attendanceData, error: undefined };
    },

    async clockOut(pin: string, orgId: string) {
        if (isOnline()) {
            try {
                const { clockOut } = await import('@/app/actions-hr');
                return await clockOut(pin, orgId);
            } catch (error) {
                console.error("REPO: clockOut online failed", error);
            }
        }

        const employee = await offlineDB.employees.where('pinCode').equals(pin).and(e => e.organizationId === orgId).first();
        if (!employee) return { success: false, error: "Code PIN incorrect" };

        const today = new Date().toISOString().split('T')[0];
        const lastAttendance = await offlineDB.attendances
            .where('employeeId').equals(employee._localId)
            .and(a => a.date === today && !a.clockOut)
            .first();

        if (!lastAttendance) return { success: false, error: "Aucun pointage d'entrée trouvé pour aujourd'hui" };

        const clockOutTime = new Date().toISOString();
        await offlineDB.attendances.where('_localId').equals(lastAttendance._localId).modify({
            clockOut: clockOutTime,
            _syncStatus: 'pending',
            _timestamp: Date.now()
        });

        await offlineDB.syncQueue.add({
            table: 'attendances',
            action: 'update',
            localId: lastAttendance._localId,
            data: { clockOut: clockOutTime },
            _timestamp: Date.now(),
            _retryCount: 0
        });

        return { success: true, offline: true, error: undefined };
    },

    async generatePayroll(employeeId: string, month: string) {
        if (isOnline()) {
            try {
                const { generatePayroll } = await import('@/app/actions-hr');
                return await generatePayroll(employeeId, month);
            } catch (error) {
                console.error("REPO: generatePayroll online failed", error);
            }
        }
        return { success: false, error: "Payroll generation requires online connection" };
    },

    async savePayroll(data: any) {
        if (isOnline()) {
            try {
                const { savePayroll } = await import('@/app/actions-hr');
                return await savePayroll(data);
            } catch (error) {
                console.error("REPO: savePayroll online failed", error);
            }
        }
        return { success: false, error: "Payroll saving requires online connection" };
    },

    async getHROverview(orgId: string) {
        if (isOnline()) {
            try {
                const { getHROverview } = await import('@/app/actions-hr');
                return await getHROverview(orgId);
            } catch (error) {
                console.error("REPO: getHROverview online failed", error);
            }
        }
        return { success: false, error: "Vue d'ensemble RH nécessite une connexion" };
    },

    async getAttendanceHistory(employeeId: string, month: string) {
        if (isOnline()) {
            try {
                const { getAttendanceHistory } = await import('@/app/actions-hr');
                return await getAttendanceHistory(employeeId, month);
            } catch (error) {
                console.error("REPO: getAttendanceHistory online failed", error);
            }
        }
        return { success: true, data: [] }; // Offline attendance history not yet in Dexie
    },

    async setAttendanceManual(data: { employeeId: string, organizationId: string, date: string, status: string }) {
        if (isOnline()) {
            try {
                const { setAttendanceManual } = await import('@/app/actions-hr');
                return await setAttendanceManual(data);
            } catch (error) {
                console.error("REPO: setAttendanceManual online failed", error);
            }
        }

        const localId = typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2);
        await offlineDB.attendances.add({
            ...data,
            _localId: localId,
            _syncStatus: 'pending',
            _timestamp: Date.now()
        } as any);

        await offlineDB.syncQueue.add({
            table: 'attendances',
            action: 'create',
            localId,
            data,
            _timestamp: Date.now(),
            _retryCount: 0
        });

        return { success: true, offline: true, error: undefined };
    },

    async requestAdvance(data: any) {
        if (isOnline()) {
            try {
                const { requestAdvance } = await import('@/app/actions-hr');
                return await requestAdvance(data);
            } catch (error) {
                console.error("REPO: requestAdvance online failed", error);
            }
        }

        const localId = typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).substring(2);
        const advanceData = {
            ...data,
            status: 'PENDING',
            date: new Date().toISOString()
        };

        await offlineDB.salaryAdvances.add({
            ...advanceData,
            _localId: localId,
            _syncStatus: 'pending',
            _timestamp: Date.now()
        });

        await offlineDB.syncQueue.add({
            table: 'salaryAdvances',
            action: 'create',
            localId,
            data: advanceData,
            _timestamp: Date.now(),
            _retryCount: 0
        });

        return { success: true, offline: true, error: undefined };
    },

    /**
     * User/Auth Operations
     */
    async getUsers(organizationId: string) {
        if (isOnline()) {
            try {
                const { getUsers } = await import('@/app/actions-users');
                return await getUsers(organizationId);
            } catch (error) {
                console.error("REPO: getUsers online failed", error);
            }
        }

        const localItems = await offlineDB.users.where('organizationId').equals(organizationId).toArray();
        return { success: true, data: localItems.map(item => ({ id: item._localId, ...item })) };
    },

    async getRoles(organizationId: string) {
        if (isOnline()) {
            try {
                const { getRoles } = await import('@/app/actions-users');
                return await getRoles(organizationId);
            } catch (error) {
                console.error("REPO: getRoles online failed", error);
            }
        }

        const localItems = await offlineDB.roles.where('organizationId').equals(organizationId).toArray();
        return { success: true, data: localItems.map(item => ({ id: item._localId, ...item })) };
    },

    async createUser(data: any) {
        if (isOnline()) {
            try {
                const { createUser } = await import('@/app/actions-users');
                return await createUser(data);
            } catch (error) {
                console.error("REPO: createUser online failed", error);
            }
        }
        return { success: false, error: "Création d'utilisateur nécessite une connexion" };
    },

    async updateUser(id: string, data: any) {
        if (isOnline()) {
            try {
                const { updateUser } = await import('@/app/actions-users');
                return await updateUser(id, data);
            } catch (error) {
                console.error("REPO: updateUser online failed", error);
            }
        }
        return { success: false, error: "Mise à jour d'utilisateur nécessite une connexion" };
    },

    async deleteUser(id: string) {
        if (isOnline()) {
            try {
                const { deleteUser } = await import('@/app/actions-users');
                return await deleteUser(id);
            } catch (error) {
                console.error("REPO: deleteUser online failed", error);
            }
        }
        return { success: false, error: "Suppression d'utilisateur nécessite une connexion" };
    },

    async createRole(data: any) {
        if (isOnline()) {
            try {
                const { createRole } = await import('@/app/actions-users');
                return await createRole(data);
            } catch (error) {
                console.error("REPO: createRole online failed", error);
            }
        }
        return { success: false, error: "Création de rôle nécessite une connexion" };
    },

    async updateRole(id: string, data: any) {
        if (isOnline()) {
            try {
                const { updateRole } = await import('@/app/actions-users');
                return await updateRole(id, data);
            } catch (error) {
                console.error("REPO: updateRole online failed", error);
            }
        }
        return { success: false, error: "Mise à jour de rôle nécessite une connexion" };
    },

    async deleteRole(id: string) {
        if (isOnline()) {
            try {
                const { deleteRole } = await import('@/app/actions-users');
                return await deleteRole(id);
            } catch (error) {
                console.error("REPO: deleteRole online failed", error);
            }
        }
        return { success: false, error: "Suppression de rôle nécessite une connexion" };
    },

    async getPermissions() {
        if (isOnline()) {
            try {
                const { getPermissions } = await import('@/app/actions-users');
                return await getPermissions();
            } catch (error) {
                console.error("REPO: getPermissions online failed", error);
            }
        }
        return { success: false, error: "Récupération des permissions nécessite une connexion" };
    },

    async assignPermissionsToRole(roleId: string, permissions: string[]) {
        if (isOnline()) {
            try {
                const { assignPermissionsToRole } = await import('@/app/actions-users');
                return await assignPermissionsToRole(roleId, permissions);
            } catch (error) {
                console.error("REPO: assignPermissionsToRole online failed", error);
            }
        }
        return { success: false, error: "Attribution des permissions nécessite une connexion" };
    },

    /**
     * Utilities
     */
    async canOperate() {
        const licenseCheck = await offlineDB.isLicenseValid();
        return { allowed: licenseCheck.valid, message: licenseCheck.error };
    },

    async createProductUnit(data: any) {
        if (isOnline()) {
            try {
                return await actions.createProductUnit(data);
            } catch (error) {
                console.error("REPO: createProductUnit online failed", error);
            }
        }
        return { success: false, offline: true, error: "Mode hors ligne : opération non supportée" };
    },

    async deleteProductUnit(id: string) {
        if (isOnline()) {
            try {
                return await actions.deleteProductUnit(id);
            } catch (error) {
                console.error("REPO: deleteProductUnit online failed", error);
            }
        }
        return { success: false, offline: true, error: "Mode hors ligne : opération non supportée" };
    },

    async printJob(content: string, printerName: string) {
        if (typeof window !== 'undefined' && (window as any).electronAPI) {
            try {
                return await (window as any).electronAPI.printJob(content, printerName);
            } catch (e) {
                console.error("Electron printJob failed:", e);
                return { success: false, error: "Electron Print Failed" };
            }
        }

        if (isOnline()) {
            try {
                return await actions.printJob(content, printerName);
            } catch (error) {
                console.error("REPO: printJob online failed", error);
            }
        }
        return { success: false, offline: true, error: "Mode hors ligne : impression non supportée" };
    },

    /**
     * Specialized Actions
     */
    async updateOrganization(id: string, data: any) {
        if (isOnline()) return await actions.updateOrganization(id, data);
        return { success: false, error: "Settings update requires online connection" };
    },

    async getPrinters() {
        if (isOnline()) return await actions.getPrinters();
        return { success: true, printers: [] };
    },

    async createZReport(data: any) {
        if (isOnline()) {
            try {
                return await actions.createZReport(data);
            } catch (error) {
                console.error("REPO: createZReport online failed", error);
            }
        }
        return { success: false, error: "Z-Report requires online connection" };
    },

    async transferFunds(data: any) {
        if (isOnline()) return await actions.transferFunds(data);
        return { success: false, error: "Transfer requires online connection" };
    },

    async createAccount(data: any) {
        if (isOnline()) return await actions.createAccount(data);
        return { success: false, error: "Account creation requires online connection" };
    },

    async createRecurringExpense(data: any) {
        if (isOnline()) return await actions.createRecurringExpense(data);
        return { success: true, offline: true };
    },

    async deleteRecurringExpense(id: string) {
        if (isOnline()) return await actions.deleteRecurringExpense(id);
        return { success: true };
    },

    async payExpense(expenseId: string, accountId: string, orgId: string) {
        if (isOnline()) {
            try {
                return await actions.payExpense(expenseId, accountId, orgId);
            } catch (error) {
                console.error("REPO: payExpense online failed", error);
            }
        }
        return { success: false, offline: true, error: "Mode hors ligne : paiement non supporté" };
    },

    async getServerIP() {
        if (isOnline()) {
            try {
                const res = await fetch('/api/ip');
                const data = await res.json();
                return data.ip;
            } catch (e) {
                return "localhost";
            }
        }
        return "localhost";
    }
};
