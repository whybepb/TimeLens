import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { defaultTheme, ThemeDefinition, themes } from '../constants/themes';

const THEME_STORAGE_KEY = '@timelens_theme';

type ThemeContextType = {
    currentTheme: ThemeDefinition;
    themeName: string;
    setTheme: (themeName: string) => Promise<void>;
    availableThemes: typeof themes;
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
    const [themeName, setThemeName] = useState<string>(defaultTheme);
    const [currentTheme, setCurrentTheme] = useState<ThemeDefinition>(themes[defaultTheme]);

    // Load saved theme on mount
    useEffect(() => {
        loadSavedTheme();
    }, []);

    const loadSavedTheme = async () => {
        try {
            const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
            if (savedTheme && themes[savedTheme]) {
                setThemeName(savedTheme);
                setCurrentTheme(themes[savedTheme]);
            }
        } catch (error) {
            console.error('Failed to load saved theme:', error);
        }
    };

    const setTheme = async (newThemeName: string) => {
        try {
            if (!themes[newThemeName]) {
                console.warn(`Theme "${newThemeName}" not found, using default`);
                newThemeName = defaultTheme;
            }

            setThemeName(newThemeName);
            setCurrentTheme(themes[newThemeName]);
            await AsyncStorage.setItem(THEME_STORAGE_KEY, newThemeName);
        } catch (error) {
            console.error('Failed to save theme:', error);
        }
    };

    return (
        <ThemeContext.Provider
            value={{
                currentTheme,
                themeName,
                setTheme,
                availableThemes: themes,
            }}
        >
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
