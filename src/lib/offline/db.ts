/**
 * IndexedDB Schema for Offline-First Architecture
 * Uses Dexie.js for ACID transactions and easy querying
 * 
 * Storage: 30 days of data
 * Grace Period: 14 days offline max
 */

import Dexie, { Table } from 'dexie';

// ==================== TYPES ====================

export interface OfflineProduct {
    id?: number;
    _localId: string;
    barcode: string;
    name: string;
    price: number;
    stock: number;
    category?: string;
    warehouseStock?: any[];
    units?: any[];
    image?: string;
    lastCost?: number;
    organizationId: string;
    _syncStatus: 'pending' | 'synced' | 'conflict';
    _timestamp: number;
    _deletedAt?: number; // Soft delete
}

export interface OfflineTransaction {
    id?: number;
    _localId: string;
    total: number;
    paymentMethod: string;
    items: TransactionItem[];
    userId: string;
    organizationId: string;
    createdAt: string;
    _syncStatus: 'pending' | 'synced' | 'conflict';
    _timestamp: number;
}

export interface TransactionItem {
    productId: string;
    quantity: number;
    price: number;
    name: string;
}

export interface OfflineUser {
    id?: number;
    _localId: string;
    username: string;
    email: string;
    name: string;
    password: string; // Hashed (bcrypt)
    pinCode?: string;
    roleId?: string;
    organizationId: string;
    _syncStatus: 'pending' | 'synced' | 'conflict';
    _timestamp: number;
}

export interface OfflineClient {
    id?: number;
    _localId: string;
    name: string;
    type?: string;
    phone?: string;
    email?: string;
    address?: string;
    totalDebt: number;
    organizationId: string;
    _syncStatus: 'pending' | 'synced' | 'conflict';
    _timestamp: number;
    _deletedAt?: number;
}


export interface OfflineWarehouse {
    id?: number;
    _localId: string;
    name: string;
    address?: string;
    organizationId: string;
    _syncStatus: 'pending' | 'synced' | 'conflict';
    _timestamp: number;
}

export interface OfflineCategory {
    id?: number;
    _localId: string;
    name: string;
    parentId?: string;
    organizationId: string;
    _syncStatus: 'pending' | 'synced' | 'conflict';
    _timestamp: number;
}

export interface OfflineSupplier {
    id?: number;
    _localId: string;
    name: string;
    contactName?: string;
    phone?: string;
    email?: string;
    address?: string;
    totalDebt: number;
    organizationId: string;
    _syncStatus: 'pending' | 'synced' | 'conflict';
    _timestamp: number;
}

export interface OfflineMovement {
    id?: number;
    _localId: string;
    productId: string;
    warehouseId: string;
    type: 'IN' | 'OUT' | 'ADJUST' | 'TRANSFER';
    quantity: number;
    unitId?: string;
    reason?: string;
    organizationId: string;
    createdAt: string;
    _syncStatus: 'pending' | 'synced' | 'conflict';
    _timestamp: number;
}

export interface OfflineAccount {
    id?: number;
    _localId: string;
    name: string;
    balance: number;
    organizationId: string;
    _syncStatus: 'pending' | 'synced' | 'conflict';
    _timestamp: number;
}

export interface OfflineLicense {
    id?: number;
    organizationId: string;
    licenseType: string;
    licenseEnd: string; // ISO date
    lastSync: string; // ISO date
    gracePeriodDays: number; // 14 days
    killSwitch: boolean;
    productLimit: number;
    employeeLimit: number;
    userLimit: number;
    posLimit: number;
    _timestamp: number;
}

export interface OfflineExpense {
    id?: number;
    _localId: string;
    amount: number;
    label: string;
    category?: string;
    date: string;
    accountId?: string;
    organizationId: string;
    _syncStatus: 'pending' | 'synced' | 'conflict';
    _timestamp: number;
}

export interface OfflineEmployee {
    id?: number;
    _localId: string;
    name: string;
    phone?: string;
    email?: string;
    role: string;
    contractType: string;
    isActive: boolean;
    baseSalary: number;
    commissionPct: number;
    monthlyGoal: number;
    organizationId: string;
    userId?: string;
    _syncStatus: 'pending' | 'synced' | 'conflict';
    _timestamp: number;
}

export interface OfflineAttendance {
    id?: number;
    _localId: string;
    employeeId: string;
    date: string;
    status: string;
    clockIn: string;
    clockOut?: string;
    organizationId: string;
    _syncStatus: 'pending' | 'synced' | 'conflict';
    _timestamp: number;
}

export interface OfflineSalaryAdvance {
    id?: number;
    _localId: string;
    employeeId: string;
    amount: number;
    status: string;
    date: string;
    organizationId: string;
    _syncStatus: 'pending' | 'synced' | 'conflict';
    _timestamp: number;
}

export interface OfflinePayroll {
    id?: number;
    _localId: string;
    employeeId: string;
    month: string;
    baseSalary: number;
    netPayable: number;
    status: string;
    organizationId: string;
    _syncStatus: 'pending' | 'synced' | 'conflict';
    _timestamp: number;
}

export interface OfflineRole {
    id?: number;
    _localId: string;
    name: string;
    description?: string;
    permissions?: string[];
    organizationId: string;
    _syncStatus: 'pending' | 'synced' | 'conflict';
    _timestamp: number;
}

export interface OfflinePermission {
    id?: number;
    _localId: string;
    slug: string;
    description?: string;
    _syncStatus: 'synced';
}

export interface SyncQueueItem {
    id?: number;
    table: string;
    action: 'create' | 'update' | 'delete';
    localId: string;
    data: any;
    _timestamp: number;
    _retryCount: number;
}

