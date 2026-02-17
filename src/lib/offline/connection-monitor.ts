/**
 * Connection Monitor
 * Detects online/offline status and triggers sync when connection is restored
 */

type ConnectionStatus = 'online' | 'offline' | 'unknown';
type ConnectionCallback = (status: ConnectionStatus) => void;

class ConnectionMonitor {
    private status: ConnectionStatus = 'unknown';
    private listeners: ConnectionCallback[] = [];
    private checkInterval: NodeJS.Timeout | null = null;

    constructor() {
        if (typeof window !== 'undefined') {
            this.init();
        }
    }

    private init() {
        // Initial status
        this.status = navigator.onLine ? 'online' : 'offline';

        // Listen to browser events
        window.addEventListener('online', this.handleOnline);
        window.addEventListener('offline', this.handleOffline);

        // Periodic check (every 30s) to catch edge cases
        this.checkInterval = setInterval(() => {
            this.checkConnection();
        }, 30000);
    }

    private handleOnline = () => {
        console.log('🟢 Connection restored');
        this.updateStatus('online');
    };

    private handleOffline = () => {
        console.log('🔴 Connection lost');
        this.updateStatus('offline');
    };

    private async checkConnection(): Promise<void> {
        try {
            // Ping a lightweight endpoint
            const response = await fetch('/api/ping', {
                method: 'HEAD',
                cache: 'no-cache'
            });

            const newStatus = response.ok ? 'online' : 'offline';
            if (newStatus !== this.status) {
                this.updateStatus(newStatus);
            }
        } catch {
            if (this.status !== 'offline') {
                this.updateStatus('offline');
            }
        }
    }

    private updateStatus(newStatus: ConnectionStatus) {
        const oldStatus = this.status;
        this.status = newStatus;

        if (oldStatus !== newStatus) {
            console.log(`📡 Connection status changed: ${oldStatus} → ${newStatus}`);
            this.notifyListeners(newStatus);
        }
    }

    private notifyListeners(status: ConnectionStatus) {
        this.listeners.forEach(callback => {
            try {
                callback(status);
            } catch (error) {
                console.error('Connection listener error:', error);
            }
        });
    }

    /**
     * Subscribe to connection status changes
     */
    public on(callback: ConnectionCallback): () => void {
        this.listeners.push(callback);

        // Return unsubscribe function
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    /**
     * Get current connection status
     */
    public isOnline(): boolean {
        return this.status === 'online';
    }

    /**
     * Get current status
     */
    public getStatus(): ConnectionStatus {
        return this.status;
    }

    /**
     * Force a connection check
     */
    public async check(): Promise<ConnectionStatus> {
        await this.checkConnection();
        return this.status;
    }

    /**
     * Cleanup
     */
    public destroy() {
        if (typeof window !== 'undefined') {
            window.removeEventListener('online', this.handleOnline);
            window.removeEventListener('offline', this.handleOffline);
        }

        if (this.checkInterval) {
            clearInterval(this.checkInterval);
        }

        this.listeners = [];
    }
}

// Singleton instance
export const connectionMonitor = new ConnectionMonitor();

// Helper function
export function isOnline(): boolean {
    return connectionMonitor.isOnline();
}
