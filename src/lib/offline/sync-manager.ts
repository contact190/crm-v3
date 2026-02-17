/**
 * Sync Manager
 * Orchestrates synchronization between local IndexedDB and cloud PostgreSQL
 */

import { offlineDB, SyncQueueItem } from './db';
import { connectionMonitor } from './connection-monitor';
import { localSyncService } from './local-sync-service';

const SYNC_TOKEN_KEY = 'ideal_gestion_sync_token';

class SyncManager {
    private isSyncing = false;
    private syncInterval: NodeJS.Timeout | null = null;

    constructor() {
        this.init();
    }

    private init() {
        // Auto-sync when connection is restored
        connectionMonitor.on((status) => {
            if (status === 'online' && !this.isSyncing) {
                console.log('🔄 Connection restored, starting sync...');
                this.sync().catch(console.error);
            }
        });

        // Listen for changes from other local terminals
        if (typeof window !== 'undefined') {
            window.addEventListener('local-sync-detected', (event: any) => {
                const change = event.detail;
                console.log('📡 Local network change detected, triggering sync...', change);
                // We could just trigger a pullFromServer, but full sync is safer
                this.sync().catch(console.error);
            });
        }

        // Periodic sync every 5 minutes (if online)
        this.syncInterval = setInterval(() => {
            if (connectionMonitor.isOnline() && !this.isSyncing) {
                this.sync().catch(console.error);
            }
        }, 5 * 60 * 1000) as any;

        // Hook into syncQueue to broadcast local changes to the network
        offlineDB.syncQueue.hook('creating', (primaryKey, obj) => {
            this.handleLocalChange(obj);
        });
    }

    /**
     * Broadcast local change to the local network
     */
    private async handleLocalChange(item: SyncQueueItem) {
        try {
            // Get current organization
            const license = await offlineDB.license.toCollection().first();
            if (license?.organizationId) {
                localSyncService.broadcastChange(
                    license.organizationId,
                    item.table,
                    item.localId,
                    item.action
                );
            }
        } catch (error) {
            console.error('Failed to broadcast local change:', error);
        }
    }

