/**
 * Client-side offline login helper
 * Handles authentication using IndexedDB when offline
 */

import { offlineDB } from '@/lib/offline/db';
import { verifyPassword } from '@/lib/auth';
import { encrypt } from '@/lib/auth';

export async function loginOffline(loginInput: string, password: string) {
    try {
        // 1. Check license validity
        const licenseCheck = await offlineDB.isLicenseValid();

        if (!licenseCheck.valid) {
            return { error: licenseCheck.error };
        }

        // Warn if close to expiration
        if (licenseCheck.daysLeft && licenseCheck.daysLeft <= 3) {
            console.warn(`⚠️ Only ${licenseCheck.daysLeft} days left offline`);
        }

        // 2. Find user in IndexedDB
        const user = await offlineDB.users
            .where('username').equals(loginInput)
            .or('email').equals(loginInput.toLowerCase())
            .first();

        if (!user) {
            return { error: "Identifiants incorrects." };
        }

        // 3. Verify password
        const isValid = await verifyPassword(password, user.password);

        if (!isValid) {
            return { error: "Identifiants incorrects." };
        }

        // 4. Create local session (stored in localStorage/sessionStorage)
        const expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
        const session = await encrypt({
            user: {
                id: user._localId,
                email: user.email,
                name: user.name,
                organizationId: user.organizationId,
                role: 'Offline User', // Simplified for offline
                permissions: [] // Will be synced when online
            },
            expires
        });

        // Store session in localStorage (since we can't set httpOnly cookies client-side)
        if (typeof window !== 'undefined') {
            localStorage.setItem('offline_session', session);
            localStorage.setItem('offline_session_expires', expires.toISOString());
        }

        return {
            success: true,
            offline: true,
            daysLeft: licenseCheck.daysLeft
        };

    } catch (error: any) {
        console.error('Offline login error:', error);
        return { error: `Erreur offline: ${error.message}` };
    }
}

/**
 * Check if user has valid offline session
 */
export function hasOfflineSession(): boolean {
    if (typeof window === 'undefined') return false;

    const session = localStorage.getItem('offline_session');
    const expires = localStorage.getItem('offline_session_expires');

    if (!session || !expires) return false;

    return new Date(expires) > new Date();
}

/**
 * Clear offline session
 */
export function clearOfflineSession() {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('offline_session');
    localStorage.removeItem('offline_session_expires');
}
