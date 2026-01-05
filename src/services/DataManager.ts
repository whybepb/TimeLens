/**
 * DataManager - Singleton Service for TimeLens
 * Manages user health and screen time statistics
 * Uses the Singleton Pattern for centralized state management
 */

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

class DataManager {
  private static instance: DataManager;
  private subscribers: Set<Subscriber> = new Set();
  private _userStats: UserStats;

  private constructor() {
    // Initialize with dummy data
    // TODO: Load persisted data from AsyncStorage on init
    this._userStats = this.getDummyData();
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
  }

  /**
   * Refresh all data from native APIs
   * TODO: Implement actual API calls
   */
  public async refreshData(): Promise<void> {
    // TODO: Implement HealthKit data fetch
    // const healthData = await HealthKitService.fetchTodayStats();
    
    // TODO: Implement DeviceActivity data fetch
    // const screenTimeData = await DeviceActivityService.fetchTodayStats();

    // For now, simulate a refresh with slightly modified dummy data
    const currentStats = this.getUserStats();
    this.updateStats({
      steps: currentStats.steps + Math.floor(Math.random() * 100),
      pickups: currentStats.pickups + Math.floor(Math.random() * 3),
    });

    console.log('[DataManager] Data refreshed at:', new Date().toISOString());
  }

  /**
   * Request necessary permissions for health and screen time data
   * TODO: Implement permission requests
   */
  public async requestPermissions(): Promise<{ health: boolean; screenTime: boolean }> {
    // TODO: Request HealthKit permissions
    // const healthPermission = await HealthKitService.requestPermissions([
    //   'Steps', 'SleepAnalysis', 'ActiveEnergyBurned'
    // ]);

    // TODO: Request Screen Time / DeviceActivity permissions
    // Note: DeviceActivity requires Family Controls entitlement
    // const screenTimePermission = await DeviceActivityService.requestAuthorization();

    console.log('[DataManager] Permission request - using dummy grants');
    return { health: true, screenTime: true };
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
