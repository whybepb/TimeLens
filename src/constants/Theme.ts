/**
 * TimeLens - Glassmorphic Dark Theme
 * A futuristic, dark-mode aesthetic with deep charcoals, electric blues, and soft violets
 */

export const Theme = {
  // Core Background Colors
  colors: {
    // Deep Charcoal Backgrounds
    background: {
      primary: '#0D0D0F',      // Deepest background
      secondary: '#121216',    // Card backgrounds
      tertiary: '#1A1A1F',     // Elevated surfaces
      elevated: '#222228',     // Hover states
      surface: '#2A2A32',      // Input backgrounds
    },

    // Electric Blue Accents
    electric: {
      primary: '#1AA0FF',      // Primary actions, highlights
      secondary: '#4DB5FF',    // Secondary accents
      tertiary: '#80CAFF',     // Subtle highlights
      muted: '#006BB3',        // Muted states
      glow: 'rgba(26, 160, 255, 0.3)', // Glow effects
    },

    // Soft Violet Accents
    violet: {
      primary: '#A459FF',      // Secondary actions
      secondary: '#B475FF',    // Gradient accents
      tertiary: '#C492FF',     // Highlights
      muted: '#7021CC',        // Muted states
      glow: 'rgba(164, 89, 255, 0.3)', // Glow effects
    },

    // Glassmorphic Effects
    glass: {
      white: 'rgba(255, 255, 255, 0.08)',   // Subtle glass
      light: 'rgba(255, 255, 255, 0.12)',   // Light glass
      medium: 'rgba(255, 255, 255, 0.18)',  // Medium glass
      border: 'rgba(255, 255, 255, 0.15)',  // Glass borders
      overlay: 'rgba(13, 13, 15, 0.85)',    // Modal overlays
    },

    // Text Colors
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.72)',
      tertiary: 'rgba(255, 255, 255, 0.48)',
      muted: 'rgba(255, 255, 255, 0.32)',
      inverse: '#0D0D0F',
    },

    // Semantic Colors
    semantic: {
      success: '#00E676',
      warning: '#FFAB00',
      error: '#FF5252',
      info: '#1AA0FF',
    },

    // Gradient Definitions (as array for LinearGradient)
    gradients: {
      electricToViolet: ['#1AA0FF', '#A459FF'],
      violetToElectric: ['#A459FF', '#1AA0FF'],
      darkFade: ['#121216', '#0D0D0F'],
      glassOverlay: ['rgba(255, 255, 255, 0.12)', 'rgba(255, 255, 255, 0.04)'],
      scoreHigh: ['#00E676', '#1AA0FF'],
      scoreMedium: ['#FFAB00', '#FF6D00'],
      scoreLow: ['#FF5252', '#FF1744'],
    },
  },

  // Typography
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      semiBold: 'System',
      bold: 'System',
    },
    fontSize: {
      xs: 10,
      sm: 12,
      base: 14,
      md: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
      '5xl': 48,
      '6xl': 60,
      score: 72, // For large score displays
    },
    lineHeight: {
      tight: 1.1,
      normal: 1.5,
      relaxed: 1.75,
    },
    letterSpacing: {
      tight: -0.5,
      normal: 0,
      wide: 0.5,
      wider: 1,
    },
  },

  // Spacing Scale
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    base: 16,
    lg: 20,
    xl: 24,
    '2xl': 32,
    '3xl': 40,
    '4xl': 48,
    '5xl': 64,
    '6xl': 80,
  },

  // Border Radius
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    base: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
    full: 9999,
  },

  // Shadows & Glows
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.37,
      shadowRadius: 16,
      elevation: 8,
    },
    glass: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.37,
      shadowRadius: 32,
      elevation: 12,
    },
    glow: {
      electric: {
        shadowColor: '#1AA0FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
      },
      violet: {
        shadowColor: '#A459FF',
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
        elevation: 10,
      },
    },
  },

  // Glass Card Styles
  glassCard: {
    container: {
      backgroundColor: 'rgba(255, 255, 255, 0.08)',
      borderWidth: 1,
      borderColor: 'rgba(255, 255, 255, 0.15)',
      borderRadius: 16,
    },
    backdrop: {
      blur: 16,
    },
  },

  // Animation Durations
  animation: {
    fast: 150,
    normal: 300,
    slow: 500,
    slower: 700,
  },
} as const;

// Helper function to get gradient colors
export const getGradient = (name: keyof typeof Theme.colors.gradients) => 
  Theme.colors.gradients[name];

// Helper function to create glass style
export const getGlassStyle = (opacity: 'white' | 'light' | 'medium' = 'white') => ({
  backgroundColor: Theme.colors.glass[opacity],
  borderWidth: 1,
  borderColor: Theme.colors.glass.border,
  borderRadius: Theme.borderRadius.lg,
  ...Theme.shadows.glass,
});

// Score color helper
export const getScoreColor = (score: number) => {
  if (score >= 70) return Theme.colors.gradients.scoreHigh;
  if (score >= 40) return Theme.colors.gradients.scoreMedium;
  return Theme.colors.gradients.scoreLow;
};

export default Theme;
