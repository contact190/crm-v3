// API service with auto-detection (local vs cloud)
const API_CONFIG = {
    cloud: 'https://your-saas-domain.com/api', // TODO: Replace with actual domain
    local: 'http://192.168.0.156:3000/api/mobile', // Corrected local IP and sub-path
};

let currentEndpoint: string = API_CONFIG.cloud;
let isLocalAvailable: boolean = false;
let authToken: string | null = null;

/**
 * Set auth token for API calls
 */
export function setAuthToken(token: string | null) {
    authToken = token;
}

/**
 * Detect if local server is available
 */
export async function detectEndpoint(): Promise<string> {
    try {
        // If on web and on localhost, use localhost directly
        if (typeof window !== 'undefined' &&
            (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
            currentEndpoint = 'http://localhost:3000/api/mobile';
            isLocalAvailable = true;
            console.log('🌐 Web localhost detected');
            return currentEndpoint;
        }

        console.log(`🔍 Checking local server at ${API_CONFIG.local}...`);
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        const response = await fetch(`${API_CONFIG.local}/ping`, {
            signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (response.ok) {
            currentEndpoint = API_CONFIG.local;
            isLocalAvailable = true;
            console.log('✅ Local server detected and responsive');
            return currentEndpoint;
        }
    } catch (error) {
        console.log('⚠️ Local server unavailable (Firewall or Off), using cloud');
    }

    // Fallback to cloud
    currentEndpoint = API_CONFIG.cloud;
    isLocalAvailable = false;
    return currentEndpoint;
}

/**
 * Get current API endpoint
 */
export function getEndpoint(): string {
    return currentEndpoint;
}

/**
 * Check if local server is available
 */
export function isLocal(): boolean {
    return isLocalAvailable;
}

/**
 * Generic API call wrapper
 */
export async function apiCall<T>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const url = `${currentEndpoint}${path}`;

    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };

    if (authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
    }

    const response = await fetch(url, {
        ...options,
        headers,
    });

    if (!response.ok) {
        throw new Error(`API Error: ${response.statusText}`);
    }

    return response.json();
}

/**
 * Get dashboard stats
 */
export async function getDashboardStats(orgId: string) {
    return apiCall(`/stats?orgId=${orgId}`);
}

/**
 * Get products
 */
export async function getProducts(orgId: string) {
    return apiCall(`/products?orgId=${orgId}`);
}

/**
 * Get product by barcode
 */
export async function getProductByBarcode(barcode: string, orgId: string) {
    return apiCall(`/products/barcode/${barcode}?orgId=${orgId}`);
}

/**
 * Get clients
 */
export async function getClients(orgId: string) {
    return apiCall(`/clients?orgId=${orgId}`);
}

/**
 * Create transaction
 */
export async function createTransaction(data: any) {
    return apiCall('/transactions', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}

/**
 * Clock in/out
 */
export async function clockIn(employeeId: string, timestamp: number) {
    return apiCall('/attendance/clock-in', {
        method: 'POST',
        body: JSON.stringify({ employeeId, timestamp }),
    });
}

/**
 * Get Users
 */
export async function getUsers(orgId: string) {
    return apiCall<any[]>(`/users?orgId=${orgId}`);
}

/**
 * Login user
 */
export async function loginUser(identifier: string, password: string) {
    if (!currentEndpoint || currentEndpoint === API_CONFIG.cloud) {
        await detectEndpoint();
    }
    return apiCall<any>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ identifier, password }),
    });
}

/**
 * Adjust stock
 */
export async function adjustStock(data: any) {
    return apiCall('/stock/adjust', {
        method: 'POST',
        body: JSON.stringify(data),
    });
}
