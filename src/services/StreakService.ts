/**
 * StreakService - Tracks consecutive days of goal completion
 * Manages streak data with local storage and Appwrite sync
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getAppwriteService } from "./AppwriteService";

// ============================================================================
// Types
// ============================================================================

export type StreakType = "steps" | "sleep" | "focus" | "pvc" | "overall";

export interface Streak {
    type: StreakType;
    currentStreak: number;
    longestStreak: number;
    lastActiveDate: string; // YYYY-MM-DD format
    isActiveToday: boolean;
}

export interface StreakData {
    steps: Streak;
    sleep: Streak;
    focus: Streak;
    pvc: Streak;
    overall: Streak;
}

export interface DailyLog {
    date: string; // YYYY-MM-DD
    steps: number;
    sleepHours: number | null;
    focusMinutes: number;
    pvcScore: number;
    activeCalories: number;
    goalsMetCount: number;
}

// Streak metadata for display
const STREAK_META: Record<StreakType, { icon: string; color: string; label: string }> = {
    steps: { icon: "👟", color: "#00E676", label: "Steps Streak" },
    sleep: { icon: "🌙", color: "#A459FF", label: "Sleep Streak" },
    focus: { icon: "🎯", color: "#1AA0FF", label: "Focus Streak" },
    pvc: { icon: "⚡", color: "#FFAB00", label: "PVC Streak" },
    overall: { icon: "🔥", color: "#FF6B6B", label: "Overall Streak" },
};

// Storage keys
const STORAGE_KEYS = {
    STREAKS: "@timelens/streaks",
    DAILY_LOGS: "@timelens/daily_logs",
};

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Get today's date in YYYY-MM-DD format
 */
const getTodayDate = (): string => {
    return new Date().toISOString().split("T")[0];
};

/**
 * Get yesterday's date in YYYY-MM-DD format
 */
const getYesterdayDate = (): string => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split("T")[0];
};

/**
 * Create a default streak object
 */
const createDefaultStreak = (type: StreakType): Streak => ({
    type,
    currentStreak: 0,
    longestStreak: 0,
    lastActiveDate: "",
    isActiveToday: false,
});

// ============================================================================
// StreakService Class
// ============================================================================

class StreakService {
    private static instance: StreakService;
    private streaks: StreakData;
    private dailyLogs: DailyLog[] = [];
    private subscribers: Set<() => void> = new Set();

    private constructor() {
        this.streaks = {
            steps: createDefaultStreak("steps"),
            sleep: createDefaultStreak("sleep"),
            focus: createDefaultStreak("focus"),
            pvc: createDefaultStreak("pvc"),
            overall: createDefaultStreak("overall"),
        };
        this.loadFromStorage();
    }

    public static getInstance(): StreakService {
        if (!StreakService.instance) {
            StreakService.instance = new StreakService();
        }
        return StreakService.instance;
    }

    // ============================================================================
    // Storage Methods
    // ============================================================================

    /**
     * Load streaks and logs from local storage
     */
    private async loadFromStorage(): Promise<void> {
        try {
            const [streaksJson, logsJson] = await Promise.all([
                AsyncStorage.getItem(STORAGE_KEYS.STREAKS),
                AsyncStorage.getItem(STORAGE_KEYS.DAILY_LOGS),
            ]);

            if (streaksJson) {
                const stored = JSON.parse(streaksJson);
                this.streaks = {
                    steps: { ...createDefaultStreak("steps"), ...stored.steps },
                    sleep: { ...createDefaultStreak("sleep"), ...stored.sleep },
                    focus: { ...createDefaultStreak("focus"), ...stored.focus },
                    pvc: { ...createDefaultStreak("pvc"), ...stored.pvc },
                    overall: { ...createDefaultStreak("overall"), ...stored.overall },
                };
            }

            if (logsJson) {
                this.dailyLogs = JSON.parse(logsJson);
            }

            // Check if streaks are still valid (not broken by missed days)
            this.validateStreaks();

            console.log("[StreakService] Loaded from storage:", this.streaks);
        } catch (error) {
            console.error("[StreakService] Failed to load from storage:", error);
        }
    }

