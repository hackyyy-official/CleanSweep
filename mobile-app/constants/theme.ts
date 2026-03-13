/**
 * CleanSweep Mobile — Minimalist Design System
 * Clean white UI with pastel blue accents
 */

export const Colors = {
    // Primary palette
    primary: '#4A90D9',
    primaryLight: '#E8F1FB',
    primaryDark: '#3570A8',

    // Backgrounds
    background: '#FFFFFF',
    backgroundSecondary: '#F8FAFE',
    card: '#FFFFFF',

    // Text
    textPrimary: '#1A1A2E',
    textSecondary: '#6B7280',
    textTertiary: '#9CA3AF',
    textOnPrimary: '#FFFFFF',

    // Status
    success: '#34D399',
    successLight: '#ECFDF5',
    warning: '#FBBF24',
    warningLight: '#FFFBEB',
    danger: '#F87171',
    dangerLight: '#FEF2F2',

    // Gauge
    gaugeTrack: '#F0F4F8',
    gaugeFill: '#4A90D9',
    gaugeWarning: '#FBBF24',
    gaugeDanger: '#F87171',

    // Border & Shadows
    border: '#E5E7EB',
    borderLight: '#F3F4F6',
    shadow: 'rgba(0, 0, 0, 0.04)',
    shadowMedium: 'rgba(0, 0, 0, 0.08)',
} as const;

export const Spacing = {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
} as const;

export const BorderRadius = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    pill: 999,
} as const;

export const FontSize = {
    xs: 11,
    sm: 13,
    md: 15,
    lg: 17,
    xl: 22,
    xxl: 28,
    display: 48,
} as const;

export const FontWeight = {
    regular: '400' as const,
    medium: '500' as const,
    semibold: '600' as const,
    bold: '700' as const,
};

export const Shadows = {
    card: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.04,
        shadowRadius: 12,
        elevation: 2,
    },
    cardHover: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 4,
    },
    button: {
        shadowColor: '#4A90D9',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.25,
        shadowRadius: 12,
        elevation: 4,
    },
} as const;
