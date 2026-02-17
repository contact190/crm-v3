import { io, Socket } from 'socket.io-client';
import { offlineDB } from './db';

class LocalSyncService {
    private socket: Socket | null = null;
    private isElectron: boolean = false;

    constructor() {
        // Simple check for Electron
        this.isElectron = typeof window !== 'undefined' &&
            window.process &&
            (window.process as any).type === 'renderer';

        if (typeof window !== 'undefined') {
            this.init();
        }
    }

    private init() {
        // Connect to local Electron server (always at localhost for now)
        // In a real multi-terminal setup, this would be the IP of the main terminal
        const serverUrl = 'http://localhost:4000';

        this.socket = io(serverUrl);

        this.socket.on('connect', () => {
            console.log('🔗 Connected to local sync server');
        });

        this.socket.on('sync-remote-change', async (data: any) => {
            const { table, localId, action } = data;
            console.log(`📡 Remote change received via Local Sync: ${action} in ${table}`);

            // This will trigger a pull from the sync-manager to ensure data is consistent
            // Or we could handle it specifically here. For now, let's at least log it.
            // Ideally, the sync-manager is notified to run a pullFromServer.
            window.dispatchEvent(new CustomEvent('local-sync-detected', { detail: data }));
        });
    }

    /**
     * Notify local network of a change
     */
    broadcastChange(orgId: string, table: string, localId: string, action: string) {
        if (this.socket?.connected) {
            this.socket.emit('entity-updated', { orgId, table, localId, action });
        }
    }

    joinOrg(orgId: string) {
        if (this.socket) {
            this.socket.emit('join-org', orgId);
        }
    }

    isConnected(): boolean {
        return this.socket?.connected || false;
    }
}

export const localSyncService = new LocalSyncService();