    /**
     * Save streaks and logs to local storage and sync to Appwrite
     */
    private async saveToStorage(): Promise<void> {
        try {
            // Save locally first (fast)
            await Promise.all([
                AsyncStorage.setItem(STORAGE_KEYS.STREAKS, JSON.stringify(this.streaks)),
                AsyncStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(this.dailyLogs)),
            ]);
            console.log("[StreakService] Saved to storage");

            // Sync to Appwrite in background (don't block)
            this.syncToCloud().catch((err) =>
                console.log("[StreakService] Cloud sync deferred:", err.message)
            );
        } catch (error) {
            console.error("[StreakService] Failed to save to storage:", error);
        }
    }

    /**
     * Sync streaks and logs FROM Appwrite cloud
     */
    public async syncFromCloud(): Promise<void> {
        try {
            const appwrite = getAppwriteService();

            // 1. Get streaks
            const cloudStreaks = await appwrite.getStreaks();
            if (cloudStreaks) {
                console.log("[StreakService] Cloud streaks found, merging...");
                this.streaks = {
                    steps: { ...this.streaks.steps, ...cloudStreaks.steps },
                    sleep: { ...this.streaks.sleep, ...cloudStreaks.sleep },
                    focus: { ...this.streaks.focus, ...cloudStreaks.focus },
                    pvc: { ...this.streaks.pvc, ...cloudStreaks.pvc },
                    overall: { ...this.streaks.overall, ...cloudStreaks.overall },
                };
                this.validateStreaks();
            }

            // 2. Get daily logs
            const cloudLogs = await appwrite.getDailyLogs(90);
            if (cloudLogs.length > 0) {
                console.log(`[StreakService] Found ${cloudLogs.length} cloud logs, updating local`);
                // For now, simpler to overwrite local logs with cloud source of truth on restore
                this.dailyLogs = cloudLogs;
            }

            await this.saveToStorage();
            this.notifySubscribers();

        } catch (error) {
            console.error("[StreakService] Failed to sync from cloud:", error);
        }
    }

    /**
     * Sync streaks and logs to Appwrite cloud
     */
    private async syncToCloud(): Promise<void> {
        const appwrite = getAppwriteService();

        // Convert StreakData to Appwrite format
        const streaksForAppwrite = {
            steps: {
                currentStreak: this.streaks.steps.currentStreak,
                longestStreak: this.streaks.steps.longestStreak,
                lastActiveDate: this.streaks.steps.lastActiveDate,
            },
            sleep: {
                currentStreak: this.streaks.sleep.currentStreak,
                longestStreak: this.streaks.sleep.longestStreak,
                lastActiveDate: this.streaks.sleep.lastActiveDate,
            },
            focus: {
                currentStreak: this.streaks.focus.currentStreak,
                longestStreak: this.streaks.focus.longestStreak,
                lastActiveDate: this.streaks.focus.lastActiveDate,
            },
            pvc: {
                currentStreak: this.streaks.pvc.currentStreak,
                longestStreak: this.streaks.pvc.longestStreak,
                lastActiveDate: this.streaks.pvc.lastActiveDate,
            },
            overall: {
                currentStreak: this.streaks.overall.currentStreak,
                longestStreak: this.streaks.overall.longestStreak,
                lastActiveDate: this.streaks.overall.lastActiveDate,
            },
        };

        await appwrite.saveStreaks(streaksForAppwrite);
    }

    /**
     * Sync daily log to Appwrite
     */
    private async syncDailyLogToCloud(log: DailyLog): Promise<void> {
        const appwrite = getAppwriteService();
        await appwrite.saveDailyLog(log);
    }

    // ============================================================================
    // Streak Validation
    // ============================================================================

    /**
     * Validate streaks - reset if days were missed
     */
    private validateStreaks(): void {
        const today = getTodayDate();
        const yesterday = getYesterdayDate();

        (Object.keys(this.streaks) as StreakType[]).forEach((type) => {
            const streak = this.streaks[type];

            // Reset isActiveToday at start of new day
            if (streak.lastActiveDate !== today) {
                streak.isActiveToday = false;
            }

            // If last active was before yesterday, streak is broken
            if (streak.lastActiveDate && streak.lastActiveDate !== today && streak.lastActiveDate !== yesterday) {
                console.log(`[StreakService] ${type} streak broken - last active: ${streak.lastActiveDate}`);
                streak.currentStreak = 0;
            }
        });
    }

    // ============================================================================
    // Streak Management
    // ============================================================================

    /**
     * Get all streaks
     */
    public getStreaks(): StreakData {
        return { ...this.streaks };
    }

    /**
     * Get a specific streak
     */
    public getStreak(type: StreakType): Streak {
        return { ...this.streaks[type] };
    }

    /**
     * Get streak metadata
     */
    public getStreakMeta(type: StreakType): { icon: string; color: string; label: string } {
        return STREAK_META[type];
    }

    /**
     * Record goal completion for today
     */
    public async recordGoalCompletion(type: StreakType, completed: boolean): Promise<void> {
        const today = getTodayDate();
        const streak = this.streaks[type];

        if (completed && !streak.isActiveToday) {
            // First completion of this goal type today
            if (streak.lastActiveDate === getYesterdayDate()) {
                // Continuing streak from yesterday
                streak.currentStreak += 1;
            } else if (streak.lastActiveDate !== today) {
                // Starting new streak
                streak.currentStreak = 1;
            }

            streak.lastActiveDate = today;
            streak.isActiveToday = true;

            // Update longest streak
            if (streak.currentStreak > streak.longestStreak) {
                streak.longestStreak = streak.currentStreak;
            }

            console.log(`[StreakService] ${type} streak: ${streak.currentStreak} (longest: ${streak.longestStreak})`);
        }

        await this.saveToStorage();
        this.notifySubscribers();
    }

    /**
     * Update overall streak based on goals met
     */
    public async updateOverallStreak(goalsMetCount: number, totalGoals: number): Promise<void> {
        // Overall streak requires meeting at least half of goals
        const threshold = Math.ceil(totalGoals / 2);
        await this.recordGoalCompletion("overall", goalsMetCount >= threshold);
    }

    // ============================================================================
    // Daily Logs
    // ============================================================================

    /**
     * Save daily log
     */
    public async saveDailyLog(log: Omit<DailyLog, "date">): Promise<void> {
        const today = getTodayDate();

        // Find existing log for today
        const existingIndex = this.dailyLogs.findIndex((l) => l.date === today);

        const fullLog: DailyLog = { ...log, date: today };

        if (existingIndex >= 0) {
            this.dailyLogs[existingIndex] = fullLog;
        } else {
            this.dailyLogs.unshift(fullLog);
        }

        // Keep only last 90 days
        this.dailyLogs = this.dailyLogs.slice(0, 90);

        await this.saveToStorage();
        console.log("[StreakService] Saved daily log for", today);

        // Sync this specific log to cloud
        this.syncDailyLogToCloud(fullLog).catch((err) =>
            console.log("[StreakService] Daily log cloud sync deferred:", err.message)
        );
    }

    /**
     * Get daily logs for the past N days
     */
    public getDailyLogs(days: number = 7): DailyLog[] {
        return this.dailyLogs.slice(0, days);
    }

    /**
     * Get logs for a specific month (for calendar heatmap)
     */
    public getMonthLogs(year: number, month: number): DailyLog[] {
        const monthStr = `${year}-${String(month + 1).padStart(2, "0")}`;
        return this.dailyLogs.filter((log) => log.date.startsWith(monthStr));
    }

    /**
     * Get today's log
     */
    public getTodayLog(): DailyLog | null {
        const today = getTodayDate();
        return this.dailyLogs.find((log) => log.date === today) || null;
    }

    // ============================================================================
    // Subscription Pattern
    // ============================================================================

    /**
     * Subscribe to streak changes
     */
    public subscribe(callback: () => void): () => void {
        this.subscribers.add(callback);
        return () => {
            this.subscribers.delete(callback);
        };
    }

    /**
     * Notify all subscribers
     */
    private notifySubscribers(): void {
        this.subscribers.forEach((callback) => callback());
    }
}

// ============================================================================
// Exports
// ============================================================================

export const getStreakService = () => StreakService.getInstance();
export default StreakService;
