import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Linking,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { theme } from '../styles/theme';
import { getClients } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function ClientsScreen() {
    const { user } = useAuth();
    const [clients, setClients] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user?.orgId) {
            loadClients();
        }
    }, [user?.orgId]);

    const loadClients = async () => {
        try {
            const data = await getClients(user?.orgId || 'default');
            setClients(data);
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de charger les clients');
        } finally {
            setLoading(false);
        }
    };

    const handleCall = (phone: string) => {
        if (!phone) {
            Alert.alert('Erreur', 'Numéro de téléphone non disponible');
            return;
        }

        Linking.openURL(`tel:${phone}`);
    };

    const filteredClients = clients.filter(client =>
        client.name.toLowerCase().includes(search.toLowerCase()) ||
        client.phone?.includes(search)
    ).filter(client => client.totalDebt > 0); // Only show clients with debt

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Carnet de Dettes</Text>
                <View style={styles.debtBadge}>
                    <Text style={styles.debtText}>
                        {clients.reduce((sum, c) => sum + (c.totalDebt || 0), 0).toLocaleString()} DA
                    </Text>
                </View>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Rechercher un client..."
                    placeholderTextColor={theme.colors.textMuted}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {/* Clients List */}
            <FlatList
                data={filteredClients}
                keyExtractor={(item) => item.id}
                contentContainerStyle={styles.listContent}
                renderItem={({ item }) => (
                    <View style={styles.clientCard}>
                        <LinearGradient
                            colors={[theme.colors.bgCard, theme.colors.bgLight]}
                            style={styles.clientGradient}
                        >
                            <View style={styles.clientHeader}>
                                <View style={styles.clientAvatar}>
                                    <Text style={styles.clientAvatarText}>
                                        {item.name.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <View style={styles.clientInfo}>
                                    <Text style={styles.clientName}>{item.name}</Text>
                                    {item.phone && (
                                        <Text style={styles.clientPhone}>{item.phone}</Text>
                                    )}
                                </View>
                            </View>

                            <View style={styles.debtInfo}>
                                <Text style={styles.debtLabel}>Dette totale</Text>
                                <Text style={styles.debtAmount}>
                                    {item.totalDebt?.toLocaleString() || 0} DA
                                </Text>
                            </View>

                            {item.phone && (
                                <TouchableOpacity
                                    style={styles.callButton}
                                    onPress={() => handleCall(item.phone)}
                                >
                                    <LinearGradient
                                        colors={[theme.colors.success, '#34d399']}
                                        style={styles.callButtonGradient}
                                    >
                                        <Text style={styles.callButtonIcon}>📞</Text>
                                        <Text style={styles.callButtonText}>Appeler</Text>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                        </LinearGradient>
                    </View>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyState}>
                        <Text style={styles.emptyStateIcon}>✅</Text>
                        <Text style={styles.emptyStateText}>
                            {search ? 'Aucun client trouvé' : 'Aucune dette en cours'}
                        </Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.bgDeep,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: theme.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    title: {
        fontSize: theme.fontSize.xxl,
        fontWeight: theme.fontWeight.extrabold,
        color: theme.colors.textPrimary,
    },
    debtBadge: {
        backgroundColor: theme.colors.danger,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.full,
    },
    debtText: {
        color: theme.colors.textPrimary,
        fontSize: theme.fontSize.sm,
        fontWeight: theme.fontWeight.bold,
    },
    searchContainer: {
        padding: theme.spacing.lg,
    },
    searchInput: {
        backgroundColor: theme.colors.bgCard,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        color: theme.colors.textPrimary,
        fontSize: theme.fontSize.md,
    },
    listContent: {
        padding: theme.spacing.lg,
        gap: theme.spacing.md,
    },
    clientCard: {
        borderRadius: theme.borderRadius.lg,
        overflow: 'hidden',
        ...theme.shadows.md,
    },
    clientGradient: {
        padding: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: theme.spacing.md,
    },
    clientHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.md,
    },
    clientAvatar: {
        width: 48,
        height: 48,
        borderRadius: theme.borderRadius.full,
        backgroundColor: theme.colors.primary,
        alignItems: 'center',
        justifyContent: 'center',
    },
    clientAvatarText: {
        color: theme.colors.textPrimary,
        fontSize: theme.fontSize.xl,
        fontWeight: theme.fontWeight.bold,
    },
    clientInfo: {
        flex: 1,
        gap: theme.spacing.xs,
    },
    clientName: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.textPrimary,
    },
    clientPhone: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    debtInfo: {
        backgroundColor: theme.colors.bgDeep,
        padding: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
        gap: theme.spacing.xs,
    },
    debtLabel: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    debtAmount: {
        fontSize: theme.fontSize.xl,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.danger,
    },
    callButton: {
        borderRadius: theme.borderRadius.md,
        overflow: 'hidden',
    },
    callButtonGradient: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.md,
        gap: theme.spacing.sm,
    },
    callButtonIcon: {
        fontSize: 20,
    },
    callButtonText: {
        color: theme.colors.textPrimary,
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
    },
    emptyState: {
        alignItems: 'center',
        justifyContent: 'center',
        padding: theme.spacing.xxl,
        gap: theme.spacing.md,
    },
    emptyStateIcon: {
        fontSize: 64,
    },
    emptyStateText: {
        color: theme.colors.textSecondary,
        fontSize: theme.fontSize.md,
        textAlign: 'center',
    },
});
