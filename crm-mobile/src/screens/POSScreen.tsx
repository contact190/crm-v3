import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    TextInput,
    Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { theme } from '../styles/theme';
import { createTransaction, getProducts } from '../services/api';
import { useAuth } from '../context/AuthContext';

interface CartItem {
    id: string;
    name: string;
    price: number;
    quantity: number;
}

export function POSScreen() {
    const { user } = useAuth();
    const [cart, setCart] = useState<CartItem[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState<any[]>([]);
    const [filteredProducts, setFilteredProducts] = useState<any[]>([]);
    const [loadingProducts, setLoadingProducts] = useState(false);

    React.useEffect(() => {
        if (user?.orgId) {
            loadProducts();
        }
    }, [user?.orgId]);

    const loadProducts = async () => {
        try {
            setLoadingProducts(true);
            const data = await getProducts(user?.orgId || 'default');
            setProducts(data);
            setFilteredProducts(data);
        } catch (error) {
            console.error('Error loading products:', error);
        } finally {
            setLoadingProducts(false);
        }
    };

    const handleSearch = (text: string) => {
        setSearch(text);
        if (!text.trim()) {
            setFilteredProducts(products);
            return;
        }
        const filtered = products.filter(p =>
            p.name.toLowerCase().includes(text.toLowerCase()) ||
            p.barcode?.includes(text)
        );
        setFilteredProducts(filtered);
    };

    const addToCart = (product: any) => {
        const existingIndex = cart.findIndex(item => item.id === product.id);

        if (existingIndex > -1) {
            const newCart = [...cart];
            newCart[existingIndex].quantity += 1;
            setCart(newCart);
        } else {
            setCart([...cart, {
                id: product.id,
                name: product.name,
                price: product.price,
                quantity: 1,
            }]);
        }
    };

    const removeFromCart = (index: number) => {
        setCart(cart.filter((_, i) => i !== index));
    };

    const updateQuantity = (index: number, quantity: number) => {
        if (quantity <= 0) {
            removeFromCart(index);
            return;
        }

        const newCart = [...cart];
        newCart[index].quantity = quantity;
        setCart(newCart);
    };

    const calculateTotal = () => {
        return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    };

    const handleCheckout = async () => {
        if (cart.length === 0) {
            Alert.alert('Panier vide', 'Ajoutez des produits avant de valider');
            return;
        }

        Alert.alert(
            'Confirmer la vente',
            `Total: ${calculateTotal().toLocaleString()} DA`,
            [
                { text: 'Annuler', style: 'cancel' },
                {
                    text: 'Valider',
                    onPress: async () => {
                        try {
                            setLoading(true);
                            await createTransaction({
                                items: cart.map(item => ({
                                    productId: item.id,
                                    quantity: item.quantity,
                                    price: item.price
                                })),
                                paymentMethod: 'CASH',
                                total: calculateTotal(),
                                organizationId: user?.orgId || 'default'
                            });

                            Alert.alert('Succès', 'Vente enregistrée');
                            setCart([]);
                        } catch (error) {
                            Alert.alert('Erreur', 'Impossible d\'enregistrer la vente');
                        } finally {
                            setLoading(false);
                        }
                    },
                },
            ]
        );
    };

    return (
        <View style={styles.container}>
            <StatusBar style="light" />

            {/* Header */}
            <View style={styles.header}>
                <Text style={styles.title}>POS Mobile</Text>
                <View style={styles.totalBadge}>
                    <Text style={styles.totalText}>
                        {calculateTotal().toLocaleString()} DA
                    </Text>
                </View>
            </View>

            {/* Search */}
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Scanner ou rechercher..."
                    placeholderTextColor={theme.colors.textMuted}
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {/* Cart */}
            <View style={styles.cartContainer}>
                <Text style={styles.cartTitle}>Panier ({cart.length})</Text>

                {cart.length === 0 ? (
                    <View style={styles.emptyCart}>
                        <Text style={styles.emptyCartText}>🛒</Text>
                        <Text style={styles.emptyCartSubtext}>
                            Scannez ou recherchez des produits
                        </Text>
                    </View>
                ) : (
                    <FlatList
                        data={cart}
                        keyExtractor={(item, index) => `${item.id}-${index}`}
                        renderItem={({ item, index }) => (
                            <View style={styles.cartItem}>
                                <View style={styles.cartItemInfo}>
                                    <Text style={styles.cartItemName}>{item.name}</Text>
                                    <Text style={styles.cartItemPrice}>
                                        {item.price.toLocaleString()} DA
                                    </Text>
                                </View>

                                <View style={styles.cartItemActions}>
                                    <TouchableOpacity
                                        style={styles.quantityButton}
                                        onPress={() => updateQuantity(index, item.quantity - 1)}
                                    >
                                        <Text style={styles.quantityButtonText}>-</Text>
                                    </TouchableOpacity>

                                    <Text style={styles.quantity}>{item.quantity}</Text>

                                    <TouchableOpacity
                                        style={styles.quantityButton}
                                        onPress={() => updateQuantity(index, item.quantity + 1)}
                                    >
                                        <Text style={styles.quantityButtonText}>+</Text>
                                    </TouchableOpacity>

                                    <TouchableOpacity
                                        style={styles.removeButton}
                                        onPress={() => removeFromCart(index)}
                                    >
                                        <Text style={styles.removeButtonText}>🗑️</Text>
                                    </TouchableOpacity>
                                </View>

                                <Text style={styles.cartItemTotal}>
                                    {(item.price * item.quantity).toLocaleString()} DA
                                </Text>
                            </View>
                        )}
                    />
                )}
            </View>

            {/* Checkout Button */}
            <TouchableOpacity
                style={styles.checkoutButton}
                onPress={handleCheckout}
                disabled={loading || cart.length === 0}
            >
                <LinearGradient
                    colors={[theme.colors.success, '#34d399']}
                    style={styles.checkoutGradient}
                >
                    <Text style={styles.checkoutText}>
                        {loading ? 'Traitement...' : `Encaisser ${calculateTotal().toLocaleString()} DA`}
                    </Text>
                </LinearGradient>
            </TouchableOpacity>
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
    totalBadge: {
        backgroundColor: theme.colors.primary,
        paddingHorizontal: theme.spacing.md,
        paddingVertical: theme.spacing.sm,
        borderRadius: theme.borderRadius.full,
    },
    totalText: {
        color: theme.colors.textPrimary,
        fontSize: theme.fontSize.md,
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
    cartContainer: {
        flex: 1,
        padding: theme.spacing.lg,
    },
    cartTitle: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.md,
    },
    emptyCart: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        gap: theme.spacing.md,
    },
    emptyCartText: {
        fontSize: 64,
    },
    emptyCartSubtext: {
        color: theme.colors.textSecondary,
        fontSize: theme.fontSize.md,
    },
    cartItem: {
        backgroundColor: theme.colors.bgCard,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        marginBottom: theme.spacing.sm,
        gap: theme.spacing.sm,
    },
    cartItemInfo: {
        gap: theme.spacing.xs,
    },
    cartItemName: {
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.semibold,
        color: theme.colors.textPrimary,
    },
    cartItemPrice: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
    },
    cartItemActions: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: theme.spacing.sm,
    },
    quantityButton: {
        backgroundColor: theme.colors.bgLight,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.sm,
        width: 32,
        height: 32,
        alignItems: 'center',
        justifyContent: 'center',
    },
    quantityButtonText: {
        color: theme.colors.textPrimary,
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.bold,
    },
    quantity: {
        color: theme.colors.textPrimary,
        fontSize: theme.fontSize.md,
        fontWeight: theme.fontWeight.semibold,
        minWidth: 30,
        textAlign: 'center',
    },
    removeButton: {
        marginLeft: 'auto',
        padding: theme.spacing.sm,
    },
    removeButtonText: {
        fontSize: 20,
    },
    cartItemTotal: {
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.bold,
        color: theme.colors.success,
        textAlign: 'right',
    },
    checkoutButton: {
        margin: theme.spacing.lg,
        borderRadius: theme.borderRadius.md,
        overflow: 'hidden',
        ...theme.shadows.lg,
    },
    checkoutGradient: {
        padding: theme.spacing.lg,
        alignItems: 'center',
    },
    checkoutText: {
        color: theme.colors.textPrimary,
        fontSize: theme.fontSize.lg,
        fontWeight: theme.fontWeight.bold,
    },
});
