/**
 * Service Worker Registration
 * Register the service worker on app initialization
 */

export async function registerServiceWorker() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        console.log('Service Worker not supported');
        return;
    }

    try {
        const registration = await navigator.serviceWorker.register('/sw.js', {
            scope: '/'
        });

        console.log('✅ Service Worker registered:', registration.scope);

        // Listen for updates
        registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;

            newWorker?.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    console.log('🔄 New Service Worker available, please refresh');

                    // Optionally show a notification to the user
                    if (window.confirm('Une nouvelle version est disponible. Actualiser maintenant ?')) {
                        window.location.reload();
                    }
                }
            });
        });

        // Listen for messages from Service Worker
        navigator.serviceWorker.addEventListener('message', (event) => {
            if (event.data?.type === 'BACKGROUND_SYNC') {
                console.log('📡 Background sync requested by Service Worker');
                // Trigger sync manager
                import('@/lib/offline/sync-manager').then(({ syncManager }) => {
                    syncManager.forceSyncNow();
                });
            }
        });

        // Request background sync permission
        if ('sync' in registration) {
            await registration.sync.register('sync-data');
            console.log('✅ Background Sync registered');
        }

    } catch (error) {
        console.error('❌ Service Worker registration failed:', error);
    }
}

// Unregister service worker (for development/debugging)
export async function unregisterServiceWorker() {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
        return;
    }

    const registrations = await navigator.serviceWorker.getRegistrations();

    for (const registration of registrations) {
        await registration.unregister();
        console.log('🗑️ Service Worker unregistered');
    }
}
