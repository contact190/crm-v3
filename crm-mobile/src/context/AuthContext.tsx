import React, { createContext, useState, useContext, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { setAuthToken } from '../services/api';

interface User {
    id: string;
    name: string | null;
    email: string;
    orgId: string;
    permissions: string[];
}

interface AuthContextType {
    user: User | null; // The Organization "Device" User
    activeUser: any | null; // The actual person using the app
    token: string | null;
    isLoading: boolean;
    login: (userData: User, token: string) => Promise<void>;
    logout: () => Promise<void>;
    unlock: (user: any) => void;
    lock: () => void;
    hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [activeUser, setActiveUser] = useState<any | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Load session on startup
        loadStorageData();
    }, []);

    const loadStorageData = async () => {
        try {
            const storedUser = await AsyncStorage.getItem('@user');
            const storedToken = await AsyncStorage.getItem('@token');

            if (storedUser && storedToken) {
                const parsedUser = JSON.parse(storedUser);
                setUser(parsedUser);
                setToken(storedToken);
                setAuthToken(storedToken);
            }
        } catch (e) {
            console.error('Failed to load auth data', e);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (userData: User, authToken: string) => {
        try {
            await AsyncStorage.setItem('@user', JSON.stringify(userData));
            await AsyncStorage.setItem('@token', authToken);
            setUser(userData);
            setToken(authToken);
            setAuthToken(authToken);
        } catch (e) {
            console.error('Failed to save auth data', e);
        }
    };

    const logout = async () => {
        try {
            console.log("AUTH: Logging out...");
            await AsyncStorage.removeItem('@user');
            await AsyncStorage.removeItem('@token');
        } catch (e) {
            console.error('Failed to clear auth data', e);
        } finally {
            // Always clear state
            setUser(null);
            setActiveUser(null);
            setToken(null);
            setAuthToken(null);
            console.log("AUTH: State cleared");
        }
    };

    const unlock = (user: any) => {
        setActiveUser(user);
    };

    const lock = () => {
        setActiveUser(null);
    };

    const hasPermission = (permission: string) => {
        // Use activeUser permissions if available, otherwise fall back to device user (though device user usually has 'device_access' only)
        // In this model, 'user' is the organization login. 'activeUser' is the employee.
        // If locked (no activeUser), permissions should be false.
        if (!activeUser) return false;

        // Check active user permissions
        return activeUser.permissions.includes(permission) || activeUser.permissions.includes('admin') || activeUser.permissions.includes('super_admin');
    };

    return (
        <AuthContext.Provider value={{ user, activeUser, token, isLoading, login, logout, unlock, lock, hasPermission }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};
