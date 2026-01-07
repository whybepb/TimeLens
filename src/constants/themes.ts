/**
 * TimeLens - Theme Presets
 * Five customizable themes with complete color palettes
 */

export type ThemeColors = {
    primary: string;
    secondary: string;
    tertiary: string;
    muted: string;
    glow: string;
};

export type ThemeDefinition = {
    name: string;
    displayName: string;
    colors: {
        background: {
            primary: string;
            secondary: string;
            tertiary: string;
            elevated: string;
            surface: string;
        };
        primary: ThemeColors;
        secondary: ThemeColors;
        glass: {
            white: string;
            light: string;
            medium: string;
            border: string;
            overlay: string;
        };
        text: {
            primary: string;
            secondary: string;
            tertiary: string;
            muted: string;
            inverse: string;
        };
        semantic: {
            success: string;
            warning: string;
            error: string;
            info: string;
        };
        gradients: {
            primary: string[];
            secondary: string[];
            background: string[];
            glassOverlay: string[];
            scoreHigh: string[];
            scoreMedium: string[];
            scoreLow: string[];
        };
    };
};

export const themes: Record<string, ThemeDefinition> = {
    default: {
        name: 'default',
        displayName: 'Default',
        colors: {
            background: {
                primary: '#0D0D0F',
                secondary: '#121216',
                tertiary: '#1A1A1F',
                elevated: '#222228',
                surface: '#2A2A32',
            },
            primary: {
                primary: '#A459FF',
                secondary: '#B475FF',
                tertiary: '#C492FF',
                muted: '#7021CC',
                glow: 'rgba(164, 89, 255, 0.3)',
            },
            secondary: {
                primary: '#1AA0FF',
                secondary: '#4DB5FF',
                tertiary: '#80CAFF',
                muted: '#006BB3',
                glow: 'rgba(26, 160, 255, 0.3)',
            },
            glass: {
                white: 'rgba(255, 255, 255, 0.08)',
                light: 'rgba(255, 255, 255, 0.12)',
                medium: 'rgba(255, 255, 255, 0.18)',
                border: 'rgba(255, 255, 255, 0.15)',
                overlay: 'rgba(13, 13, 15, 0.85)',
            },
            text: {
                primary: '#FFFFFF',
                secondary: 'rgba(255, 255, 255, 0.72)',
                tertiary: 'rgba(255, 255, 255, 0.48)',
                muted: 'rgba(255, 255, 255, 0.32)',
                inverse: '#0D0D0F',
            },
            semantic: {
                success: '#00E676',
                warning: '#FFAB00',
                error: '#FF5252',
                info: '#1AA0FF',
            },
            gradients: {
                primary: ['#A459FF', '#1AA0FF'],
                secondary: ['#1AA0FF', '#A459FF'],
                background: ['#121216', '#0D0D0F'],
                glassOverlay: ['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.04)'],
                scoreHigh: ['#00E676', '#1AA0FF'],
                scoreMedium: ['#FFAB00', '#FF6D00'],
                scoreLow: ['#FF5252', '#FF1744'],
            },
        },
    },

    cyberpunk: {
        name: 'cyberpunk',
        displayName: 'Cyberpunk',
        colors: {
            background: {
                primary: '#0A0A0F',
                secondary: '#0F0F1A',
                tertiary: '#1A1A2E',
                elevated: '#252538',
                surface: '#2E2E42',
            },
            primary: {
                primary: '#00F0FF',
                secondary: '#33F3FF',
                tertiary: '#66F6FF',
                muted: '#0099AA',
                glow: 'rgba(0, 240, 255, 0.4)',
            },
            secondary: {
                primary: '#FF006E',
                secondary: '#FF3385',
                tertiary: '#FF66A3',
                muted: '#CC0058',
                glow: 'rgba(255, 0, 110, 0.4)',
            },
            glass: {
                white: 'rgba(0, 240, 255, 0.08)',
                light: 'rgba(0, 240, 255, 0.12)',
                medium: 'rgba(0, 240, 255, 0.18)',
                border: 'rgba(0, 240, 255, 0.25)',
                overlay: 'rgba(10, 10, 15, 0.85)',
            },
            text: {
                primary: '#FFFFFF',
                secondary: 'rgba(255, 255, 255, 0.75)',
                tertiary: 'rgba(0, 240, 255, 0.6)',
                muted: 'rgba(255, 255, 255, 0.35)',
                inverse: '#0A0A0F',
            },
            semantic: {
                success: '#00FF9F',
                warning: '#FFD600',
                error: '#FF006E',
                info: '#00F0FF',
            },
            gradients: {
                primary: ['#00F0FF', '#FF006E'],
                secondary: ['#FF006E', '#00F0FF'],
                background: ['#0F0F1A', '#0A0A0F'],
                glassOverlay: ['rgba(0, 240, 255, 0.15)', 'rgba(255, 0, 110, 0.05)'],
                scoreHigh: ['#00FF9F', '#00F0FF'],
                scoreMedium: ['#FFD600', '#FF8800'],
                scoreLow: ['#FF006E', '#FF0040'],
            },
        },
    },

    nature: {
        name: 'nature',
        displayName: 'Nature',
        colors: {
            background: {
                primary: '#0D1B0D',
                secondary: '#132013',
                tertiary: '#1A2B1A',
                elevated: '#223622',
                surface: '#2A422A',
            },
            primary: {
                primary: '#4ADE80',
                secondary: '#6EE7A0',
                tertiary: '#86EFAC',
                muted: '#22C55E',
                glow: 'rgba(74, 222, 128, 0.3)',
            },
            secondary: {
                primary: '#92400E',
                secondary: '#B45309',
                tertiary: '#D97706',
                muted: '#78350F',
                glow: 'rgba(217, 119, 6, 0.3)',
            },
            glass: {
                white: 'rgba(74, 222, 128, 0.08)',
                light: 'rgba(74, 222, 128, 0.12)',
                medium: 'rgba(74, 222, 128, 0.18)',
                border: 'rgba(74, 222, 128, 0.2)',
                overlay: 'rgba(13, 27, 13, 0.85)',
            },
            text: {
                primary: '#F0FDF4',
                secondary: 'rgba(240, 253, 244, 0.75)',
                tertiary: 'rgba(134, 239, 172, 0.6)',
                muted: 'rgba(240, 253, 244, 0.35)',
                inverse: '#0D1B0D',
            },
            semantic: {
                success: '#4ADE80',
                warning: '#FBBF24',
                error: '#F87171',
                info: '#60A5FA',
            },
            gradients: {
                primary: ['#4ADE80', '#22C55E'],
                secondary: ['#D97706', '#92400E'],
                background: ['#132013', '#0D1B0D'],
                glassOverlay: ['rgba(74, 222, 128, 0.12)', 'rgba(74, 222, 128, 0.04)'],
                scoreHigh: ['#4ADE80', '#22C55E'],
                scoreMedium: ['#FBBF24', '#F59E0B'],
                scoreLow: ['#F87171', '#EF4444'],
            },
        },
    },
};

export const themeNames = Object.keys(themes) as Array<keyof typeof themes>;
export const defaultTheme = 'default';
