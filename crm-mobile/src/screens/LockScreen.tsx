import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    FlatList,
    ActivityIndicator
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { theme } from '../styles/theme';
import { getUsers } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function LockScreen({ onUnlock }: { onUnlock: (user: any) => void }) {
    const { user: authUser, logout } = useAuth();
    const [users, setUsers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedUser, setSelectedUser] = useState<any | null>(null);
    const [pin, setPin] = useState('');

    useEffect(() => {
        loadUsers();
    }, []);

    const loadUsers = async () => {
        try {
            console.log("LOCK SCREEN: Loading users...", authUser?.orgId);
            // Fetch users for the authenticated organization
            if (authUser?.orgId) {
                const data = await getUsers(authUser.orgId);
                console.log("LOCK SCREEN: Users fetched:", data);
                setUsers(data);
            } else {
                console.error("LOCK SCREEN: No Org ID in authUser");
            }
        } catch (error) {
            console.error("LOCK SCREEN: Error fetching users", error);
            Alert.alert('Erreur', 'Impossible de charger les utilisateurs');
        } finally {
            setLoading(false);
        }
    };

    const handlePinPress = (key: string) => {
        if (key === 'backspace') {
            setPin(prev => prev.slice(0, -1));
        } else {
            if (pin.length < 4) {
                const newPin = pin + key;
                setPin(newPin);
                if (newPin.length === 4) {
                    validatePin(newPin);
                }
            }
        }
    };

    const validatePin = (inputPin: string) => {
        if (selectedUser && selectedUser.pinCode === inputPin) {
            onUnlock(selectedUser);
        } else {
            Alert.alert('Erreur', 'Code PIN incorrect');
            setPin('');
        }
    };

    if (loading) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
            </View>
        );
    }

    if (!selectedUser) {
        return (
            <View style={styles.container}>
                <StatusBar style="light" />
                <View style={[styles.header, { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 20, alignItems: 'center', width: '100%' }]}>
                    <View>
                        <Text style={styles.title}>Qui êtes-vous ?</Text>
                        <Text style={styles.subtitle}>{authUser?.name}</Text>
                    </View>
                    <TouchableOpacity onPress={logout} style={{ padding: 10, backgroundColor: 'rgba(255,0,0,0.1)', borderRadius: 8 }}>
                        <Text style={{ color: theme.colors.danger, fontWeight: 'bold' }}>Déconnexion</Text>
                    </TouchableOpacity>
                </View>

                <FlatList
                    data={users}
                    keyExtractor={(item) => item.id}
                    numColumns={2}
                    contentContainerStyle={styles.grid}
                    columnWrapperStyle={styles.row}
                    renderItem={({ item }) => (
                        <TouchableOpacity
                            style={styles.userCard}
                            onPress={() => setSelectedUser(item)}
                        >
                            <LinearGradient
                                colors={[theme.colors.bgCard, theme.colors.bgLight]}
                                style={styles.userGradient}
                            >
                                <View style={styles.avatar}>
                                    <Text style={styles.avatarText}>
                                        {item.name.charAt(0).toUpperCase()}
                                    </Text>
                                </View>
                                <Text style={styles.userName}>{item.name}</Text>
                                <Text style={styles.userRole}>{item.role}</Text>
                            </LinearGradient>
                        </TouchableOpacity>
                    )}
                />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <TouchableOpacity
                style={styles.backButton}
                onPress={() => {
                    setSelectedUser(null);
                    setPin('');
                }}
            >
                <Text style={styles.backButtonText}>← Retour</Text>
            </TouchableOpacity>

            <View style={styles.pinHeader}>
                <View style={styles.avatarLarge}>
                    <Text style={styles.avatarTextLarge}>
                        {selectedUser.name.charAt(0).toUpperCase()}
                    </Text>
                </View>
                <Text style={styles.pinTitle}>Bonjour {selectedUser.name}</Text>
                <Text style={styles.pinSubtitle}>Entrez votre code PIN</Text>

                <View style={styles.dotsContainer}>
                    {[...Array(4)].map((_, i) => (
                        <View
                            key={i}
                            style={[
                                styles.dot,
                                i < pin.length && styles.dotFilled
                            ]}
                        />
                    ))}
                </View>
            </View>

            <View style={styles.numpad}>
                {[
                    ['1', '2', '3'],
                    ['4', '5', '6'],
                    ['7', '8', '9'],
                    ['', '0', 'backspace']
                ].map((row, i) => (
                    <View key={i} style={styles.numRow}>
                        {row.map((key) => {
                            if (key === '') return <View key="empty" style={styles.numKeyEmpty} />;
                            return (
                                <TouchableOpacity
                                    key={key}
                                    style={styles.numKey}
                                    onPress={() => handlePinPress(key)}
                                >
                                    {key === 'backspace' ? (
                                        <Text style={styles.numKeyText}>⌫</Text>
                                    ) : (
                                        <Text style={styles.numKeyText}>{key}</Text>
                                    )}
                                </TouchableOpacity>
                            );
                        })}
                    </View>
                ))}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.bgDeep,
        paddingTop: 50,
    },
    header: {
        marginBottom: 30,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
    },
    subtitle: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        marginTop: 5,
    },
    grid: {
        padding: 20,
    },
    row: {
        justifyContent: 'space-between',
        marginBottom: 20,
    },
    userCard: {
        width: '48%',
        aspectRatio: 1,
        borderRadius: 15,
        overflow: 'hidden',
    },
    userGradient: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 10,
    },
    avatar: {
        width: 60,
        height: 60,
        borderRadius: 30,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    avatarText: {
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
    },
    userName: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    userRole: {
        color: theme.colors.textSecondary,
        fontSize: 12,
        marginTop: 4,
    },
    backButton: {
        padding: 20,
    },
    backButtonText: {
        color: theme.colors.textSecondary,
        fontSize: 16,
    },
    pinHeader: {
        alignItems: 'center',
        marginBottom: 30,
    },
    avatarLarge: {
        width: 80,
        height: 80,
        borderRadius: 40,
        backgroundColor: theme.colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 15,
    },
    avatarTextLarge: {
        fontSize: 32,
        fontWeight: 'bold',
        color: 'white',
    },
    pinTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        marginBottom: 5,
    },
    pinSubtitle: {
        fontSize: 16,
        color: theme.colors.textSecondary,
        marginBottom: 20,
    },
    dotsContainer: {
        flexDirection: 'row',
        gap: 15,
    },
    dot: {
        width: 15,
        height: 15,
        borderRadius: 7.5,
        borderWidth: 1,
        borderColor: theme.colors.textSecondary,
    },
    dotFilled: {
        backgroundColor: theme.colors.primary,
        borderColor: theme.colors.primary,
    },
    numpad: {
        paddingHorizontal: 40,
        gap: 20,
    },
    numRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    numKey: {
        width: 70,
        height: 70,
        borderRadius: 35,
        backgroundColor: theme.colors.bgCard,
        justifyContent: 'center',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    numKeyEmpty: {
        width: 70,
        height: 70,
    },
    numKeyText: {
        fontSize: 28,
        color: theme.colors.textPrimary,
        fontWeight: '600',
    },
});
