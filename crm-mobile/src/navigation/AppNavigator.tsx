import React from 'react';
import { Text, View, ActivityIndicator, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { DashboardScreen } from '../screens/DashboardScreen';
import { ScannerScreen } from '../screens/ScannerScreen';
import { POSScreen } from '../screens/POSScreen';
import { ClientsScreen } from '../screens/ClientsScreen';
import { AttendanceScreen } from '../screens/AttendanceScreen';
import { LoginScreen } from '../screens/LoginScreen';
import { theme } from '../styles/theme';
import { useAuth } from '../context/AuthContext';

const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator();

function TabIcon({ icon, color }: { icon: string; color: string }) {
    return (
        <Text style={{ fontSize: 24, opacity: color === theme.colors.textMuted ? 0.5 : 1 }}>
            {icon}
        </Text>
    );
}

function MainTabs() {
    const { hasPermission, activeUser } = useAuth();

    console.log("NAV: Checking permissions for", activeUser?.name, activeUser?.permissions);

    const tabs = [
        {
            key: 'dashboard',
            perms: ['view_dashboard', 'view_reports', 'view_finance', 'super_admin', 'admin'],
            name: 'Dashboard',
            component: DashboardScreen,
            icon: '🏠',
            label: 'Accueil'
        },
        {
            key: 'scanner',
            perms: ['manage_stock', 'manage_purchases'],
            name: 'Scanner',
            component: ScannerScreen,
            icon: '📷',
            label: 'Scanner'
        },
        {
            key: 'pos',
            perms: ['pos_access'],
            name: 'POS',
            component: POSScreen,
            icon: '💰',
            label: 'Caisse'
        },
        {
            key: 'clients',
            perms: ['view_clients', 'view_finance'],
            name: 'Clients',
            component: ClientsScreen,
            icon: '📋',
            label: 'Dettes'
        },
        {
            key: 'attendance',
            perms: ['attendance'],
            name: 'Attendance',
            component: AttendanceScreen,
            icon: '⏰',
            label: 'Pointage'
        },
    ];

    const authorizedTabs = tabs.filter(t => t.perms.some(p => hasPermission(p)));

    if (authorizedTabs.length === 0) {
        return (
            <View style={{ flex: 1, backgroundColor: theme.colors.bgDeep, justifyContent: 'center', alignItems: 'center' }}>
                <Text style={{ color: theme.colors.textPrimary, fontSize: 18, marginBottom: 10 }}>Accès Refusé</Text>
                <Text style={{ color: theme.colors.textSecondary }}>Aucune permission accordée.</Text>
                <Text style={{ color: theme.colors.textSecondary, fontSize: 10, marginTop: 10 }}>{activeUser?.permissions?.join(', ')}</Text>
            </View>
        );
    }

    return (
        <Tab.Navigator
            screenOptions={{
                headerShown: false,
                tabBarStyle: {
                    backgroundColor: theme.colors.bgCard,
                    borderTopColor: theme.colors.border,
                    borderTopWidth: 1,
                    height: 60,
                    paddingBottom: 8,
                    paddingTop: 8,
                },
                tabBarActiveTintColor: theme.colors.primary,
                tabBarInactiveTintColor: theme.colors.textMuted,
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
            }}
        >
            {authorizedTabs.map(tab => (
                <Tab.Screen
                    key={tab.key}
                    name={tab.name}
                    component={tab.component}
                    options={{
                        tabBarLabel: tab.label,
                        tabBarIcon: ({ color }) => <TabIcon icon={tab.icon} color={color} />,
                    }}
                />
            ))}
        </Tab.Navigator>
    );
}

import { LockScreen } from '../screens/LockScreen';

export function AppNavigator() {
    const { user, activeUser, isLoading, unlock } = useAuth();

    if (isLoading) {
        return (
            <View style={{ flex: 1, backgroundColor: theme.colors.bgDeep, justifyContent: 'center', alignItems: 'center' }}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    return (
        <NavigationContainer
            theme={{
                dark: true,
                colors: {
                    primary: theme.colors.primary,
                    background: theme.colors.bgDeep,
                    card: theme.colors.bgCard,
                    text: theme.colors.textPrimary,
                    border: theme.colors.border,
                    notification: theme.colors.danger,
                },
                fonts: {
                    regular: { fontFamily: 'System', fontWeight: '400' },
                    medium: { fontFamily: 'System', fontWeight: '500' },
                    bold: { fontFamily: 'System', fontWeight: '700' },
                    heavy: { fontFamily: 'System', fontWeight: '800' },
                },
            }}
        >
            <Stack.Navigator screenOptions={{ headerShown: false }}>
                {!user ? (
                    <Stack.Screen name="Login" component={LoginScreen} />
                ) : !activeUser ? (
                    <Stack.Screen name="Lock">
                        {props => <LockScreen {...props} onUnlock={unlock} />}
                    </Stack.Screen>
                ) : (
                    <Stack.Screen name="Main" component={MainTabs} />
                )}
            </Stack.Navigator>
        </NavigationContainer>
    );
}
