import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    RefreshControl,
    ActivityIndicator,
    Alert,
    TouchableOpacity,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { KPICard } from '../components/KPICard';
import { theme } from '../styles/theme';
import { getDashboardStats, detectEndpoint, isLocal } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function DashboardScreen() {
    const { user, logout } = useAuth();
    const [stats, setStats] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);
    const [connectionType, setConnectionType] = useState<'local' | 'cloud'>('cloud');

    const loadData = async () => {
        try {
            // Detect endpoint
            await detectEndpoint();
            setConnectionType(isLocal() ? 'local' : 'cloud');

            if (user?.orgId) {
                const data = await getDashboardStats(user.orgId);
                setStats(data);
            }
        } catch (error) {
            console.error('Error loading dashboard:', error);
            Alert.alert('Erreur', 'Impossible de charger les données');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    useEffect(() => {
        loadData();
    }, [user?.orgId]);

    const onRefresh = () => {
        setRefreshing(true);
        loadData();
    };

    const handleLogout = () => {
        Alert.alert(
            'Déconnexion',
            'Êtes-vous sûr de vouloir vous déconnecter ?',
            [
                { text: 'Annuler', style: 'cancel' },
                { text: 'Déconnexion', style: 'destructive', onPress: logout },
            ]
        );
    };

    if (loading) {
        return (
            <View style={styles.loadingContainer}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Chargement...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            <ScrollView
                style={styles.scrollView}
                contentContainerStyle={styles.scrollContent}
                refreshControl={
                    <RefreshControl
                        refreshing={refreshing}
                        onRefresh={onRefresh}
                        tintColor={theme.colors.primary}
                    />
                }
            >
                {/* Header */}
                <View style={styles.header}>
                    <View>
                        <Text style={styles.welcome}>Bonjour,</Text>
                        <Text style={styles.title}>{user?.name || 'Utilisateur'}</Text>
                    </View>
                    <View style={styles.headerRight}>
                        <View style={styles.connectionBadge}>
                            <View style={[
                                styles.connectionDot,
                                { backgroundColor: connectionType === 'local' ? theme.colors.success : theme.colors.warning }
                            ]} />
                            <Text style={styles.connectionText}>
                                {connectionType === 'local' ? 'Local' : 'Cloud'}
                            </Text>
                        </View>
                        <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                            <Text style={styles.logoutIcon}>🚪</Text>
                        </TouchableOpacity>
                    </View>
                </View>

                {/* KPIs */}
                <View style={styles.kpiGrid}>
                    <KPICard
                        icon="💰"
                        label="Ventes"
                        value={stats?.totalRevenue || 0}
                        color="success"
                    />
                    <KPICard
                        icon="📉"
                        label="Charges"
                        value={stats?.totalExpenses || 0}
                        color="danger"
                    />
                    <KPICard
                        icon="📈"
                        label="Bénéfice"
                        value={stats?.totalProfit || 0}
                        color="primary"
                    />
                    <KPICard
                        icon="⚠️"
                        label="Dettes"
                        value={stats?.totalClientDebt || 0}
                        color="warning"
                    />
                </View>

                {/* Recent Transactions */}
                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Activités Récentes</Text>
                    <View style={styles.transactionsList}>
                        {stats?.recentTransactions?.length > 0 ? (
                            stats.recentTransactions.slice(0, 5).map((transaction: any, index: number) => (
                                <View key={index} style={styles.transactionItem}>
                                    <View style={styles.transactionIcon}>
                                        <Text style={styles.transactionIconText}>
                                            {transaction.type === 'SALE' ? '💵' : '📦'}
                                        </Text>
                                    </View>
                                    <View style={styles.transactionInfo}>
                                        <Text style={styles.transactionTitle}>
                                            {transaction.type === 'SALE' ? 'Vente' : 'Achat'}
                                        </Text>
                                        <Text style={styles.transactionDate}>
                                            {new Date(transaction.createdAt).toLocaleDateString('fr-FR')}
                                        </Text>
                                    </View>
                                    <View style={styles.transactionValueContainer}>
                                        <Text style={[
                                            styles.transactionAmount,
                                            { color: transaction.type === 'SALE' ? theme.colors.success : theme.colors.danger }
                                        ]}>
                                            {transaction.total?.toLocaleString()} DA
                                        </Text>
                                        {transaction.paymentMode && (
                                            <Text style={styles.paymentModeText}>{transaction.paymentMode}</Text>
                                        )}
                                    </View>
                                </View>
                            ))
                        ) : (
                            <View style={styles.emptyState}>
                                <Text style={styles.emptyText}>Aucune activité récente</Text>
                            </View>
                        )}
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.bgDeep,
    },
    loadingContainer: {
        flex: 1,
        backgroundColor: theme.colors.bgDeep,
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.md,
    },
    loadingText: {
        color: theme.colors.textSecondary,
        fontSize: theme.fontSize.md,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        padding: theme.spacing.lg,
        gap: theme.spacing.xl,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: theme.spacing.md,
    },
    welcome: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
        fontWeight: theme.fontWeight.medium,
    },
    title: {
        fontSize: theme.fontSize.xxxl,
        fontWeight: theme.fontWeight.extrabold,
        color: theme.colors.textPrimary,
    },
    headerRight: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    logoutButton: {
        width: 40,
        height: 40,
        borderRadius: theme.borderRadius.full,
        backgroundColor: 'rgba(255,59,48,0.1)',
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: 'rgba(255,59,48,0.2)',
    },
    logoutIcon: {
        fontSize: 20,
    },
    connectionBadge: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.xs,
        backgroundColor: theme.colors.bgCard,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.full,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    connectionDot: {
        width: 8,
        height: 8,
        borderRadius: theme.borderRadius.full,
    },
    connectionText: {
        color: theme.colors.textSecondary,
        fontSize: theme.fontSize.xs,
        fontWeight: theme.fontWeight.medium,
    },
    kpiGrid: {
        gap: theme.spacing.md,
    },
    section: {
        gap: theme.spacing.md,
    },
    sectionTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.textPrimary,
    },
    transactionsList: {
        backgroundColor: theme.colors.bgCard,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        overflow: 'hidden',
    },
    transactionItem: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: theme.spacing.md,
        gap: theme.spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    transactionIcon: {
        width: 40,
        height: 40,
        borderRadius: theme.borderRadius.md,
        backgroundColor: theme.colors.bgLight,
        alignItems: 'center',
        justifyContent: 'center',
    },
    transactionIconText: {
        fontSize: 20,
    },
    transactionInfo: {
        flex: 1,
        gap: theme.spacing.xs,
    },
    transactionTitle: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.textPrimary,
    },
    transactionDate: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    transactionValueContainer: {
        alignItems: 'flex-end',
        gap: 2,
    },
    transactionAmount: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
    },
    paymentModeText: {
        fontSize: 10,
        color: theme.colors.textSecondary,
        backgroundColor: 'rgba(255,255,255,0.05)',
        paddingHorizontal: 4,
        paddingVertical: 1,
        borderRadius: 4,
        overflow: 'hidden',
    },
    emptyState: {
        padding: theme.spacing.xl,
        alignItems: 'center',
    },
    emptyText: {
        color: theme.colors.textSecondary,
        fontSize: theme.fontSize.sm,
    },
});
