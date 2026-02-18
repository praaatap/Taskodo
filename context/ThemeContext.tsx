import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Colors from '../constants/Colors';

type ThemeType = 'light' | 'dark';

interface ThemeContextType {
    theme: typeof Colors.light;
    isDark: boolean;
    toggleTheme: () => void;
    setTheme: (theme: ThemeType) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@taskodo_theme_preference';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const systemColorScheme = useColorScheme();
    const [isDark, setIsDark] = useState(systemColorScheme === 'dark');

    useEffect(() => {
        // Load persisted theme
        const loadTheme = async () => {
            try {
                const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
                if (savedTheme !== null) {
                    setIsDark(savedTheme === 'dark');
                }
            } catch (e) {
                console.error('Failed to load theme preference', e);
            }
        };
        loadTheme();
    }, []);

    const toggleTheme = async () => {
        try {
            const nextTheme = !isDark;
            setIsDark(nextTheme);
            await AsyncStorage.setItem(THEME_STORAGE_KEY, nextTheme ? 'dark' : 'light');
        } catch (e) {
            console.error('Failed to save theme preference', e);
        }
    };

    const setTheme = async (type: ThemeType) => {
        try {
            const nextIsDark = type === 'dark';
            setIsDark(nextIsDark);
            await AsyncStorage.setItem(THEME_STORAGE_KEY, nextIsDark ? 'dark' : 'light');
        } catch (e) {
            console.error('Failed to save theme preference', e);
        }
    };

    const theme = isDark ? Colors.dark : Colors.light;

    return (
        <ThemeContext.Provider value={{ theme, isDark, toggleTheme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
