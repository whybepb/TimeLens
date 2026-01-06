/**
 * AuthContext - Authentication state management
 * Provides auth state across the app
 */

import React, { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { AppwriteUser, getAppwriteService } from "../services";

interface AuthContextType {
    user: AppwriteUser | null;
    isLoading: boolean;
    isAuthenticated: boolean;
    logout: () => Promise<void>;
    refresh: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<AppwriteUser | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    const appwrite = getAppwriteService();

    // Check auth state on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        try {
            const currentUser = await appwrite.getCurrentUser();
            setUser(currentUser);
            console.log("[AuthContext] User:", currentUser?.email || "None");
        } catch (error) {
            console.log("[AuthContext] No active session");
            setUser(null);
        } finally {
            setIsLoading(false);
        }
    };

    const logout = async () => {
        try {
            await appwrite.logout();
            setUser(null);
            console.log("[AuthContext] Logged out");
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