    /**
     * Retry helper with exponential backoff
     */
    private async retryWithBackoff<T>(
        operation: () => Promise<T>,
        maxRetries: number = 3,
        baseDelay: number = 1000
    ): Promise<T> {
        let lastError: any;

        for (let attempt = 0; attempt <= maxRetries; attempt++) {
            try {
                return await operation();
            } catch (error) {
                lastError = error;

                if (attempt < maxRetries) {
                    const delay = baseDelay * Math.pow(2, attempt);
                    console.log(`⏳ Retry attempt ${attempt + 1}/${maxRetries} after ${delay}ms`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    console.error(`❌ All ${maxRetries + 1} attempts failed`);
                }
            }
        }

        throw lastError;
    }

    /**
     * Main sync function
     */
    public async sync(): Promise<{ success: boolean; itemsSynced: number; error?: string }> {
        if (this.isSyncing) {
            console.log('⏳ Sync already in progress, skipping...');
            return { success: false, itemsSynced: 0, error: 'Sync already in progress' };
        }

        if (!connectionMonitor.isOnline()) {
            console.log('📵 Offline, skipping sync');
            return { success: false, itemsSynced: 0, error: 'Offline' };
        }

        this.isSyncing = true;
        let itemsSynced = 0;

        try {
            console.log('🔄 Starting sync...');

            // 1. Pull changes from server (with retry)
            await this.retryWithBackoff(() => this.pullFromServer());

            // 2. Push local changes to server (with retry)
            const pushResult = await this.retryWithBackoff(() => this.pushToServer());
            itemsSynced = pushResult.count;

            // 3. Update license info
            await this.updateLicense();

            // 4. Log success
            await offlineDB.syncLog.add({
                timestamp: Date.now(),
                status: 'success',
                itemsSynced
            });

            console.log(`✅ Sync completed: ${itemsSynced} items synced`);
            return { success: true, itemsSynced };

        } catch (error: any) {
            console.error('❌ Sync failed:', error);

            // Log failure
            await offlineDB.syncLog.add({
                timestamp: Date.now(),
                status: 'failed',
                itemsSynced,
                error: error.message
            });

            return { success: false, itemsSynced, error: error.message };
        } finally {
            this.isSyncing = false;
        }
    }

    /**
     * Get the base URL for sync (prioritizes Cloud API, fallback to local)
     */
    private async getSyncUrl(path: string): Promise<string> {
        // 1. Check for Cloud API URL from Environment
        const cloudApiUrl = process.env.NEXT_PUBLIC_API_URL;
        if (cloudApiUrl) {
            return `${cloudApiUrl.replace(/\/$/, '')}${path}`;
        }

        // 2. In local network mode, we might want to sync with a main terminal IP
        const localMasterIp = typeof window !== 'undefined' ? localStorage.getItem('local_master_ip') : null;
        if (localMasterIp && typeof window !== 'undefined' && !window.location.hostname.includes(localMasterIp)) {
            return `http://${localMasterIp}${path}`;
        }

        // 3. Fallback to relative path (same-origin)
        return path;
    }

    /**
     * Pull changes from server
     */
    private async pullFromServer(): Promise<void> {
        try {
            const license = await offlineDB.license.toCollection().first();
            const lastSync = license?.lastSync || new Date(0).toISOString();

            const syncUrl = await this.getSyncUrl('/api/sync/pull');
            const token = typeof window !== 'undefined' ? localStorage.getItem(SYNC_TOKEN_KEY) : null;

            const response = await fetch(syncUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                credentials: 'same-origin',
                body: JSON.stringify({ lastSync })
            });

            if (response.status === 401) {
                console.info('🔄 Sync: Skip pull (User not logged in)');
                return;
            }

            if (!response.ok) {
                throw new Error(`Pull failed: ${response.statusText}`);
            }

            const data = await response.json();

            /**
             * Conflict-aware bulk update with Last-Write-Wins (LWW) strategy
             * Only updates local entity if server version is newer
             */
            const bulkUpdateWithConflictResolution = async (table: any, serverEntities: any[]) => {
                if (!serverEntities?.length) return;

                for (const serverEntity of serverEntities) {
                    try {
                        // Get existing local entity
                        const localEntity = await table.get(serverEntity._localId);

                        // If no local entity exists, insert server data
                        if (!localEntity) {
                            await table.put({
                                ...serverEntity,
                                _syncStatus: 'synced',
                                _timestamp: Date.now()
                            });
                            continue;
                        }

                        // Compare timestamps for conflict resolution (Last-Write-Wins)
                        const serverTime = new Date(serverEntity.updatedAt).getTime();
                        const localTime = new Date(localEntity.updatedAt || 0).getTime();

                        // Only update if server data is newer OR if local is already synced
                        if (serverTime >= localTime || localEntity._syncStatus === 'synced') {
                            await table.put({
                                ...serverEntity,
                                units: serverEntity.units,
                                warehouseStock: serverEntity.warehouseStock,
                                image: serverEntity.image,
                                lastCost: serverEntity.lastCost,
                                category: serverEntity.category,
                                _syncStatus: 'synced',
                                _timestamp: Date.now()
                            });
                        } else {
                            // Local changes are newer - keep them
                            console.log(`⚠️ Conflict: Keeping newer local version for ${table.name} ${serverEntity._localId}`);
                        }
                    } catch (error) {
                        console.error(`Error updating ${table.name}:`, error);
                    }
                }
            };

            // Update all entity types
            await bulkUpdateWithConflictResolution(offlineDB.products, data.products);
            await bulkUpdateWithConflictResolution(offlineDB.clients, data.clients);
            await bulkUpdateWithConflictResolution(offlineDB.warehouses, data.warehouses);
            await bulkUpdateWithConflictResolution(offlineDB.categories, data.categories);
            await bulkUpdateWithConflictResolution(offlineDB.suppliers, data.suppliers);
            await bulkUpdateWithConflictResolution(offlineDB.accounts, data.accounts);
            await bulkUpdateWithConflictResolution(offlineDB.employees, data.employees);
            await bulkUpdateWithConflictResolution(offlineDB.roles, data.roles);
            await bulkUpdateWithConflictResolution(offlineDB.permissions, data.permissions);
            await bulkUpdateWithConflictResolution(offlineDB.users, data.users);
            await bulkUpdateWithConflictResolution(offlineDB.transactions, data.transactions);
            await bulkUpdateWithConflictResolution(offlineDB.movements, data.movements);
            await bulkUpdateWithConflictResolution(offlineDB.expenses, data.expenses);
            await bulkUpdateWithConflictResolution(offlineDB.attendances, data.attendances);
            await bulkUpdateWithConflictResolution(offlineDB.salaryAdvances, data.salaryAdvances);
            await bulkUpdateWithConflictResolution(offlineDB.payrolls, data.payrolls);

            console.log(`📥 Pulled: ${data.products?.length || 0} products, ${data.transactions?.length || 0} transactions, ${data.movements?.length || 0} movements`);
        } catch (error) {
            console.error('❌ Pull error:', error);
            throw error;
        }
    }

