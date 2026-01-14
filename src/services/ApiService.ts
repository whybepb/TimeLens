/**
 * ApiService - Express Backend Integration
 * Replaces direct Appwrite SDK calls with REST API calls to Node.js backend
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

// API Configuration
// Use your Mac's IP for physical device testing, localhost for simulator
const API_URL = process.env.EXPO_PUBLIC_API_URL || "http://10.51.11.106:3001";

// Storage keys
const TOKEN_KEY = "@timelens/auth_token";
const USER_KEY = "@timelens/auth_user";

// ============================================================================
// Types
// ============================================================================

export interface ApiUser {
    id: string;
    email: string;
    name: string;
}

export interface UserGoals {
    steps: number;
    sleep: number;
    focus: number;
    pvc: number;
    calories: number;
}

export interface DailyLog {
    date: string;
    steps: number;
    sleepHours: number | null;
    focusMinutes: number;
    pvcScore: number;
    activeCalories: number;
    goalsMetCount: number;
}

export interface Streaks {
    steps: { currentStreak: number; longestStreak: number; lastActiveDate: string };
    sleep: { currentStreak: number; longestStreak: number; lastActiveDate: string };
    focus: { currentStreak: number; longestStreak: number; lastActiveDate: string };
    pvc: { currentStreak: number; longestStreak: number; lastActiveDate: string };
    overall: { currentStreak: number; longestStreak: number; lastActiveDate: string };
}

export interface FocusSession {
    id?: string;
    type: "focus" | "shortBreak" | "longBreak";
    duration: number;
    wasInterrupted: boolean;
    intention?: string;
    completedAt: string;
}

export interface AIInsightRequest {
    steps: number;
    sleepHours: number | null;
    activeCalories: number;
    pvcScore: number;
    focusMinutes?: number;
}

export interface AIInsightResponse {
    summary: string;
    tips: string[];
    encouragement: string;
}

// ============================================================================
// ApiService Class
// ============================================================================

class ApiService {
    private static instance: ApiService;
    private token: string | null = null;
    private currentUser: ApiUser | null = null;
    private authLoadPromise: Promise<void> | null = null;

    private constructor() {
        this.authLoadPromise = this.loadStoredAuth();
    }

    public static getInstance(): ApiService {
        if (!ApiService.instance) {
            ApiService.instance = new ApiService();
        }
        return ApiService.instance;
    }

    /**
     * Wait for auth to be loaded from storage
     * Call this before checking auth state on app startup
     */
    public async ensureLoaded(): Promise<void> {
        if (this.authLoadPromise) {
            await this.authLoadPromise;
        }
    }

    /**
     * Check if user is authenticated (has token)
     * Use this before making sync requests to avoid 401 errors
     */
    public hasToken(): boolean {
        return this.token !== null;
    }

    // ============================================================================
    // HTTP Helpers
    // ============================================================================

    private async request<T>(
        endpoint: string,
        options: RequestInit = {}
    ): Promise<T> {
        const url = `${API_URL}${endpoint}`;

        const headers: Record<string, string> = {
            "Content-Type": "application/json",
        };

        // Add auth token if available
        if (this.token) {
            headers["Authorization"] = `Bearer ${this.token}`;
        }

        // Merge with any custom headers
        if (options.headers) {
            // Convert HeadersInit to a plain object if it's not already
            if (options.headers instanceof Headers) {
                options.headers.forEach((value, key) => {
                    headers[key] = value;
                });
            } else if (Array.isArray(options.headers)) {
                options.headers.forEach(([key, value]) => {
                    headers[key] = value;
                });
            } else {
                Object.assign(headers, options.headers);
            }
        }

        const response = await fetch(url, {
            ...options,
            headers,
        });

        const data = await response.json();

        if (!response.ok) {
            console.error(`[API] Error ${response.status}:`, data);
            throw new Error(data.message || "API request failed");
        }

        return data;
    }

    // ============================================================================
    // Auth Token Management
    // ============================================================================

    private async loadStoredAuth(): Promise<void> {
        try {
            const [token, userJson] = await Promise.all([
                AsyncStorage.getItem(TOKEN_KEY),
                AsyncStorage.getItem(USER_KEY),
            ]);

            if (token) this.token = token;
            if (userJson) this.currentUser = JSON.parse(userJson);

            console.log("[API] Loaded stored auth:", this.currentUser?.email || "none");
        } catch (error) {
            console.error("[API] Failed to load stored auth:", error);
        }
    }

    private async saveAuth(token: string, user: ApiUser): Promise<void> {
        this.token = token;
        this.currentUser = user;

        await Promise.all([
            AsyncStorage.setItem(TOKEN_KEY, token),
            AsyncStorage.setItem(USER_KEY, JSON.stringify(user)),
        ]);
    }

    private async clearAuth(): Promise<void> {
        this.token = null;
        this.currentUser = null;

        await Promise.all([
            AsyncStorage.removeItem(TOKEN_KEY),
            AsyncStorage.removeItem(USER_KEY),
        ]);
    }

    // ============================================================================
    // Connection Test
    // ============================================================================

    public async ping(): Promise<boolean> {
        try {
            const response = await this.request<{ status: string }>("/api/health");
            console.log("[API] Connection successful");
            return response.status === "ok";
        } catch (error) {
            console.error("[API] Connection failed:", error);
            return false;
        }
    }

    // ============================================================================
    // Authentication
    // ============================================================================

    public async createAccount(
        email: string,
        password: string,
        name: string
    ): Promise<ApiUser | null> {
        try {
            const response = await this.request<{
                user: ApiUser;
                token: string;
            }>("/api/auth/register", {
                method: "POST",
                body: JSON.stringify({ email, password, name }),
            });

            await this.saveAuth(response.token, response.user);
            console.log("[API] Account created:", response.user.email);
            return response.user;
        } catch (error) {
            console.error("[API] Create account error:", error);
            throw error;
        }
    }

    public async login(email: string, password: string): Promise<ApiUser | null> {
        try {
            const response = await this.request<{
                user: ApiUser;
                token: string;
            }>("/api/auth/login", {
                method: "POST",
                body: JSON.stringify({ email, password }),
            });

            await this.saveAuth(response.token, response.user);
            console.log("[API] Login successful:", response.user.email);
            return response.user;
        } catch (error) {
            console.error("[API] Login error:", error);
            throw error;
        }
    }

    public async logout(): Promise<void> {
        try {
            await this.request("/api/auth/logout", { method: "POST" });
        } catch (error) {
            // Ignore errors, clear local state anyway
        }
        await this.clearAuth();
        console.log("[API] Logout successful");
    }

    public async getCurrentUser(): Promise<ApiUser | null> {
        if (!this.token) return null;

        try {
            const response = await this.request<{ user: ApiUser }>("/api/auth/me");
            this.currentUser = response.user;
            return response.user;
        } catch (error) {
            await this.clearAuth();
            return null;
        }
    }

    public async isLoggedIn(): Promise<boolean> {
        if (!this.token) return false;
        const user = await this.getCurrentUser();
        return user !== null;
    }

    public getCachedUser(): ApiUser | null {
        return this.currentUser;
    }

    // ============================================================================
    // Goals
    // ============================================================================

    public async getUserGoals(): Promise<UserGoals | null> {
        try {
            const response = await this.request<{ goals: UserGoals }>("/api/goals");
            return response.goals;
        } catch (error) {
            console.error("[API] Get goals error:", error);
            return null;
        }
    }

    public async saveUserGoals(goals: UserGoals): Promise<void> {
        try {
            await this.request("/api/goals", {
                method: "PUT",
                body: JSON.stringify(goals),
            });
            console.log("[API] Goals saved");
        } catch (error) {
            console.error("[API] Save goals error:", error);
        }
    }

    // ============================================================================
    // Daily Logs
    // ============================================================================

    public async getDailyLogs(days: number = 30): Promise<DailyLog[]> {
        try {
            const response = await this.request<{ logs: DailyLog[] }>(
                `/api/logs?days=${days}`
            );
            return response.logs;
        } catch (error) {
            console.error("[API] Get logs error:", error);
            return [];
        }
    }

    public async saveDailyLog(log: DailyLog): Promise<void> {
        try {
            await this.request("/api/logs", {
                method: "POST",
                body: JSON.stringify(log),
            });
            console.log("[API] Daily log saved for", log.date);
        } catch (error) {
            console.error("[API] Save log error:", error);
        }
    }

    public async deleteDailyLog(date: string): Promise<void> {
        try {
            await this.request(`/api/logs/${date}`, { method: "DELETE" });
            console.log("[API] Daily log deleted for", date);
        } catch (error) {
            console.error("[API] Delete log error:", error);
        }
    }

    // ============================================================================
    // Streaks
    // ============================================================================

    public async getStreaks(): Promise<Streaks | null> {
        try {
            const response = await this.request<{ streaks: Streaks }>("/api/streaks");
            return response.streaks;
        } catch (error) {
            console.error("[API] Get streaks error:", error);
            return null;
        }
    }

    public async saveStreaks(streaks: Streaks): Promise<void> {
        try {
            await this.request("/api/streaks", {
                method: "PUT",
                body: JSON.stringify(streaks),
            });
            console.log("[API] Streaks saved");
        } catch (error) {
            console.error("[API] Save streaks error:", error);
        }
    }

    // ============================================================================
    // Focus Sessions
    // ============================================================================

    public async getFocusSessions(limit: number = 20): Promise<FocusSession[]> {
        try {
            const response = await this.request<{ sessions: FocusSession[] }>(
                `/api/focus/sessions?limit=${limit}`
            );
            return response.sessions;
        } catch (error) {
            console.error("[API] Get sessions error:", error);
            return [];
        }
    }

    public async saveFocusSession(session: Omit<FocusSession, "id">): Promise<void> {
        try {
            await this.request("/api/focus/sessions", {
                method: "POST",
                body: JSON.stringify(session),
            });
            console.log("[API] Focus session saved");
        } catch (error) {
            console.error("[API] Save session error:", error);
        }
    }

    public async getFocusStats(): Promise<{
        todaySessions: number;
        todayMinutes: number;
        completedSessions: number;
        currentStreak: number;
    } | null> {
        try {
            const response = await this.request<{
                stats: {
                    todaySessions: number;
                    todayMinutes: number;
                    completedSessions: number;
                    currentStreak: number;
                };
            }>("/api/focus/stats");
            return response.stats;
        } catch (error) {
            console.error("[API] Get focus stats error:", error);
            return null;
        }
    }

    // ============================================================================
    // AI Insights
    // ============================================================================

    public async getAIInsights(data: AIInsightRequest): Promise<AIInsightResponse | null> {
        try {
            const response = await this.request<AIInsightResponse>("/api/insights", {
                method: "POST",
                body: JSON.stringify(data),
            });
            console.log("[API] AI insights received");
            return response;
        } catch (error) {
            console.error("[API] AI insights error:", error);
            return null;
        }
    }
}

// ============================================================================
// Exports
// ============================================================================

export const getApiService = () => ApiService.getInstance();
export default ApiService;
