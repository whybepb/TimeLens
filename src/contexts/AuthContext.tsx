/**
 * AuthContext - Authentication state management
 * Uses Express API backend (ApiService) for authentication
 */

import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { ApiUser, getApiService } from "../services";

interface AuthContextType {
    user: ApiUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    login: (email: string, password: string) => Promise<ApiUser | null>;
    register: (email: string, password: string, name: string) => Promise<ApiUser | null>;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<ApiUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const api = getApiService();

    // Check auth state on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            // Wait for auth to be loaded from storage first
            await api.ensureLoaded();

            // Check if we have a cached user (from storage)
            const cachedUser = api.getCachedUser();
            if (cachedUser && api.hasToken()) {
                // Verify the token is still valid by calling the API
                try {
                    const currentUser = await api.getCurrentUser();
                    setUser(currentUser);
                    console.log("[AuthContext] User:", currentUser?.email || "None");
                } catch (verifyError) {
                    // Token is invalid, clear it
                    console.log("[AuthContext] Token invalid, clearing auth");
                    await api.logout();
                    setUser(null);
                }
            } else {
                setUser(null);
                console.log("[AuthContext] No stored auth");
            }
        } catch (error) {
            console.log("[AuthContext] No active session");
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string): Promise<ApiUser | null> => {
        try {
            const loggedInUser = await api.login(email, password);
            setUser(loggedInUser);
            console.log("[AuthContext] Logged in:", loggedInUser?.email);
            return loggedInUser;
        } catch (error) {
            console.error("[AuthContext] Login error:", error);
            throw error;
        }
    };

    const register = async (email: string, password: string, name: string): Promise<ApiUser | null> => {
        try {
            const newUser = await api.createAccount(email, password, name);
            setUser(newUser);
            console.log("[AuthContext] Registered:", newUser?.email);
            return newUser;
        } catch (error) {
            console.error("[AuthContext] Register error:", error);
            throw error;
        }
    };

    const logout = async () => {
        try {
            await api.logout();
            setUser(null);

            // Clear all local storage data
            const AsyncStorage = (await import("@react-native-async-storage/async-storage")).default;
            const keysToRemove = [
                "@timelens/goals",
                "@timelens/goals_last_sync",
                "@timelens/streaks",
                "@timelens/daily_logs",
                "@timelens/focus_settings",
                "@timelens/focus_stats",
                "@timelens/focus_sessions",
                "@timelens/notification_settings",
                "@timelens/persisted_data",
            ];

            await AsyncStorage.multiRemove(keysToRemove);
            console.log("[AuthContext] Logged out and cleared local data");
        } catch (error) {
            console.error("[AuthContext] Logout error:", error);
        }
    };

    const refresh = async () => {
        await checkAuth();
    };

    return (
        <AuthContext.Provider
            value={{
                user,
                isLoading,
                isAuthenticated: !!user,
                login,
                register,
                logout,
                refresh,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within AuthProvider");
    }
    return context;
}

export default AuthContext;
