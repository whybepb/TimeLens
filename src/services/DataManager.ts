/**
 * DataManager - Singleton Service for TimeLens
 * Manages user health and screen time statistics
 * Uses the Singleton Pattern for centralized state management
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { getHealthService, HealthData } from "./HealthService";
import { syncWidgetWithStats } from "./WidgetService";

// Types for user statistics
export interface UserStats {
  // Health Data (from Apple HealthKit)
  steps: number;
  sleepHours: number;
  activeCalories: number;

  // Screen Time Data (from DeviceActivity API)
  focusTimeMinutes: number;      // Deep work / focus time
  socialMediaMinutes: number;    // Social media usage
  totalScreenTimeMinutes: number;
  pickups: number;

  // Timestamps
  lastUpdated: Date;
}

export interface PVCResult {
  score: number;           // 0-100 clamped
  rawScore: number;        // Unclamped calculation result
  breakdown: {
    stepsContribution: number;
    focusContribution: number;
    socialMediaPenalty: number;
  };
  level: 'peak' | 'high' | 'moderate' | 'low' | 'rest';
}

type Subscriber = (stats: UserStats, pvc: PVCResult) => void;

// AsyncStorage key for persisting user stats
const STORAGE_KEY = '@TimeLens:UserStats';

class DataManager {
  private static instance: DataManager;
  private subscribers: Set<Subscriber> = new Set();
  private _userStats: UserStats;
  private isInitializing: boolean = false;

  private constructor() {
    // Initialize with dummy data temporarily
    // Real data will be loaded from AsyncStorage or fetched fresh
    this._userStats = this.getDummyData();

    // Load persisted data and auto-refresh
    this.initializeData();
  }

  /**
   * Get the singleton instance of DataManager
   */
  public static getInstance(): DataManager {
    if (!DataManager.instance) {
      DataManager.instance = new DataManager();
    }
    return DataManager.instance;
  }

  /**
   * Get dummy data for development/testing
   * TODO: Replace with real API calls to HealthKit and DeviceActivity
   */
  private getDummyData(): UserStats {
    return {
      // Dummy health data
      // TODO: Fetch from react-native-health / HealthKit API
      steps: 6234,
      sleepHours: 7.2,
      activeCalories: 320,

      // Dummy screen time data
      // TODO: Fetch from DeviceActivity Framework API (iOS 15+)
      focusTimeMinutes: 165,        // 2h 45m of focus/deep work
      socialMediaMinutes: 45,       // 45 mins social media
      totalScreenTimeMinutes: 280,  // ~4.5 hours total
      pickups: 42,

      lastUpdated: new Date(),
    };
  }

  /**
   * Calculate the Productivity-Vitality Score (PVC)
   * Formula: (Steps/100) + (DeepWorkMinutes/10) - (SocialMediaMinutes/5)
   * Result is clamped between 0-100
   */
  public calculatePVC(): PVCResult {
    const { steps, focusTimeMinutes, socialMediaMinutes } = this._userStats;

    // Calculate individual contributions
    const stepsContribution = steps / 100;
    const focusContribution = focusTimeMinutes / 10;
    const socialMediaPenalty = socialMediaMinutes / 5;

    // Raw score calculation
    const rawScore = stepsContribution + focusContribution - socialMediaPenalty;

    // Clamp to 0-100 range
    const score = Math.max(0, Math.min(100, rawScore));

    // Determine energy level
    const level = this.getEnergyLevel(score);

    return {
      score,
      rawScore,
      breakdown: {
        stepsContribution,
        focusContribution,
        socialMediaPenalty,
      },
      level,
    };
  }

  /**
   * Get energy level label based on score
   */
  private getEnergyLevel(score: number): PVCResult['level'] {
    if (score >= 80) return 'peak';
    if (score >= 60) return 'high';
    if (score >= 40) return 'moderate';
    if (score >= 20) return 'low';
    return 'rest';
  }

  /**
   * Get current user stats
   */
  public getUserStats(): UserStats {
    return { ...this._userStats };
  }

  /**
   * Update user stats (partial update supported)
   */
  public updateStats(newStats: Partial<UserStats>): void {
    this._userStats = {
      ...this._userStats,
      ...newStats,
      lastUpdated: new Date(),
    };
    this.notifySubscribers();

    // Persist to AsyncStorage (fire and forget)
    this.persistData().catch((error) => {
      console.error('[DataManager] Failed to persist data after update:', error);
    });
  }

  /**
   * Subscribe to data changes
   */
  public subscribe(callback: Subscriber): () => void {
    this.subscribers.add(callback);

    // Immediately call with current data
    callback(this.getUserStats(), this.calculatePVC());

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Notify all subscribers of data changes
   */
  private notifySubscribers(): void {
    const stats = this.getUserStats();
    const pvc = this.calculatePVC();
    this.subscribers.forEach((callback) => callback(stats, pvc));

    // Sync data with iOS widget
    this.syncToWidget(stats, pvc);
  }

  /**
   * Sync current data to iOS Home Screen Widget
   */
  private syncToWidget(stats: UserStats, pvc: PVCResult): void {
    syncWidgetWithStats({
      score: pvc.score,
      steps: stats.steps,
      focusTimeMinutes: stats.focusTimeMinutes,
    }).catch((error) => {
      console.error("[DataManager] Widget sync failed:", error);
    });
  }

  /**
   * Initialize data from AsyncStorage and fetch fresh data
   * Called automatically when DataManager is created
   */
  private async initializeData(): Promise<void> {
    if (this.isInitializing) return; // Prevent duplicate initialization
    this.isInitializing = true;

    try {
      console.log('[DataManager] Initializing data...');

      // 1. Try to load persisted data first (fast)
      const persistedData = await this.loadPersistedData();
      if (persistedData) {
        console.log('[DataManager] Loaded persisted data:', persistedData);
        this._userStats = persistedData;
        this.notifySubscribers();
      }

      // 2. Then fetch fresh data in the background (slower but accurate)
      await this.refreshData();

    } catch (error) {
      console.error('[DataManager] Initialization error:', error);
    } finally {
      this.isInitializing = false;
    }
  }

  /**
   * Load persisted user stats from AsyncStorage
   */
  private async loadPersistedData(): Promise<UserStats | null> {
    try {
      const jsonData = await AsyncStorage.getItem(STORAGE_KEY);
      if (!jsonData) {
        console.log('[DataManager] No persisted data found');
        return null;
      }

      const parsed = JSON.parse(jsonData);
      // Convert lastUpdated back to Date object
      parsed.lastUpdated = new Date(parsed.lastUpdated);

      console.log('[DataManager] Successfully loaded persisted data');
      return parsed as UserStats;
    } catch (error) {
      console.error('[DataManager] Error loading persisted data:', error);
      return null;
    }
  }

  /**
   * Persist current user stats to AsyncStorage
   */
  private async persistData(): Promise<void> {
    try {
      const jsonData = JSON.stringify(this._userStats);
      await AsyncStorage.setItem(STORAGE_KEY, jsonData);
      console.log('[DataManager] Data persisted to AsyncStorage');
    } catch (error) {
      console.error('[DataManager] Error persisting data:', error);
    }
  }


  /**
   * Refresh all data from native APIs
   * Fetches real HealthKit data when available
   */
  public async refreshData(): Promise<void> {
    console.log('[DataManager] Refreshing data...');

    try {
      // Fetch real HealthKit data
      const healthService = getHealthService();
      let permissionStatus = healthService.getPermissionStatus();

      // If permission status is unknown, try to initialize HealthKit
      // This happens on app restart when the singleton resets
      if (permissionStatus === 'unknown') {
        console.log('[DataManager] Permission status unknown, trying to initialize HealthKit...');
        permissionStatus = await healthService.requestPermissions();
        console.log('[DataManager] HealthKit initialization result:', permissionStatus);
      }

      if (permissionStatus === 'granted') {
        console.log('[DataManager] Fetching real HealthKit data...');
        const healthData: HealthData = await healthService.getAllHealthData();

        // Update stats with real health data
        this.updateStats({
          steps: healthData.steps,
          sleepHours: healthData.sleepHours ?? this._userStats.sleepHours,
          activeCalories: healthData.activeCalories,
        });

        console.log('[DataManager] Real health data loaded:', healthData);
      } else {
        console.log('[DataManager] HealthKit not authorized (status:', permissionStatus, '), using dummy data');
        // Simulate refresh with slightly modified dummy data
        const currentStats = this.getUserStats();
        this.updateStats({
          steps: currentStats.steps + Math.floor(Math.random() * 100),
          pickups: currentStats.pickups + Math.floor(Math.random() * 3),
        });
      }

      // Update streaks based on current progress
      const { getGoalService } = await import('./GoalService');
      const goalService = getGoalService();
      const currentStats = this.getUserStats();
      const pvcResult = this.calculatePVC();

      await goalService.updateStreaksFromProgress({
        steps: currentStats.steps,
        sleepHours: currentStats.sleepHours,
        focusMinutes: currentStats.focusTimeMinutes,
        pvcScore: pvcResult.score,
        activeCalories: currentStats.activeCalories,
      });

      // Save daily log for historical tracking
      const { getStreakService } = await import('./StreakService');
      const streakService = getStreakService();
      const completedGoals = goalService.countCompletedGoals({
        steps: currentStats.steps,
        sleepHours: currentStats.sleepHours,
        focusMinutes: currentStats.focusTimeMinutes,
        pvcScore: pvcResult.score,
        activeCalories: currentStats.activeCalories,
      });

      await streakService.saveDailyLog({
        steps: currentStats.steps,
        sleepHours: currentStats.sleepHours,
        focusMinutes: currentStats.focusTimeMinutes,
        pvcScore: Math.round(pvcResult.score), // Must be integer for Appwrite
        activeCalories: currentStats.activeCalories,
        goalsMetCount: completedGoals,
      });

      console.log('[DataManager] Streaks and daily log updated');

    } catch (error) {
      console.error('[DataManager] Error refreshing data:', error);
    }

    console.log('[DataManager] Data refreshed at:', new Date().toISOString());
  }

  /**
   * Request necessary permissions for health and screen time data
   */
  public async requestPermissions(): Promise<{ health: boolean; screenTime: boolean }> {
    console.log('[DataManager] Requesting permissions...');

    // Request HealthKit permissions
    const healthService = getHealthService();
    const healthStatus = await healthService.requestPermissions();
    const healthGranted = healthStatus === 'granted';

    console.log('[DataManager] HealthKit permission:', healthStatus);

    // Screen Time / DeviceActivity requires paid developer account
    // For now, we'll return false for screenTime
    const screenTimeGranted = false;

    // If health permissions granted, fetch initial data
    if (healthGranted) {
      await this.refreshData();
    }

    return { health: healthGranted, screenTime: screenTimeGranted };
  }

  /**
   * Generate a coach insight based on current data
   */
  public generateInsight(): string {
    const stats = this.getUserStats();
    const pvc = this.calculatePVC();

    // Simple rule-based insights
    if (stats.steps < 5000) {
      return "Your physical activity is low today. A 10-minute walk will boost your cognitive score.";
    }
    if (stats.socialMediaMinutes > 60) {
      return "High social media usage detected. Consider a digital detox break to improve focus.";
    }
    if (stats.focusTimeMinutes > 120 && stats.steps < 3000) {
      return "Great focus session! Time to stretch and move - your body will thank you.";
    }
    if (pvc.score >= 80) {
      return "You're in peak performance mode! Keep up the excellent balance of activity and focus.";
    }
    if (stats.sleepHours < 7) {
      return "Sleep debt detected. Prioritize rest tonight to restore your vitality score.";
    }

    return "You're on track! Maintain your current balance of physical and digital activity.";
  }
}

// Export singleton instance getter
export const getDataManager = () => DataManager.getInstance();

export default DataManager;