export interface SyncLog {
    id?: number;
    timestamp: number;
    status: 'success' | 'failed' | 'partial';
    itemsSynced: number;
    error?: string;
}

// ==================== DATABASE CLASS ====================

export class OfflineDB extends Dexie {
    products!: Table<OfflineProduct>;
    transactions!: Table<OfflineTransaction>;
    clients!: Table<OfflineClient>;
    users!: Table<OfflineUser>;
    warehouses!: Table<OfflineWarehouse>;
    categories!: Table<OfflineCategory>;
    suppliers!: Table<OfflineSupplier>;
    movements!: Table<OfflineMovement>;
    accounts!: Table<OfflineAccount>;
    employees!: Table<OfflineEmployee>;
    attendances!: Table<OfflineAttendance>;
    salaryAdvances!: Table<OfflineSalaryAdvance>;
    payrolls!: Table<OfflinePayroll>;
    roles!: Table<OfflineRole>;
    permissions!: Table<OfflinePermission>;
    expenses!: Table<OfflineExpense>;
    license!: Table<OfflineLicense>;
    syncQueue!: Table<SyncQueueItem>;
    syncLog!: Table<SyncLog>;

    constructor() {
        super('BoutiqueOfflineDB');

        this.version(2).stores({
            // Products: Index on barcode, syncStatus, timestamp for fast queries
            products: '++id, _localId, barcode, organizationId, _syncStatus, _timestamp, _deletedAt',

            // Transactions: Index on date and syncStatus for sync queue
            transactions: '++id, _localId, organizationId, createdAt, _syncStatus, _timestamp',

            // Clients: Index on name and syncStatus
            clients: '++id, _localId, name, organizationId, _syncStatus, _timestamp, _deletedAt',

            // Users: Index on username and email for login
            users: '++id, _localId, username, email, organizationId, _syncStatus, _timestamp',

            // Meta-data tables
            warehouses: '++id, _localId, organizationId, name, _syncStatus',
            categories: '++id, _localId, organizationId, name, parentId, _syncStatus',
            suppliers: '++id, _localId, organizationId, name, _syncStatus',
            movements: '++id, _localId, organizationId, productId, type, createdAt, _syncStatus',
            accounts: '++id, _localId, organizationId, name, _syncStatus',
            expenses: '++id, _localId, organizationId, label, date, _syncStatus',

            // License: One per organization
            license: '++id, organizationId, licenseEnd, lastSync',

            // Sync Queue: FIFO queue for cloud sync
            syncQueue: '++id, table, _timestamp, _retryCount',

            // Sync Log: Audit trail
            // Sync Log: Audit trail
            syncLog: '++id, timestamp, status'
        });

        this.version(3).stores({
            employees: '++id, _localId, organizationId, name, isActive, _syncStatus, _timestamp',
            attendances: '++id, _localId, organizationId, employeeId, date, status, _syncStatus',
            salaryAdvances: '++id, _localId, organizationId, employeeId, status, _syncStatus',
            payrolls: '++id, _localId, organizationId, employeeId, month, status, _syncStatus',
            roles: '++id, _localId, organizationId, name, _syncStatus',
            permissions: '++id, _localId, slug'
        });

        this.version(4).stores({
            license: '++id, organizationId, licenseEnd, lastSync, productLimit, employeeLimit, userLimit, posLimit'
        });
    }

    /**
     * Check if offline grace period has expired
     */
    async isLicenseValid(): Promise<{ valid: boolean; daysLeft?: number; error?: string }> {
        try {
            const license = await this.license.toCollection().first();

            if (!license) {
                return { valid: false, error: 'Aucune licence trouvée. Connectez-vous en ligne.' };
            }

            const now = new Date();
            const lastSync = new Date(license.lastSync);
            const licenseEnd = new Date(license.licenseEnd);

            // Check kill switch
            if (license.killSwitch) {
                return { valid: false, error: 'Accès bloqué par l\'administrateur.' };
            }

            // Check license expiration
            if (now > licenseEnd) {
                return { valid: false, error: 'Licence expirée. Veuillez renouveler votre abonnement.' };
            }

            // Check offline grace period (14 days)
            const daysSinceSync = Math.floor((now.getTime() - lastSync.getTime()) / (1000 * 60 * 60 * 24));
            const daysLeft = license.gracePeriodDays - daysSinceSync;

            if (daysSinceSync > license.gracePeriodDays) {
                return {
                    valid: false,
                    error: `Vous êtes hors ligne depuis ${daysSinceSync} jours. Veuillez vous reconnecter à Internet.`
                };
            }

            return { valid: true, daysLeft };
        } catch (error) {
            console.error('License check error:', error);
            return { valid: false, error: 'Erreur lors de la vérification de la licence.' };
        }
    }

    /**
     * Get pending sync items count
     */
    async getPendingSyncCount(): Promise<number> {
        return await this.syncQueue.count();
    }

    /**
     * Clear old data (> 30 days) to save space
     */
    async cleanOldData(): Promise<void> {
        const thirtyDaysAgo = Date.now() - (30 * 24 * 60 * 60 * 1000);

        // Delete old transactions
        await this.transactions
            .where('_timestamp')
            .below(thirtyDaysAgo)
            .delete();

        // Delete old sync logs
        await this.syncLog
            .where('timestamp')
            .below(thirtyDaysAgo)
            .delete();

        console.log('✅ Old data cleaned (> 30 days)');
    }
}

// ==================== SINGLETON INSTANCE ====================

export const offlineDB = new OfflineDB();

// Auto-cleanup on app start
offlineDB.on('ready', () => {
    offlineDB.cleanOldData().catch(console.error);
});
