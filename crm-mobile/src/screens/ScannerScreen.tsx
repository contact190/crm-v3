import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    TextInput,
    ActivityIndicator,
} from 'react-native';
import { BarCodeScanner } from 'expo-barcode-scanner';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';
import { getProductByBarcode, adjustStock } from '../services/api';
import { useAuth } from '../context/AuthContext';

export function ScannerScreen() {
    const { user } = useAuth();
    const [hasPermission, setHasPermission] = useState<boolean | null>(null);
    const [scanned, setScanned] = useState(false);
    const [product, setProduct] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [manualBarcode, setManualBarcode] = useState('');

    useEffect(() => {
        (async () => {
            const { status } = await BarCodeScanner.requestPermissionsAsync();
            setHasPermission(status === 'granted');
        })();
    }, []);

    const handleBarCodeScanned = async ({ data }: { data: string }) => {
        setScanned(true);
        setLoading(true);

        try {
            const orgId = user?.orgId || 'default';
            const productData = await getProductByBarcode(data, orgId);
            setProduct(productData);
        } catch (error) {
            Alert.alert('Erreur', 'Produit non trouvé');
            setScanned(false);
        } finally {
            setLoading(false);
        }
    };

    const handleManualSearch = async () => {
        if (!manualBarcode.trim()) return;

        setLoading(true);
        try {
            const orgId = user?.orgId || 'default';
            const productData = await getProductByBarcode(manualBarcode, orgId);
            setProduct(productData);
            setScanned(true);
        } catch (error) {
            Alert.alert('Erreur', 'Produit non trouvé');
        } finally {
            setLoading(false);
        }
    };

    const handleAdjustStock = async (newQuantity: number) => {
        if (!product) return;

        try {
            setLoading(true);
            await adjustStock({
                productId: product.id,
                quantity: newQuantity,
                type: 'SET',
                reason: 'Ajustement mobile',
            });

            Alert.alert('Succès', 'Stock mis à jour');
            setProduct({ ...product, stock: newQuantity });
        } catch (error) {
            Alert.alert('Erreur', 'Impossible de mettre à jour le stock');
        } finally {
            setLoading(false);
        }
    };

    const resetScanner = () => {
        setScanned(false);
        setProduct(null);
        setManualBarcode('');
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

            {!scanned ? (
                <>
                    {/* Scanner View */}
                    <View style={styles.scannerContainer}>
                        <BarCodeScanner
                            onBarCodeScanned={scanned ? undefined : handleBarCodeScanned}
                            style={StyleSheet.absoluteFillObject}
                        />
                        <View style={styles.scannerOverlay}>
                            <View style={styles.scannerFrame} />
                            <Text style={styles.scannerText}>
                                Scannez un code-barres
                            </Text>
                        </View>
                    </View>

                    {/* Manual Input */}
                    <View style={styles.manualInputContainer}>
                        <Text style={styles.manualInputLabel}>Ou entrez manuellement :</Text>
                        <View style={styles.inputRow}>
                            <TextInput
                                style={styles.input}
                                placeholder="Code-barres"
                                placeholderTextColor={theme.colors.textMuted}
                                value={manualBarcode}
                                onChangeText={setManualBarcode}
                                keyboardType="numeric"
                            />
                            <TouchableOpacity
                                style={styles.searchButton}
                                onPress={handleManualSearch}
                                disabled={loading}
                            >
                                <LinearGradient
                                    colors={[theme.colors.primary, theme.colors.primaryLight]}
                                    style={styles.searchButtonGradient}
                                >
                                    <Text style={styles.searchButtonText}>
                                        {loading ? '...' : '🔍'}
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    </View>
                </>
            ) : (
                <>
                    {/* Product Info */}
                    {product && (
                        <View style={styles.productContainer}>
                            <LinearGradient
                                colors={[theme.colors.bgCard, theme.colors.bgLight]}
                                style={styles.productCard}
                            >
                                <Text style={styles.productName}>{product.name}</Text>

                                <View style={styles.productDetails}>
                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Prix</Text>
                                        <Text style={styles.detailValue}>
                                            {product.price?.toLocaleString()} DA
                                        </Text>
                                    </View>

                                    <View style={styles.detailRow}>
                                        <Text style={styles.detailLabel}>Stock</Text>
                                        <Text style={[
                                            styles.detailValue,
                                            { color: product.stock > 10 ? theme.colors.success : theme.colors.danger }
                                        ]}>
                                            {product.stock} {product.unit || 'pcs'}
                                        </Text>
                                    </View>

                                    {product.barcode && (
                                        <View style={styles.detailRow}>
                                            <Text style={styles.detailLabel}>Code-barres</Text>
                                            <Text style={styles.detailValue}>{product.barcode}</Text>
                                        </View>
                                    )}
                                </View>

                                {/* Quick Stock Adjustment */}
                                <View style={styles.stockAdjustment}>
                                    <Text style={styles.stockAdjustmentLabel}>
                                        Ajustement rapide :
                                    </Text>
                                    <View style={styles.stockButtons}>
                                        <TouchableOpacity
                                            style={styles.stockButton}
                                            onPress={() => handleAdjustStock(product.stock - 1)}
                                            disabled={loading}
                                        >
                                            <Text style={styles.stockButtonText}>-1</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.stockButton}
                                            onPress={() => handleAdjustStock(product.stock + 1)}
                                            disabled={loading}
                                        >
                                            <Text style={styles.stockButtonText}>+1</Text>
                                        </TouchableOpacity>
                                        <TouchableOpacity
                                            style={styles.stockButton}
                                            onPress={() => handleAdjustStock(product.stock + 10)}
                                            disabled={loading}
                                        >
                                            <Text style={styles.stockButtonText}>+10</Text>
                                        </TouchableOpacity>
                                    </View>
                                </View>
                            </LinearGradient>

                            <TouchableOpacity
                                style={styles.resetButton}
                                onPress={resetScanner}
                            >
                                <LinearGradient
                                    colors={[theme.colors.primary, theme.colors.primaryLight]}
                                    style={styles.resetButtonGradient}
                                >
                                    <Text style={styles.resetButtonText}>
                                        Scanner un autre produit
                                    </Text>
                                </LinearGradient>
                            </TouchableOpacity>
                        </View>
                    )}
                </>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: theme.colors.bgDeep,
    },
    loadingText: {
        color: theme.colors.textSecondary,
        fontSize: theme.fontSize.md,
        marginTop: theme.spacing.md,
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
    scannerText: {
        color: theme.colors.textPrimary,
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.semibold,
        marginTop: theme.spacing.xl,
        backgroundColor: 'rgba(0,0,0,0.7)',
        paddingHorizontal: theme.spacing.lg,
        paddingVertical: theme.spacing.md,
        borderRadius: theme.borderRadius.md,
    },
    manualInputContainer: {
        padding: theme.spacing.lg,
        backgroundColor: theme.colors.bgCard,
        borderTopWidth: 1,
        borderTopColor: theme.colors.border,
    },
    manualInputLabel: {
        color: theme.colors.textSecondary,
        fontSize: theme.fontSize.sm,
        marginBottom: theme.spacing.sm,
    },
    inputRow: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
    },
    input: {
        flex: 1,
        backgroundColor: theme.colors.bgLight,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        color: theme.colors.textPrimary,
        fontSize: theme.fontSize.md,
    },
    searchButton: {
        borderRadius: theme.borderRadius.md,
        overflow: 'hidden',
    },
    searchButtonGradient: {
        padding: theme.spacing.md,
        paddingHorizontal: theme.spacing.lg,
        alignItems: 'center',
        justifyContent: 'center',
    },
    searchButtonText: {
        fontSize: 24,
    },
    productContainer: {
        flex: 1,
        padding: theme.spacing.lg,
        gap: theme.spacing.lg,
    },
    productCard: {
        borderRadius: theme.borderRadius.lg,
        padding: theme.spacing.xl,
        borderWidth: 1,
        borderColor: theme.colors.border,
        gap: theme.spacing.lg,
    },
    productName: {
        fontSize: theme.fontSize.xxl,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.textPrimary,
        textAlign: 'center',
    },
    productDetails: {
        gap: theme.spacing.md,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: theme.spacing.sm,
        borderBottomWidth: 1,
        borderBottomColor: theme.colors.border,
    },
    detailLabel: {
        fontSize: theme.fontSize.md,
        color: theme.colors.textSecondary,
        fontWeight: theme.fontWeight.medium,
    },
    detailValue: {
        fontSize: theme.fontSize.lg,
        color: theme.colors.textPrimary,
        fontWeight: theme.fontWeight.semibold,
    },
    stockAdjustment: {
        gap: theme.spacing.md,
        marginTop: theme.spacing.md,
    },
    stockAdjustmentLabel: {
        fontSize: theme.fontSize.md,
        color: theme.colors.textSecondary,
        fontWeight: theme.fontWeight.medium,
    },
    stockButtons: {
        flexDirection: 'row',
        gap: theme.spacing.sm,
    },
    stockButton: {
        flex: 1,
        backgroundColor: theme.colors.bgLight,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        alignItems: 'center',
    },
    stockButtonText: {
        color: theme.colors.textPrimary,
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.semibold,
    },
    resetButton: {
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
