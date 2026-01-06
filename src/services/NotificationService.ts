/**
 * NotificationService - Local Push Notifications
 * Handles scheduling and managing notifications for TimeLens
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

// ============================================================================
// Types
// ============================================================================

export type NotificationType =
    | "morning_motivation"
    | "evening_summary"
    | "sedentary_reminder"
    | "focus_complete"
    | "streak_warning";

export interface NotificationSettings {
    enabled: boolean;
    morningMotivation: boolean;
    morningTime: { hour: number; minute: number };
    eveningSummary: boolean;
    eveningTime: { hour: number; minute: number };
    sedentaryReminder: boolean;
    sedentaryIntervalHours: number;
    focusComplete: boolean;
    streakWarning: boolean;
    streakWarningTime: { hour: number; minute: number };
    quietHoursEnabled: boolean;
    quietHoursStart: number; // 0-23
    quietHoursEnd: number;   // 0-23
}

const DEFAULT_SETTINGS: NotificationSettings = {
    enabled: true,
    morningMotivation: true,
    morningTime: { hour: 8, minute: 0 },
    eveningSummary: true,
    eveningTime: { hour: 20, minute: 0 },
    sedentaryReminder: false, // Disabled by default (can be annoying)
    sedentaryIntervalHours: 2,
    focusComplete: true,
    streakWarning: true,
    streakWarningTime: { hour: 21, minute: 0 },
    quietHoursEnabled: true,
    quietHoursStart: 22, // 10 PM
    quietHoursEnd: 7,     // 7 AM
};

const STORAGE_KEY = "@timelens/notification_settings";

// Notification identifiers for cancellation
const NOTIFICATION_IDS = {
    MORNING: "morning_motivation",
    EVENING: "evening_summary",
    STREAK_WARNING: "streak_warning",
};

// ============================================================================
// Configure Notifications Handler
// ============================================================================

Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

// ============================================================================
// NotificationService Class
// ============================================================================

class NotificationService {
    private static instance: NotificationService;
    private settings: NotificationSettings = { ...DEFAULT_SETTINGS };
    private hasPermission: boolean = false;
    private subscribers: Set<() => void> = new Set();

    private constructor() {
        this.loadSettings();
    }

    public static getInstance(): NotificationService {
        if (!NotificationService.instance) {
            NotificationService.instance = new NotificationService();
        }
        return NotificationService.instance;
    }

    // ============================================================================
    // Permissions
    // ============================================================================

    public async requestPermissions(): Promise<boolean> {
        if (Platform.OS === "android") {
            await Notifications.setNotificationChannelAsync("default", {
                name: "TimeLens",
                importance: Notifications.AndroidImportance.HIGH,
                vibrationPattern: [0, 250, 250, 250],
                lightColor: "#A459FF",
            });
        }

        const { status: existingStatus } = await Notifications.getPermissionsAsync();
        let finalStatus = existingStatus;

        if (existingStatus !== "granted") {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
        }

        this.hasPermission = finalStatus === "granted";

        if (this.hasPermission) {
            console.log("[NotificationService] Permissions granted");
            await this.scheduleAllNotifications();
        } else {
            console.log("[NotificationService] Permissions denied");
        }

        return this.hasPermission;
    }

    public async getPermissionStatus(): Promise<boolean> {
        const { status } = await Notifications.getPermissionsAsync();
        this.hasPermission = status === "granted";
        return this.hasPermission;
    }

    // ============================================================================
    // Settings Management
    // ============================================================================

    private async loadSettings(): Promise<void> {
        try {
            const json = await AsyncStorage.getItem(STORAGE_KEY);
            if (json) {
                this.settings = { ...DEFAULT_SETTINGS, ...JSON.parse(json) };
            }
            console.log("[NotificationService] Settings loaded");
        } catch (error) {
            console.error("[NotificationService] Failed to load settings:", error);
        }
    }

    private async saveSettings(): Promise<void> {
        try {
            await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(this.settings));
            console.log("[NotificationService] Settings saved");
        } catch (error) {
            console.error("[NotificationService] Failed to save settings:", error);
        }
    }

    public getSettings(): NotificationSettings {
        return { ...this.settings };
    }

    public async updateSettings(updates: Partial<NotificationSettings>): Promise<void> {
        this.settings = { ...this.settings, ...updates };
        await this.saveSettings();
        await this.scheduleAllNotifications();
        this.notifySubscribers();
    }

    // ============================================================================
    // Scheduling
    // ============================================================================

    /**
     * Schedule all recurring notifications based on settings
     */
    public async scheduleAllNotifications(): Promise<void> {
        if (!this.hasPermission || !this.settings.enabled) {
            await this.cancelAllNotifications();
            return;
        }

        // Cancel existing scheduled notifications first
        await Notifications.cancelAllScheduledNotificationsAsync();

        // Schedule morning motivation
        if (this.settings.morningMotivation) {
            await this.scheduleDailyNotification(
                NOTIFICATION_IDS.MORNING,
                "Good Morning! ☀️",
                "Ready to crush your goals today? Let's make it a great day!",
                this.settings.morningTime.hour,
                this.settings.morningTime.minute
            );
        }

        // Schedule evening summary
        if (this.settings.eveningSummary) {
            await this.scheduleDailyNotification(
                NOTIFICATION_IDS.EVENING,
                "Daily Summary 📊",
                "Check out how you did today and plan for tomorrow!",
                this.settings.eveningTime.hour,
                this.settings.eveningTime.minute
            );
        }

        // Schedule streak warning
        if (this.settings.streakWarning) {
            await this.scheduleDailyNotification(
                NOTIFICATION_IDS.STREAK_WARNING,
                "Streak Alert! 🔥",
                "Don't break your streak! There's still time to hit your goals.",
                this.settings.streakWarningTime.hour,
                this.settings.streakWarningTime.minute
            );
        }

        console.log("[NotificationService] All notifications scheduled");
    }

    /**
     * Schedule a daily recurring notification
     */
    private async scheduleDailyNotification(
        identifier: string,
        title: string,
        body: string,
        hour: number,
        minute: number
    ): Promise<void> {
        try {
            await Notifications.scheduleNotificationAsync({
                identifier,
                content: {
                    title,
                    body,
                    sound: true,
                    priority: Notifications.AndroidNotificationPriority.HIGH,
                },
                trigger: {
                    type: Notifications.SchedulableTriggerInputTypes.DAILY,
                    hour,
                    minute,
                },
            });
            console.log(`[NotificationService] Scheduled ${identifier} at ${hour}:${minute}`);
        } catch (error) {
            console.error(`[NotificationService] Failed to schedule ${identifier}:`, error);
        }
    }

    /**
     * Cancel all scheduled notifications
     */
    public async cancelAllNotifications(): Promise<void> {
        await Notifications.cancelAllScheduledNotificationsAsync();
        console.log("[NotificationService] All notifications cancelled");
    }

    // ============================================================================
    // Instant Notifications
    // ============================================================================

    /**
     * Send focus session complete notification
     */
    public async sendFocusCompleteNotification(
        sessionMinutes: number,
        isBreak: boolean
    ): Promise<void> {
        if (!this.hasPermission || !this.settings.focusComplete) return;
        if (this.isInQuietHours()) return;

        const title = isBreak ? "Break Complete! 🎯" : "Focus Session Done! 🎉";
        const body = isBreak
            ? "Ready to focus again? Let's get back to work!"
            : `Great job! You focused for ${sessionMinutes} minutes. Take a well-deserved break.`;

        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                sound: true,
            },
            trigger: null, // Immediate
        });
    }

    /**
     * Send streak at risk notification
     */
    public async sendStreakAtRiskNotification(
        currentStreak: number,
        goalsRemaining: number
    ): Promise<void> {
        if (!this.hasPermission || !this.settings.streakWarning) return;
        if (this.isInQuietHours()) return;

        await Notifications.scheduleNotificationAsync({
            content: {
                title: `Your ${currentStreak}-Day Streak is at Risk! ⚠️`,
                body: `Complete ${goalsRemaining} more goal${goalsRemaining > 1 ? "s" : ""} to keep your streak alive.`,
                sound: true,
            },
            trigger: null,
        });
    }

    /**
     * Send custom motivation notification
     */
    public async sendMotivationNotification(
        title: string,
        body: string
    ): Promise<void> {
        if (!this.hasPermission) return;
        if (this.isInQuietHours()) return;

        await Notifications.scheduleNotificationAsync({
            content: {
                title,
                body,
                sound: true,
            },
            trigger: null,
        });
    }

    // ============================================================================
    // Quiet Hours
    // ============================================================================

    private isInQuietHours(): boolean {
        if (!this.settings.quietHoursEnabled) return false;

        const now = new Date();
        const currentHour = now.getHours();
        const { quietHoursStart, quietHoursEnd } = this.settings;

        // Handle overnight quiet hours (e.g., 22:00 - 07:00)
        if (quietHoursStart > quietHoursEnd) {
            return currentHour >= quietHoursStart || currentHour < quietHoursEnd;
        }

        return currentHour >= quietHoursStart && currentHour < quietHoursEnd;
    }

    // ============================================================================
    // Subscription Pattern
    // ============================================================================

    public subscribe(callback: () => void): () => void {
        this.subscribers.add(callback);
        return () => this.subscribers.delete(callback);
    }

    private notifySubscribers(): void {
        this.subscribers.forEach((cb) => cb());
    }

    // ============================================================================
    // Debug Helpers
    // ============================================================================

    public async getScheduledNotifications(): Promise<Notifications.NotificationRequest[]> {
        return await Notifications.getAllScheduledNotificationsAsync();
    }
}

// ============================================================================
// Exports
// ============================================================================

export const getNotificationService = () => NotificationService.getInstance();
export default NotificationService;
