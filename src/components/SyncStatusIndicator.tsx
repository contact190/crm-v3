/**
 * Sync Status Indicator Component
 * Displays connection status, pending sync count, and provides manual sync trigger
 */

import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff, RefreshCw, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';
import { connectionMonitor } from '@/lib/offline/connection-monitor';
import { syncManager } from '@/lib/offline/sync-manager';

interface SyncStatus {
    isOnline: boolean;
    isSyncing: boolean;
    pendingCount: number;
    lastSync?: Date;
    lastSyncStatus?: string;
}

export function SyncStatusIndicator() {
    const [status, setStatus] = useState<SyncStatus>({
        isOnline: true,
        isSyncing: false,
        pendingCount: 0
    });

    const [showDetails, setShowDetails] = useState(false);

    useEffect(() => {
        // Initial status
        updateStatus();

        // Listen to connection changes
        const unsubscribe = connectionMonitor.on((isOnline) => {
            updateStatus();
        });

        // Periodic status update (every 10 seconds)
        const interval = setInterval(updateStatus, 10000);

        return () => {
            unsubscribe();
            clearInterval(interval);
        };
    }, []);

    const updateStatus = async () => {
        const syncStatus = await syncManager.getStatus();
        setStatus({
            isOnline: connectionMonitor.isOnline(),
            isSyncing: syncStatus.isSyncing,
            pendingCount: syncStatus.pendingCount,
            lastSync: syncStatus.lastSync,
            lastSyncStatus: syncStatus.lastSyncStatus
        });
    };

    const handleManualSync = async () => {
        if (!status.isOnline || status.isSyncing) return;

        try {
            await syncManager.forceSyncNow();
            await updateStatus();
        } catch (error) {
            console.error('Manual sync failed:', error);
        }
    };

    const getStatusColor = () => {
        if (!status.isOnline) return 'text-red-500';
        if (status.isSyncing) return 'text-yellow-500';
        if (status.pendingCount > 0) return 'text-orange-500';
        return 'text-green-500';
    };

    const getStatusIcon = () => {
        if (!status.isOnline) return <WifiOff className="w-5 h-5" />;
        if (status.isSyncing) return <Loader2 className="w-5 h-5 animate-spin" />;
        if (status.pendingCount > 0) return <AlertCircle className="w-5 h-5" />;
        return <CheckCircle className="w-5 h-5" />;
    };

    const getStatusText = () => {
        if (!status.isOnline) return 'Hors ligne';
        if (status.isSyncing) return 'Synchronisation...';
        if (status.pendingCount > 0) return `${status.pendingCount} en attente`;
        return 'Synchronisé';
    };

    const formatLastSync = () => {
        if (!status.lastSync) return 'Jamais';

        const now = new Date();
        const diff = now.getTime() - status.lastSync.getTime();
        const minutes = Math.floor(diff / 60000);

        if (minutes < 1) return 'À l\'instant';
        if (minutes < 60) return `Il y a ${minutes} min`;

        const hours = Math.floor(minutes / 60);
        if (hours < 24) return `Il y a ${hours}h`;

        return status.lastSync.toLocaleDateString('fr-FR');
    };

    return (
        <div className="relative">
            <button
                onClick={() => setShowDetails(!showDetails)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg border transition-all hover:bg-gray-50 bg-white"
                style={{ borderColor: 'var(--border)' }}
                title="État de synchronisation"
            >
                {/* Status Dot */}
                <div
                    style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        background: !status.isOnline ? 'var(--danger)' :
                            status.isSyncing ? 'var(--warning)' :
                                status.pendingCount > 0 ? 'var(--warning)' :
                                    'var(--success)',
                        boxShadow: `0 0 5px ${!status.isOnline ? 'var(--danger)' :
                            status.isSyncing ? 'var(--warning)' :
                                status.pendingCount > 0 ? 'var(--warning)' :
                                    'var(--success)'}`
                    }}
                />

                {getStatusIcon()}
                <span className="text-sm font-medium" style={{ color: 'var(--primary-dark)' }}>{getStatusText()}</span>
                {status.pendingCount > 0 && (
                    <span className="bg-orange-500 text-white text-xs px-2 py-0.5 rounded-full">
                        {status.pendingCount}
                    </span>
                )}
            </button>

            {showDetails && (
                <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 p-4 z-50">
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="font-semibold text-gray-900">État de synchronisation</h3>
                            <button
                                onClick={() => setShowDetails(false)}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="space-y-2 text-sm">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Connexion:</span>
                                <span className={`flex items-center gap-1 font-medium ${status.isOnline ? 'text-green-600' : 'text-red-600'}`}>
                                    {status.isOnline ? <Wifi className="w-4 h-4" /> : <WifiOff className="w-4 h-4" />}
                                    {status.isOnline ? 'En ligne' : 'Hors ligne'}
                                </span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">En attente:</span>
                                <span className="font-medium text-gray-900">{status.pendingCount} élément(s)</span>
                            </div>

                            <div className="flex items-center justify-between">
                                <span className="text-gray-600">Dernière sync:</span>
                                <span className="font-medium text-gray-900">{formatLastSync()}</span>
                            </div>

                            {status.lastSyncStatus && (
                                <div className="flex items-center justify-between">
                                    <span className="text-gray-600">Statut:</span>
                                    <span className={`font-medium ${status.lastSyncStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>
                                        {status.lastSyncStatus === 'success' ? 'Réussi' : 'Échoué'}
                                    </span>
                                </div>
                            )}
                        </div>

                        <button
                            onClick={handleManualSync}
                            disabled={!status.isOnline || status.isSyncing}
                            className={`w-full flex items-center justify-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors ${!status.isOnline || status.isSyncing
                                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-500 text-white hover:bg-blue-600'
                                }`}
                        >
                            <RefreshCw className={`w-4 h-4 ${status.isSyncing ? 'animate-spin' : ''}`} />
                            {status.isSyncing ? 'Synchronisation...' : 'Synchroniser maintenant'}
                        </button>

                        {!status.isOnline && (
                            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-xs text-yellow-800">
                                <strong>Mode hors ligne:</strong> Vos modifications sont enregistrées localement et seront synchronisées automatiquement lors de la reconnexion.
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