    /**
     * Push local changes to server
     */
    private async pushToServer(): Promise<{ count: number }> {
        try {
            // Get all pending items from sync queue
            const queueItems = await offlineDB.syncQueue
                .orderBy('_timestamp')
                .limit(100) // Batch size
                .toArray();

            if (queueItems.length === 0) {
                console.log('📤 No pending changes to push');
                return { count: 0 };
            }

            // Group by table
            const grouped = queueItems.reduce((acc, item) => {
                if (!acc[item.table]) acc[item.table] = [];
                acc[item.table].push(item);
                return acc;
            }, {} as Record<string, SyncQueueItem[]>);

            // Push to server
            const syncUrl = await this.getSyncUrl('/api/sync/push');
            const token = typeof window !== 'undefined' ? localStorage.getItem(SYNC_TOKEN_KEY) : null;

            const response = await fetch(syncUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                credentials: 'same-origin',
                body: JSON.stringify({ changes: grouped })
            });

            if (response.status === 401) {
                console.info('🔄 Sync: Skip push (User not logged in)');
                return { count: 0 };
            }

            if (!response.ok) {
                throw new Error(`Push failed: ${response.statusText}`);
            }

            const result = await response.json();

            // Remove synced items from queue
            const syncedIds = queueItems.map(item => item.id!);
            await offlineDB.syncQueue.bulkDelete(syncedIds);

            // Update sync status in main tables for all entity types
            const tableMap: Record<string, any> = {
                'products': offlineDB.products,
                'clients': offlineDB.clients,
                'warehouses': offlineDB.warehouses,
                'categories': offlineDB.categories,
                'suppliers': offlineDB.suppliers,
                'accounts': offlineDB.accounts,
                'transactions': offlineDB.transactions,
                'employees': offlineDB.employees,
                'attendances': offlineDB.attendances,
                'salaryAdvances': offlineDB.salaryAdvances,
                'payrolls': offlineDB.payrolls,
                'roles': offlineDB.roles,
                'movements': offlineDB.movements,
                'expenses': offlineDB.expenses
            };

            for (const item of queueItems) {
                const table = tableMap[item.table];
                if (table) {
                    await table
                        .where('_localId').equals(item.localId)
                        .modify({ _syncStatus: 'synced' });
                }
            }

            console.log(`📤 Pushed ${queueItems.length} changes to server`);
            return { count: queueItems.length };

        } catch (error) {
            console.error('❌ Push error:', error);
            throw error;
        }
    }

    /**
     * Update license information from server
     */
    private async updateLicense(): Promise<void> {
        try {
            const syncUrl = await this.getSyncUrl('/api/sync/license');
            const token = typeof window !== 'undefined' ? localStorage.getItem(SYNC_TOKEN_KEY) : null;

            const response = await fetch(syncUrl, {
                credentials: 'same-origin',
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                }
            });

            if (response.status === 401) {
                return; // Silent skip for license too
            }

            if (!response.ok) {
                throw new Error(`License check failed: ${response.statusText}`);
            }

            const licenseData = await response.json();

            await offlineDB.license.clear();
            await offlineDB.license.add({
                organizationId: licenseData.organizationId,
                licenseType: licenseData.licenseType,
                licenseEnd: licenseData.licenseEnd,
                lastSync: new Date().toISOString(),
                gracePeriodDays: 14, // Configured grace period
                killSwitch: licenseData.killSwitch || false,
                productLimit: licenseData.productLimit || 100,
                employeeLimit: licenseData.employeeLimit || 10,
                userLimit: licenseData.userLimit || 5,
                posLimit: licenseData.posLimit || 2,
                _timestamp: Date.now()
            });

            console.log('📜 License updated');
        } catch (error) {
            console.error('License update error:', error);
            // Non-critical, don't throw
        }
    }

    /**
     * Get sync status
     */
    public async getStatus(): Promise<{
        isSyncing: boolean;
        pendingCount: number;
        lastSync?: Date;
        lastSyncStatus?: string;
        isLocalConnected?: boolean;
    }> {
        const pendingCount = await offlineDB.getPendingSyncCount();
        const lastLog = await offlineDB.syncLog
            .orderBy('timestamp')
            .reverse()
            .first();

        return {
            isSyncing: this.isSyncing,
            pendingCount,
            lastSync: lastLog ? new Date(lastLog.timestamp) : undefined,
            lastSyncStatus: lastLog?.status,
            isLocalConnected: localSyncService.isConnected()
        };
    }

    /**
     * Force sync now
     */
    public async forceSyncNow(): Promise<void> {
        await this.sync();
    }

    /**
     * Cleanup
     */
    public destroy() {
        if (this.syncInterval) {
            clearInterval(this.syncInterval);
        }
    }
}

// Singleton instance
export const syncManager = new SyncManager();
