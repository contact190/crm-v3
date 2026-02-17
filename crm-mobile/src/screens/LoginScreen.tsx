import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';
import { useAuth } from '../context/AuthContext';
import { loginUser } from '../services/api';

export function LoginScreen() {
    const [identifier, setIdentifier] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();

    const handleLogin = async () => {
        if (!identifier || !password) {
            Alert.alert('Erreur', 'Veuillez remplir tous les champs');
            return;
        }

        setLoading(true);
        try {
            const data = await loginUser(identifier, password);
            if (data.success) {
                await login(data.user, data.token);
            } else {
                Alert.alert('Erreur', data.error || 'Connexion échouée');
            }
        } catch (error: any) {
            Alert.alert('Erreur', 'Impossible de contacter le serveur');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}
        >
            <StatusBar style="light" />
            <LinearGradient
                colors={[theme.colors.bgDeep, theme.colors.bgCard]}
                style={styles.gradient}
            >
                <View style={styles.formContainer}>
                    <View style={styles.headerContainer}>
                        <Text style={styles.logo}>🛒</Text>
                        <Text style={styles.title}>CRM Mobile</Text>
                        <Text style={styles.subtitle}>Connectez-vous à votre boutique</Text>
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Utilisateur ou Email</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="votre@email.com"
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            value={identifier}
                            onChangeText={setIdentifier}
                            autoCapitalize="none"
                        />
                    </View>

                    <View style={styles.inputGroup}>
                        <Text style={styles.label}>Mot de passe</Text>
                        <TextInput
                            style={styles.input}
                            placeholder="••••••••"
                            placeholderTextColor="rgba(255,255,255,0.4)"
                            value={password}
                            onChangeText={setPassword}
                            secureTextEntry
                        />
                    </View>

                    <TouchableOpacity
                        style={styles.loginButton}
                        onPress={handleLogin}
                        disabled={loading}
                    >
                        <LinearGradient
                            colors={[theme.colors.primary, theme.colors.primaryLight]}
                            style={styles.buttonGradient}
                        >
                            {loading ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.buttonText}>Se Connecter</Text>
                            )}
                        </LinearGradient>
                    </TouchableOpacity>

                    <Text style={styles.footerText}>
                        Version 1.0.0 • Local Server Mode
                    </Text>
                </View>
            </LinearGradient>
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    gradient: {
        flex: 1,
        justifyContent: 'center',
        padding: theme.spacing.xl,
    },
    formContainer: {
        backgroundColor: 'rgba(255,255,255,0.05)',
        padding: theme.spacing.xl,
        borderRadius: theme.borderRadius.lg,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
        ...theme.shadows.lg,
    },
    headerContainer: {
        alignItems: 'center',
        marginBottom: theme.spacing.xxl,
    },
    logo: {
        fontSize: 50,
        marginBottom: theme.spacing.md,
    },
    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: theme.colors.textPrimary,
        marginBottom: theme.spacing.xs,
    },
    subtitle: {
        fontSize: 14,
        color: theme.colors.textSecondary,
    },
    inputGroup: {
        marginBottom: theme.spacing.lg,
    },
    label: {
        fontSize: 14,
        color: theme.colors.textSecondary,
        marginBottom: theme.spacing.xs,
        marginLeft: 4,
    },
    input: {
        backgroundColor: 'rgba(0,0,0,0.3)',
        borderRadius: theme.borderRadius.md,
        padding: theme.spacing.md,
        color: theme.colors.textPrimary,
        borderWidth: 1,
        borderColor: 'rgba(255,255,255,0.1)',
    },
    loginButton: {
        marginTop: theme.spacing.xl,
        borderRadius: theme.borderRadius.md,
        overflow: 'hidden',
        ...theme.shadows.md,
    },
    buttonGradient: {
        padding: theme.spacing.lg,
        alignItems: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    footerText: {
        textAlign: 'center',
        marginTop: theme.spacing.xxl,
        color: 'rgba(255,255,255,0.3)',
        fontSize: 12,
    },
});
