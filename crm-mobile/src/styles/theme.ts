// Theme matching the existing dashboard design
export const theme = {
    colors: {
        // Primary colors
        primary: '#6366f1',
        primaryDark: '#4f46e5',
        primaryLight: '#818cf8',

        // Background
        bgDeep: '#0f0f1e',
        bgCard: '#1a1a2e',
        bgLight: '#252541',

        // Text
        textPrimary: '#ffffff',
        textSecondary: '#a0a0b8',
        textMuted: '#6b6b8a',

        // Status colors
        success: '#10b981',
        warning: '#f59e0b',
        danger: '#ef4444',
        info: '#3b82f6',

        // Borders
        border: '#2a2a4a',
        borderLight: '#3a3a5a',

        // Gradients
        gradientStart: '#6366f1',
        gradientEnd: '#8b5cf6',
    },

    spacing: {
        xs: 4,
        sm: 8,
        md: 16,
        lg: 24,
        xl: 32,
        xxl: 48,
    },

    borderRadius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 24,
        full: 9999,
    },

    fontSize: {
        xs: 12,
        sm: 14,
        md: 16,
        lg: 18,
        xl: 20,
        xxl: 24,
        xxxl: 32,
    },

    fontWeight: {
        normal: '400' as const,
        medium: '500' as const,
        semibold: '600' as const,
        bold: '700' as const,
        extrabold: '800' as const,
    },

    shadows: {
        sm: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 2,
        },
        md: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.15,
            shadowRadius: 8,
            elevation: 4,
        },
        lg: {
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 8 },
            shadowOpacity: 0.2,
            shadowRadius: 16,
            elevation: 8,
        },
    },
};

export type Theme = typeof theme;
