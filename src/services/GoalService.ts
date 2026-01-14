/**
 * GoalService - Manages user goals and progress tracking
 * Handles CRUD operations for goals with Appwrite backend
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApiService } from "./ApiService";

// ============================================================================
// Types
// ============================================================================

export type GoalType = "steps" | "sleep" | "focus" | "pvc" | "calories";

export interface Goal {
  id?: string;
  userId: string;
  type: GoalType;
  target: number;
  current: number;
  unit: string;
  isCompleted: boolean;
  lastUpdated: string;
}

export interface GoalProgress {
  type: GoalType;
  target: number;
  current: number;
  percentage: number;
  isCompleted: boolean;
  icon: string;
  color: string;
  label: string;
  unit: string;
}

export interface UserGoals {
  steps: number;
  sleep: number;
  focus: number;
  pvc: number;
  calories: number;
}

// Default goals for new users
const DEFAULT_GOALS: UserGoals = {
  steps: 10000,
  sleep: 8,
  focus: 120, // minutes
  pvc: 70,
  calories: 500,
};

// Goal metadata for display
const GOAL_META: Record<GoalType, { icon: string; color: string; label: string; unit: string }> = {
  steps: { icon: "👟", color: "#00E676", label: "Steps", unit: "steps" },
  sleep: { icon: "🌙", color: "#A459FF", label: "Sleep", unit: "hrs" },
  focus: { icon: "🎯", color: "#1AA0FF", label: "Focus", unit: "min" },
  pvc: { icon: "⚡", color: "#FFAB00", label: "PVC Score", unit: "" },
  calories: { icon: "🔥", color: "#FF6B6B", label: "Calories", unit: "cal" },
};

// Storage keys
const STORAGE_KEYS = {
  GOALS: "@timelens/goals",
  GOALS_LAST_SYNC: "@timelens/goals_last_sync",
};

// ============================================================================
// GoalService Class
// ============================================================================

class GoalService {
  private static instance: GoalService;
  private goals: UserGoals = { ...DEFAULT_GOALS };
  private subscribers: Set<() => void> = new Set();

  private constructor() {
    this.loadFromStorage();
  }

  public static getInstance(): GoalService {
    if (!GoalService.instance) {
      GoalService.instance = new GoalService();
    }
    return GoalService.instance;
  }

  // ============================================================================
  // Storage Methods
  // ============================================================================

  /**
   * Load goals from local storage
   */
  private async loadFromStorage(): Promise<void> {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEYS.GOALS);
      if (stored) {
        this.goals = { ...DEFAULT_GOALS, ...JSON.parse(stored) };
        console.log("[GoalService] Loaded goals from storage:", this.goals);
      }
    } catch (error) {
      console.error("[GoalService] Failed to load goals:", error);
    }
  }

  /**
   * Save goals to local storage and sync to Appwrite
   */
  private async saveToStorage(): Promise<void> {
    try {
      // Save locally first (fast)
      await AsyncStorage.setItem(STORAGE_KEYS.GOALS, JSON.stringify(this.goals));
      console.log("[GoalService] Saved goals to storage");

      // Sync to Appwrite in background (don't block)
      this.syncToCloud().catch((err) =>
        console.log("[GoalService] Cloud sync deferred:", err.message)
      );
    } catch (error) {
      console.error("[GoalService] Failed to save goals:", error);
    }
  }

  /**
   * Sync goals to Appwrite cloud
   */
  private async syncToCloud(): Promise<void> {
    const api = getApiService();
    if (!api.hasToken()) {
      console.log("[GoalService] Skipping cloud sync - not authenticated");
      return;
    }
    await api.saveUserGoals(this.goals);
  }

  /**
   * Sync goals FROM Appwrite cloud
   * Called on login to restore data
   */
  public async syncFromCloud(): Promise<void> {
    try {
      const api = getApiService();
      if (!api.hasToken()) {
        console.log("[GoalService] Skipping cloud sync - not authenticated");
        return;
      }
      const cloudGoals = await api.getUserGoals();

      if (cloudGoals) {
        console.log("[GoalService] Cloud goals found, overwriting local:", cloudGoals);
        this.goals = { ...this.goals, ...cloudGoals };
        await this.saveToStorage();
        this.notifySubscribers();
      } else {
        console.log("[GoalService] No cloud goals found, keeping local/defaults");
      }
    } catch (error) {
      console.error("[GoalService] Failed to sync from cloud:", error);
    }
  }

  // ============================================================================
  // Goal Management
  // ============================================================================

  /**
   * Get all goals
   */
  public getGoals(): UserGoals {
    return { ...this.goals };
  }

  /**
   * Get a specific goal target
   */
  public getGoal(type: GoalType): number {
    return this.goals[type];
  }

  /**
   * Update a goal target
   */
  public async setGoal(type: GoalType, target: number): Promise<void> {
    this.goals[type] = target;
    await this.saveToStorage();
    this.notifySubscribers();
    console.log(`[GoalService] Updated ${type} goal to ${target}`);
  }

  /**
   * Update multiple goals at once
   */
  public async setGoals(goals: Partial<UserGoals>): Promise<void> {
    this.goals = { ...this.goals, ...goals };
    await this.saveToStorage();
    this.notifySubscribers();
    console.log("[GoalService] Updated multiple goals");
  }

  /**
   * Reset goals to defaults
   */
  public async resetGoals(): Promise<void> {
    this.goals = { ...DEFAULT_GOALS };
    await this.saveToStorage();
    this.notifySubscribers();
    console.log("[GoalService] Reset goals to defaults");
  }

  // ============================================================================
  // Progress Calculation
  // ============================================================================

  /**
   * Calculate progress for all goals given current stats
   */
  public calculateProgress(currentStats: {
    steps: number;
    sleepHours: number | null;
    focusMinutes: number;
    pvcScore: number;
    activeCalories: number;
  }): GoalProgress[] {
    const progressList: GoalProgress[] = [];

    // Steps progress
    const stepsProgress = Math.min((currentStats.steps / this.goals.steps) * 100, 100);
    progressList.push({
      type: "steps",
      target: this.goals.steps,
      current: currentStats.steps,
      percentage: stepsProgress,
      isCompleted: stepsProgress >= 100,
      ...GOAL_META.steps,
    });

    // Sleep progress
    const sleepCurrent = currentStats.sleepHours ?? 0;
    const sleepProgress = Math.min((sleepCurrent / this.goals.sleep) * 100, 100);
    progressList.push({
      type: "sleep",
      target: this.goals.sleep,
      current: sleepCurrent,
      percentage: sleepProgress,
      isCompleted: sleepProgress >= 100,
      ...GOAL_META.sleep,
    });

    // Focus progress
    const focusProgress = Math.min((currentStats.focusMinutes / this.goals.focus) * 100, 100);
    progressList.push({
      type: "focus",
      target: this.goals.focus,
      current: currentStats.focusMinutes,
      percentage: focusProgress,
      isCompleted: focusProgress >= 100,
      ...GOAL_META.focus,
    });

    // PVC progress
    const pvcProgress = Math.min((currentStats.pvcScore / this.goals.pvc) * 100, 100);
    progressList.push({
      type: "pvc",
      target: this.goals.pvc,
      current: currentStats.pvcScore,
      percentage: pvcProgress,
      isCompleted: pvcProgress >= 100,
      ...GOAL_META.pvc,
    });

    // Calories progress
    const caloriesProgress = Math.min((currentStats.activeCalories / this.goals.calories) * 100, 100);
    progressList.push({
      type: "calories",
      target: this.goals.calories,
      current: currentStats.activeCalories,
      percentage: caloriesProgress,
      isCompleted: caloriesProgress >= 100,
      ...GOAL_META.calories,
    });

    return progressList;
  }

  /**
   * Update streaks based on goal progress
   * Called automatically when stats are refreshed
   */
  public async updateStreaksFromProgress(currentStats: {
    steps: number;
    sleepHours: number | null;
    focusMinutes: number;
    pvcScore: number;
    activeCalories: number;
  }): Promise<void> {
    // Import dynamically to avoid circular dependencies
    const { getStreakService } = await import("./StreakService");
    const streakService = getStreakService();

    const progress = this.calculateProgress(currentStats);

    // Update individual goal streaks
    for (const goal of progress) {
      // Only track steps, sleep, focus, pvc for streaks (not calories for now)
      if (goal.type === "calories") continue;

      // Record completion for this goal type
      await streakService.recordGoalCompletion(
        goal.type as "steps" | "sleep" | "focus" | "pvc",
        goal.isCompleted
      );
    }

    // Update overall streak
    const completedCount = progress.filter((p) => p.isCompleted).length;
    await streakService.updateOverallStreak(completedCount, progress.length);

    console.log(`[GoalService] Updated streaks - ${completedCount}/${progress.length} goals completed`);
  }

  /**
   * Count how many goals are completed
   */
  public countCompletedGoals(currentStats: {
    steps: number;
    sleepHours: number | null;
    focusMinutes: number;
    pvcScore: number;
    activeCalories: number;
  }): number {
    const progress = this.calculateProgress(currentStats);
    return progress.filter((p) => p.isCompleted).length;
  }

  // ============================================================================
  // Subscription Pattern
  // ============================================================================

  /**
   * Subscribe to goal changes
   */
  public subscribe(callback: () => void): () => void {
    this.subscribers.add(callback);
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Notify all subscribers of changes
   */
  private notifySubscribers(): void {
    this.subscribers.forEach((callback) => callback());
  }
}

// ============================================================================
// Exports
// ============================================================================

export const getGoalService = () => GoalService.getInstance();
export default GoalService;
