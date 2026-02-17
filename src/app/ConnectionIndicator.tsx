/**
 * Connection Status Indicator
 * Shows online/offline status, local sync status, and pending sync count.
 */
'use client';

import { useEffect, useState } from 'react';
import { connectionMonitor } from '@/lib/offline/connection-monitor';
import { syncManager } from '@/lib/offline/sync-manager';
import { Wifi, WifiOff, Cloud, CloudOff, RefreshCw, Network, Loader2, AlertCircle, CheckCircle } from 'lucide-react';

import { SyncLogViewer } from '@/components/SyncLogViewer';

export function ConnectionIndicator() {
    const [isOnline, setIsOnline] = useState(true);
    const [isExpanded, setIsExpanded] = useState(false);
    const [showLogs, setShowLogs] = useState(false);
    const [status, setStatus] = useState<{
        isSyncing: boolean;
        pendingCount: number;
        lastSync?: Date;
        lastSyncStatus?: string;
        isLocalConnected?: boolean;
    }>({ isSyncing: false, pendingCount: 0 });

    const fetchStatus = async () => {
        const s = await syncManager.getStatus();
        setStatus(s);
        setIsOnline(connectionMonitor.isOnline());
    };

    useEffect(() => {
        // Initial status
        fetchStatus();

        // Listen to connection changes
        const unsubscribe = connectionMonitor.on((status) => {
            setIsOnline(status === 'online');
            fetchStatus();
        });

        // Periodic status update (every 5 seconds)
        const interval = setInterval(fetchStatus, 5000);

        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, []);

    const handleManualSync = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (status.isSyncing || !isOnline) return;
        try {
            await syncManager.forceSyncNow();
            await fetchStatus();
        } catch (err) {
            console.error(err);
        }
    };

    // Derived states
    const isCloudConnected = isOnline;
    const isLocalConnected = status.isLocalConnected;
    const isTotallyOffline = !isCloudConnected && !isLocalConnected;
    const hasPending = status.pendingCount > 0;

    // Status colors
    const getBgColor = () => {
        if (isTotallyOffline) return 'bg-red-500/90';
        if (status.isSyncing) return 'bg-blue-500/90';
        if (hasPending) return 'bg-orange-500/90';
        if (isCloudConnected) return 'bg-green-500/90';
        return 'bg-emerald-600/90'; // Local only
    };

    if (showLogs) {
        return <SyncLogViewer onClose={() => setShowLogs(false)} />;
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-2">

            {/* Expanded Details Panel */}
            {isExpanded && (
                <div className="bg-white rounded-lg shadow-xl border border-gray-200 p-4 mb-2 w-72 animate-in fade-in slide-in-from-bottom-4">
                    <div className="flex items-center justify-between mb-3 pb-2 border-b">
                        <h3 className="font-semibold text-gray-800">État de la synchronisation</h3>
                        <button onClick={() => setIsExpanded(false)} className="text-gray-400 hover:text-gray-600">✕</button>
                    </div>

                    <div className="space-y-3 text-sm">
                        {/* Cloud Status */}
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 flex items-center gap-1">
                                <Cloud size={14} /> Cloud (Internet)
                            </span>
                            <span className={`font-medium ${isCloudConnected ? 'text-green-600' : 'text-red-500'}`}>
                                {isCloudConnected ? 'Connecté' : 'Déconnecté'}
                            </span>
                        </div>

                        {/* Local Mesh Status */}
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 flex items-center gap-1">
                                <Network size={14} /> Réseau Local
                            </span>
                            <span className={`font-medium ${isLocalConnected ? 'text-green-600' : 'text-gray-400'}`}>
                                {isLocalConnected ? 'Actif (Mesh)' : 'Inactif'}
                            </span>
                        </div>

                        {/* Pending Items */}
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">En attente d'envoi</span>
                            <span className={`font-bold ${hasPending ? 'text-orange-500' : 'text-gray-400'}`}>
                                {status.pendingCount}
                            </span>
                        </div>

                        {/* Last Sync */}
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600">Dernière synchro</span>
                            <span className="text-gray-800">
                                {status.lastSync ? status.lastSync.toLocaleTimeString() : 'Jamais'}
                            </span>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 mt-4">
                        <button
                            onClick={() => setShowLogs(true)}
                            className="flex items-center justify-center gap-2 px-3 py-2 rounded-md bg-gray-100 text-gray-700 hover:bg-gray-200 text-xs font-medium transition-colors"
                        >
                            Voir l'historique
                        </button>
                        <button
                            onClick={handleManualSync}
                            disabled={status.isSyncing || !isOnline}
                            className={`flex items-center justify-center gap-2 px-3 py-2 rounded-md font-medium text-xs transition-colors
                                ${status.isSyncing || !isOnline
                                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800'
                                }`}
                        >
                            <RefreshCw size={12} className={status.isSyncing ? 'animate-spin' : ''} />
                            {status.isSyncing ? 'Sync...' : 'Forcer Sync'}
                        </button>
                    </div>
                </div>
            )}

            {/* Floating Badge */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className={`flex items-center gap-2 px-3 py-2 rounded-full shadow-lg text-white transition-all transform hover:scale-105 active:scale-95 ${getBgColor()}`}
            >
                {/* Status Icons */}
                {status.isSyncing ? (
                    <Loader2 size={16} className="animate-spin" />
                ) : isTotallyOffline ? (
                    <WifiOff size={16} />
                ) : hasPending ? (
                    <AlertCircle size={16} />
                ) : (
                    <div className="flex gap-1">
                        {isCloudConnected && <Cloud size={16} />}
                        {isLocalConnected && <Network size={16} />}
                        {!isCloudConnected && !isLocalConnected && <Wifi size={16} />} {/* Fallback? Should be caught by isTotallyOffline */}
                    </div>
                )}

                {/* Status Text */}
                <span className="text-sm font-medium pr-1">
                    {status.isSyncing ? 'Sync...' :
                        isTotallyOffline ? 'Hors ligne' :
                            hasPending ? `${status.pendingCount} en attente` :
                                'Synchronisé'}
                </span>

                {/* Pending Badge (Counts) */}
                {status.pendingCount > 0 && (
                    <span className="bg-white/20 text-xs px-1.5 py-0.5 rounded-full font-bold min-w-[20px] text-center">
                        {status.pendingCount}
                    </span>
                )}
            </button>
        </div>
    );
}
