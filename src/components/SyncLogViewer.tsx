/**
 * Sync Log Viewer Component
 * Displays a list of recent synchronization attempts and their status
 */
'use client';

import { useEffect, useState } from 'react';
import { offlineDB, SyncLog } from '@/lib/offline/db';
import { CheckCircle, XCircle, AlertTriangle, Trash2, Clock } from 'lucide-react';

export function SyncLogViewer({ onClose }: { onClose: () => void }) {
    const [logs, setLogs] = useState<SyncLog[]>([]);
    const [loading, setLoading] = useState(true);

    const loadLogs = async () => {
        try {
            const recentLogs = await offlineDB.syncLog
                .orderBy('timestamp')
                .reverse()
                .limit(50)
                .toArray();
            setLogs(recentLogs);
        } catch (error) {
            console.error('Failed to load logs:', error);
        } finally {
            setLoading(false);
        }
    };

    const clearLogs = async () => {
        if (!confirm('Voulez-vous vraiment effacer l\'historique de synchronisation ?')) return;
        await offlineDB.syncLog.clear();
        await loadLogs();
    };

    useEffect(() => {
        loadLogs();
        const interval = setInterval(loadLogs, 5000); // Auto-refresh
        return () => clearInterval(interval);
    }, []);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'success': return <CheckCircle className="text-green-500" size={18} />;
            case 'failed': return <XCircle className="text-red-500" size={18} />;
            case 'partial': return <AlertTriangle className="text-yellow-500" size={18} />;
            default: return <Clock className="text-gray-400" size={18} />;
        }
    };

    const formatTime = (timestamp: number) => {
        return new Date(timestamp).toLocaleString('fr-FR', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            day: 'numeric',
            month: 'numeric'
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[100] backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[80vh] flex flex-col animate-in zoom-in-95 duration-200">

                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b">
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Journal de synchronisation</h2>
                        <p className="text-sm text-gray-500">50 dernières tentatives</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500">
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50">
                    {loading ? (
                        <div className="text-center py-8 text-gray-500">Chargement...</div>
                    ) : logs.length === 0 ? (
                        <div className="text-center py-12 text-gray-400 flex flex-col items-center gap-2">
                            <Clock size={32} strokeWidth={1.5} />
                            <p>Aucun historique disponible</p>
                        </div>
                    ) : (
                        logs.map((log) => (
                            <div key={log.id} className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm flex items-start gap-3">
                                <div className="mt-1">
                                    {getStatusIcon(log.status)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <span className={`font-medium text-sm ${log.status === 'success' ? 'text-green-700' :
                                                log.status === 'failed' ? 'text-red-700' : 'text-yellow-700'
                                            }`}>
                                            {log.status === 'success' ? 'Synchronisation réussie' :
                                                log.status === 'failed' ? 'Échec de la synchronisation' : 'Synchronisation partielle'}
                                        </span>
                                        <span className="text-xs text-gray-400 font-mono">
                                            {formatTime(log.timestamp)}
                                        </span>
                                    </div>

                                    <div className="mt-1 flex items-center gap-4 text-xs text-gray-600">
                                        <span>Items: <strong>{log.itemsSynced}</strong></span>
                                        {log.error && (
                                            <span className="text-red-600 truncate bg-red-50 px-2 py-0.5 rounded border border-red-100 max-w-[300px]" title={log.error}>
                                                Erreur: {log.error}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 border-t bg-gray-50 flex justify-between items-center rounded-b-xl">
                    <button
                        onClick={clearLogs}
                        className="flex items-center gap-2 text-red-600 hover:text-red-700 hover:bg-red-50 px-3 py-2 rounded-lg text-sm transition-colors"
                        disabled={logs.length === 0}
                    >
                        <Trash2 size={16} />
                        Effacer l'historique
                    </button>
                    <button
                        onClick={onClose}
                        className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-sm font-medium hover:bg-gray-50 text-gray-700 transition-colors"
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );
}
