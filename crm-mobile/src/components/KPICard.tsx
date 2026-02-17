import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../styles/theme';

interface KPICardProps {
    icon: string;
    label: string;
    value: number | string;
    color?: 'primary' | 'success' | 'warning' | 'danger';
    onPress?: () => void;
}

export function KPICard({ icon, label, value, color = 'primary', onPress }: KPICardProps) {
    const colorMap = {
        primary: [theme.colors.primary, theme.colors.primaryLight],
        success: [theme.colors.success, '#34d399'],
        warning: [theme.colors.warning, '#fbbf24'],
        danger: [theme.colors.danger, '#f87171'],
    };

    const gradientColors = colorMap[color] as [string, string];

    const content = (
        <View style={styles.card}>
            <LinearGradient
                colors={[theme.colors.bgCard, theme.colors.bgLight]}
                style={styles.gradient}
            >
                <View style={styles.iconContainer}>
                    <LinearGradient
                        colors={gradientColors}
                        style={styles.iconGradient}
                    >
                        <Text style={styles.icon}>{icon}</Text>
                    </LinearGradient>
                </View>

                <View style={styles.content}>
                    <Text style={styles.label}>{label}</Text>
                    <Text style={styles.value}>
                        {typeof value === 'number' ? value.toLocaleString() : value}
                        {typeof value === 'number' && ' DA'}
                    </Text>
                </View>
            </LinearGradient>
        </View>
    );

    if (onPress) {
        return (
            <TouchableOpacity onPress={onPress} activeOpacity={0.8}>
                {content}
            </TouchableOpacity>
        );
    }

    return content;
}

const styles = StyleSheet.create({
    card: {
        borderRadius: theme.borderRadius.lg,
        overflow: 'hidden',
        ...theme.shadows.md,
    },
    gradient: {
        padding: theme.spacing.lg,
        borderWidth: 1,
        borderColor: theme.colors.border,
        borderRadius: theme.borderRadius.lg,
    },
    iconContainer: {
        marginBottom: theme.spacing.md,
    },
    iconGradient: {
        width: 56,
        height: 56,
        borderRadius: theme.borderRadius.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        fontSize: 28,
    },
    content: {
        gap: theme.spacing.xs,
    },
    label: {
        fontSize: theme.fontSize.sm,
        color: theme.colors.textSecondary,
        fontWeight: theme.fontWeight.medium,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    value: {
        fontSize: theme.fontSize.xxl,
        color: theme.colors.textPrimary,
        fontWeight: theme.fontWeight.bold,
    },
});
