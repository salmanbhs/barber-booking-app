// Global color configuration for the BarberBook app
export const Colors = {
    // Primary brand colors
    primary: '#009F9A',
    primaryLight: '#00B8B3',
    primaryDark: '#008680',
    primaryBackground: '#E6F7F6',

    // Semantic colors
    success: '#10B981',
    successLight: '#34D399',
    successBackground: '#D1FAE5',

    warning: '#F59E0B',
    warningLight: '#FBBF24',
    warningBackground: '#FEF3C7',

    error: '#DC2626',
    errorLight: '#F87171',
    errorBackground: '#FEE2E2',

    // Neutral colors
    white: '#FFFFFF',
    gray50: '#F8FAFC',
    gray100: '#F1F5F9',
    gray200: '#E2E8F0',
    gray300: '#CBD5E1',
    gray400: '#94A3B8',
    gray500: '#64748B',
    gray600: '#475569',
    gray700: '#334155',
    gray800: '#1E293B',
    gray900: '#0F172A',
};

// Theme configuration
export const Theme = {
    colors: {
        background: Colors.gray50,
        surface: Colors.white,
        primary: Colors.primary,
        secondary: Colors.gray500,
        accent: Colors.primary,
        text: Colors.gray800,
        textSecondary: Colors.gray500,
        textMuted: Colors.gray400,
        border: Colors.gray200,
        placeholder: Colors.gray400,
    },
    spacing: {
        xs: 4,
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
        xxl: 24,
        xxxl: 32,
    },
    borderRadius: {
        sm: 8,
        md: 12,
        lg: 16,
        xl: 20,
    },
};

// Helper function to get color variations
export const getColorVariation = (baseColor: string, type: 'light' | 'dark' | 'background') => {
    const colorMap: { [key: string]: { [key in 'light' | 'dark' | 'background']: string } } = {
        [Colors.primary]: {
            light: Colors.primaryLight,
            dark: Colors.primaryDark,
            background: Colors.primaryBackground,
        },
        [Colors.success]: {
            light: Colors.successLight,
            dark: Colors.success,
            background: Colors.successBackground,
        },
        [Colors.warning]: {
            light: Colors.warningLight,
            dark: Colors.warning,
            background: Colors.warningBackground,
        },
        [Colors.error]: {
            light: Colors.errorLight,
            dark: Colors.error,
            background: Colors.errorBackground,
        },
    };

    return colorMap[baseColor]?.[type] || baseColor;
};
