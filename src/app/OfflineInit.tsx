/**
 * Client-side initialization script
 * Registers Service Worker and initializes offline system
 */
'use client';

import { useEffect } from 'react';
import { registerServiceWorker } from '@/lib/offline/register-sw';
import { syncManager } from '@/lib/offline/sync-manager';
import { connectionMonitor } from '@/lib/offline/connection-monitor';

export function OfflineInit() {
    useEffect(() => {
        // Register Service Worker
        registerServiceWorker().catch(console.error);

        // Log connection status changes
        const unsubscribe = connectionMonitor.on((status) => {
            console.log(`📡 Connection: ${status}`);
        });

        // Initial sync if online
        const initSync = async () => {
            const { checkServerStatus } = await import('./actions');
            const status = await checkServerStatus();
            if (status.success) {
                syncManager.forceSyncNow().catch(console.error);
            }
        };
        initSync();

        return () => {
            unsubscribe();
        };
    }, []);

    return null; // This component doesn't render anything
}
