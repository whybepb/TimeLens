/**
 * FocusService - Manages focus sessions and Pomodoro timer
 * Handles session history and stats
 */

import AsyncStorage from "@react-native-async-storage/async-storage";

// ============================================================================
// Types
// ============================================================================

export type SessionType = "focus" | "shortBreak" | "longBreak";

export interface FocusSession {
    id: string;
    type: SessionType;
    duration: number; // in seconds
    completedAt: Date;
    wasInterrupted: boolean;
    intention?: string;
}

export interface FocusSettings {
    focusDuration: number; // minutes
    shortBreakDuration: number;
    longBreakDuration: number;
    sessionsBeforeLongBreak: number;
    autoStartBreaks: boolean;
    autoStartFocus: boolean;
}

export interface FocusStats {
    totalFocusMinutes: number;
    totalSessions: number;
    completedSessions: number;
    currentStreak: number; // sessions completed without interruption
    todayMinutes: number;
    todaySessions: number;
}

// Defaults
const DEFAULT_SETTINGS: FocusSettings = {
    focusDuration: 25,
    shortBreakDuration: 5,
    longBreakDuration: 15,
    sessionsBeforeLongBreak: 4,
    autoStartBreaks: false,
    autoStartFocus: false,
};

const STORAGE_KEYS = {
    SETTINGS: "@timelens/focus_settings",
    SESSIONS: "@timelens/focus_sessions",
};

// ============================================================================
// FocusService Class
// ============================================================================

class FocusService {
    private static instance: FocusService;
    private settings: FocusSettings = { ...DEFAULT_SETTINGS };
    private sessions: FocusSession[] = [];
    private subscribers: Set<() => void> = new Set();

    private constructor() {
        this.loadFromStorage();
    }

    public static getInstance(): FocusService {
        if (!FocusService.instance) {
            FocusService.instance = new FocusService();
        }
        return FocusService.instance;
    }

    // ============================================================================
    // Storage
    // ============================================================================

    private async loadFromStorage(): Promise<void> {
        try {
            const [settingsJson, sessionsJson] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEYS.SETTINGS),
                AsyncStorage.getItem(STORAGE_KEYS.SESSIONS),
            ]);

            if (settingsJson) {
                this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(settingsJson) };
            }

            if (sessionsJson) {
                const parsed = JSON.parse(sessionsJson);
                this.sessions = parsed.map((s: any) => ({
                    ...s,
                    completedAt: new Date(s.completedAt),
                }));
            }

            console.log("[FocusService] Loaded from storage");
        } catch (error) {
            console.error("[FocusService] Failed to load:", error);
        }
    }

    private async saveToStorage(): Promise<void> {
        try {
            await Promise.all([
                AsyncStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(this.settings)),
                AsyncStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(this.sessions)),
            ]);
            console.log("[FocusService] Saved to storage");
        } catch (error) {
            console.error("[FocusService] Failed to save:", error);
        }
    }

    // ============================================================================
    // Settings
    // ============================================================================

    public getSettings(): FocusSettings {
        return { ...this.settings };
    }

    public async updateSettings(updates: Partial<FocusSettings>): Promise<void> {
        this.settings = { ...this.settings, ...updates };
        await this.saveToStorage();
        this.notifySubscribers();
    }

    public async resetSettings(): Promise<void> {
        this.settings = { ...DEFAULT_SETTINGS };
        await this.saveToStorage();
        this.notifySubscribers();
    }

    // ============================================================================
    // Sessions
    // ============================================================================

    public async recordSession(
        type: SessionType,
        durationSeconds: number,
        wasInterrupted: boolean,
        intention?: string
    ): Promise<void> {
        const session: FocusSession = {
            id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
            type,
            duration: durationSeconds,
            completedAt: new Date(),
            wasInterrupted,
            intention,
        };

        this.sessions.unshift(session);

        // Keep only last 100 sessions
        this.sessions = this.sessions.slice(0, 100);

        await this.saveToStorage();
        this.notifySubscribers();

        console.log(`[FocusService] Recorded ${type} session: ${durationSeconds}s, interrupted: ${wasInterrupted}`);
    }

    public getSessions(limit: number = 20): FocusSession[] {
        return this.sessions.slice(0, limit);
    }

    public getTodaySessions(): FocusSession[] {
        const today = new Date().toDateString();
        return this.sessions.filter(
            (s) => s.completedAt.toDateString() === today
        );
    }

    // ============================================================================
    // Stats
    // ============================================================================

    public getStats(): FocusStats {
        const todaySessions = this.getTodaySessions();
        const focusSessions = this.sessions.filter((s) => s.type === "focus");
        const completedFocus = focusSessions.filter((s) => !s.wasInterrupted);

        // Calculate current streak (consecutive completed sessions)
        let streak = 0;
        for (const session of focusSessions) {
            if (!session.wasInterrupted) {
                streak++;
            } else {
                break;
            }
        }

        return {
            totalFocusMinutes: Math.round(
                focusSessions.reduce((acc, s) => acc + s.duration, 0) / 60
            ),
            totalSessions: focusSessions.length,
            completedSessions: completedFocus.length,
            currentStreak: streak,
            todayMinutes: Math.round(
                todaySessions
                    .filter((s) => s.type === "focus")
                    .reduce((acc, s) => acc + s.duration, 0) / 60
            ),
            todaySessions: todaySessions.filter((s) => s.type === "focus").length,
        };
    }

    // ============================================================================
    // Timer Helpers
    // ============================================================================

    public getDurationForType(type: SessionType): number {
        switch (type) {
            case "focus":
                return this.settings.focusDuration * 60; // seconds
            case "shortBreak":
                return this.settings.shortBreakDuration * 60;
            case "longBreak":
                return this.settings.longBreakDuration * 60;
        }
    }

    public getNextSessionType(completedFocusSessions: number): SessionType {
        if (completedFocusSessions > 0 && completedFocusSessions % this.settings.sessionsBeforeLongBreak === 0) {
            return "longBreak";
        }
        return "shortBreak";
    }

    // ============================================================================
    // Subscription
    // ============================================================================

    public subscribe(callback: () => void): () => void {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    private notifySubscribers(): void {
        this.subscribers.forEach((cb) => cb());
    }
}

// ============================================================================
// Exports
// ============================================================================

export const getFocusService = () => FocusService.getInstance();
export default FocusService;
