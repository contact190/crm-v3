import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';
import { clockIn } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function AttendanceScreen() {
    const { user } = useAuth();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        (async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const handleQRScanned = async ({ data }: { data: string }) => {
        setScanned(true);
        setLoading(true);

        try {
            // Parse QR code data
            const qrData = JSON.parse(data);
            const { employeeId, timestamp } = qrData;

            // Send clock-in request
            await clockIn(employeeId, timestamp);

            Alert.alert(
                '✅ Pointage enregistré',
                'Votre présence a été enregistrée avec succès',
                [{ text: 'OK', onPress: () => setScanned(false) }]
            );
        } catch (error) {
            Alert.alert(
                'Erreur',
                'QR code invalide ou erreur de connexion',
                [{ text: 'Réessayer', onPress: () => setScanned(false) }]
            );
        } finally {
            setLoading(false);
        }
    };

    if (hasPermission === null) {
        return (
            <View style={styles.container}>
                <ActivityIndicator size="large" color={theme.colors.primary} />
                <Text style={styles.loadingText}>Demande d'autorisation...</Text>
            </View>
        );
    }

    if (hasPermission === false) {
        return (
            <View style={styles.container}>
                <Text style={styles.errorText}>Accès à la caméra refusé</Text>
                <Text style={styles.errorSubtext}>
                    Veuillez autoriser l'accès à la caméra dans les paramètres
                </Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>Pointage</Text>
            </View>

            {/* Scanner */}
            <View style={styles.scannerContainer}>
                <BarCodeScanner
                    onBarCodeScanned={scanned ? undefined : handleQRScanned}
                    style={StyleSheet.absoluteFillObject}
                />

                <View style={styles.scannerOverlay}>
                    <View style={styles.scannerFrame} />

                    <View style={styles.instructionsCard}>
                        <LinearGradient
                            colors={['rgba(26, 26, 46, 0.95)', 'rgba(37, 37, 65, 0.95)']}
                            style={styles.instructionsGradient}
                        >
                            <Text style={styles.instructionsIcon}>📱</Text>
                            <Text style={styles.instructionsTitle}>
                                Scanner le QR Code
                            </Text>
                            <Text style={styles.instructionsText}>
                                Positionnez le QR code affiché sur l'écran du PC dans le cadre
                            </Text>
                        </LinearGradient>
                    </View>

                    {loading && (
                        <View style={styles.loadingOverlay}>
                            <ActivityIndicator size="large" color={theme.colors.primary} />
                            <Text style={styles.loadingText}>Enregistrement...</Text>
                        </View>
                    )}
                </View>
            </View>

            {/* Reset Button */}
            {scanned && !loading && (
                <TouchableOpacity
                    style={styles.resetButton}
                    onPress={() => setScanned(false)}
                >
                    <LinearGradient
                        colors={[theme.colors.primary, theme.colors.primaryLight]}
                        style={styles.resetButtonGradient}
                    >
                        <Text style={styles.resetButtonText}>Scanner à nouveau</Text>
                    </LinearGradient>
                </TouchableOpacity>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.bgDeep,
    },
    header: {
        padding: theme.spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    title: {
        fontSize: theme.fontSize.xxl,
        fontWeight: theme.fontWeight.extrabold,
        color: theme.colors.textPrimary,
    },
    scannerContainer: {
        flex: 1,
        position: 'relative',
    },
    scannerOverlay: {
        ...StyleSheet.absoluteFillObject,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0,0,0,0.3)',
    },
    scannerFrame: {
        width: 250,
        height: 250,
        borderWidth: 3,
        borderColor: theme.colors.primary,
        borderRadius: theme.borderRadius.lg,
        backgroundColor: 'transparent',
    },
    instructionsCard: {
        position: 'absolute',
        bottom: theme.spacing.xxl,
        left: theme.spacing.lg,
        right: theme.spacing.lg,
        borderRadius: theme.borderRadius.lg,
        overflow: 'hidden',
        ...theme.shadows.lg,
    },
    instructionsGradient: {
        padding: theme.spacing.xl,
        alignItems: 'center',
        gap: theme.spacing.md,
        borderWidth: 1,
        borderColor: theme.colors.border,
    },
    instructionsIcon: {
        fontSize: 48,
    },
    instructionsTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.textPrimary,
        textAlign: 'center',
    },
    instructionsText: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
        textAlign: 'center',
        lineHeight: 20,
    },
    loadingOverlay: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: 'rgba(0,0,0,0.8)',
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.md,
    },
    loadingText: {
        color: theme.colors.textPrimary,
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.semibold,
    },
    errorText: {
        color: theme.colors.danger,
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.bold,
        textAlign: 'center',
    },
    errorSubtext: {
        color: theme.colors.textSecondary,
        fontSize: theme.fontSize.md,
        textAlign: 'center',
        marginTop: theme.spacing.sm,
    },
    resetButton: {
        margin: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
        overflow: 'hidden',
    },
    resetButtonGradient: {
        padding: theme.spacing.lg,
        alignItems: 'center',
    },
    resetButtonText: {
        color: theme.colors.textPrimary,
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
    },
});
