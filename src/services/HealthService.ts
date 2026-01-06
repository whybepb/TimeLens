/**
 * HealthService - Apple HealthKit Integration
 * Fetches real health data from the user's iPhone
 */

import AppleHealthKit, {
  HealthKitPermissions,
  HealthValue,
  HealthInputOptions,
} from "react-native-health";
import { NativeModules } from "react-native";

// Debug: Log what AppleHealthKit actually is
console.log("[HealthService] AppleHealthKit module:", AppleHealthKit);
console.log("[HealthService] AppleHealthKit type:", typeof AppleHealthKit);
console.log("[HealthService] AppleHealthKit keys:", AppleHealthKit ? Object.keys(AppleHealthKit) : "null/undefined");
console.log("[HealthService] isAvailable type:", typeof AppleHealthKit?.isAvailable);
console.log("[HealthService] initHealthKit type:", typeof AppleHealthKit?.initHealthKit);

// Try to get the native module directly
const NativeHealthKit = NativeModules.AppleHealthKit;
console.log("[HealthService] NativeModules.AppleHealthKit:", NativeHealthKit);
console.log("[HealthService] NativeHealthKit keys:", NativeHealthKit ? Object.keys(NativeHealthKit) : "null/undefined");

// Check if native module is available
const isNativeModuleAvailable = typeof NativeHealthKit?.isAvailable === "function";
console.log("[HealthService] Native module available:", isNativeModuleAvailable);

// ============================================================================
// Types
// ============================================================================

export interface HealthData {
  steps: number;
  sleepHours: number | null; // null means no data available (no Apple Watch/manual entry)
  activeCalories: number;
  lastUpdated: Date;
  sleepDataSource?: "watch" | "manual" | "none"; // Track where sleep data comes from
}

export type HealthPermissionStatus = "unknown" | "granted" | "denied" | "unavailable";

// ============================================================================
// Permissions Configuration
// ============================================================================

const HEALTH_PERMISSIONS: HealthKitPermissions = {
  permissions: {
    read: [
      AppleHealthKit.Constants.Permissions.Steps,
      AppleHealthKit.Constants.Permissions.SleepAnalysis,
      AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
      AppleHealthKit.Constants.Permissions.DistanceWalkingRunning,
    ],
    write: [], // We only read, don't write
  },
};

// ============================================================================
// HealthService Class
// ============================================================================

class HealthService {
  private static instance: HealthService;
  private isInitialized: boolean = false;
  private permissionStatus: HealthPermissionStatus = "unknown";

  private constructor() {}

  /**
   * Get the singleton instance
   */
  public static getInstance(): HealthService {
    if (!HealthService.instance) {
      HealthService.instance = new HealthService();
    }
    return HealthService.instance;
  }

  /**
   * Check if HealthKit is available on this device
   */
  public isAvailable(): Promise<boolean> {
    return new Promise((resolve) => {
      // Check if native module is available
      if (!isNativeModuleAvailable) {
        console.log("[HealthService] Native module not available - need to rebuild the app");
        console.log("[HealthService] Run: npx expo run:ios");
        resolve(false);
        return;
      }
      
      NativeHealthKit.isAvailable((error: any, available: boolean) => {
        if (error) {
          console.log("[HealthService] Availability check error:", error);
          resolve(false);
          return;
        }
        resolve(available);
      });
    });
  }

  /**
   * Request HealthKit permissions
   * Returns the permission status after the request
   */
  public async requestPermissions(): Promise<HealthPermissionStatus> {
    const available = await this.isAvailable();
    
    if (!available) {
      console.log("[HealthService] HealthKit not available on this device");
      this.permissionStatus = "unavailable";
      return "unavailable";
    }

    return new Promise((resolve) => {
      NativeHealthKit.initHealthKit(HEALTH_PERMISSIONS, (error: any) => {
        if (error) {
          console.log("[HealthService] Permission denied:", error);
          this.permissionStatus = "denied";
          this.isInitialized = false;
          resolve("denied");
          return;
        }

        console.log("[HealthService] Permissions granted!");
        this.permissionStatus = "granted";
        this.isInitialized = true;
        resolve("granted");
      });
    });
  }

  /**
   * Get current permission status
   */
  public getPermissionStatus(): HealthPermissionStatus {
    return this.permissionStatus;
  }

  /**
   * Fetch today's step count
   */
  public async getStepsToday(): Promise<number> {
    if (!this.isInitialized) {
      console.log("[HealthService] Not initialized, returning 0 steps");
      return 0;
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const options: HealthInputOptions = {
      startDate: startOfDay.toISOString(),
      endDate: now.toISOString(),
    };

    return new Promise((resolve) => {
      NativeHealthKit.getStepCount(options, (error: any, results: any) => {
        if (error) {
          console.log("[HealthService] Error fetching steps:", error);
          resolve(0);
          return;
        }

        const steps = Math.round(results?.value || 0);
        console.log("[HealthService] Today's steps:", steps);
        resolve(steps);
      });
    });
  }

  /**
   * Fetch last night's sleep hours
   * Returns null if no sleep data is available (requires Apple Watch or manual entry)
   */
  public async getSleepHours(): Promise<number | null> {
    if (!this.isInitialized) {
      console.log("[HealthService] Not initialized, returning null for sleep hours");
      return null;
    }

    // Get sleep data from the last 24 hours
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    const options: HealthInputOptions = {
      startDate: yesterday.toISOString(),
      endDate: now.toISOString(),
    };

    return new Promise((resolve) => {
      NativeHealthKit.getSleepSamples(options, (error: any, results: any) => {
        if (error) {
          console.log("[HealthService] Error fetching sleep:", error);
          // Return null to indicate no data, not 0 hours of sleep
          resolve(null);
          return;
        }

        if (!results || results.length === 0) {
          console.log("[HealthService] No sleep data found - Apple Watch or manual entry required");
          // Return null to distinguish "no data" from "0 hours slept"
          resolve(null);
          return;
        }

        // Calculate total sleep time from samples
        // Filter for "ASLEEP" values (not "INBED")
        let totalSleepMinutes = 0;

        results.forEach((sample: any) => {
          // Only count actual sleep, not "in bed" time
          if (sample.value === "ASLEEP" || sample.value === "CORE" || 
              sample.value === "DEEP" || sample.value === "REM") {
            const start = new Date(sample.startDate);
            const end = new Date(sample.endDate);
            const durationMinutes = (end.getTime() - start.getTime()) / (1000 * 60);
            totalSleepMinutes += durationMinutes;
          }
        });

        const sleepHours = Math.round((totalSleepMinutes / 60) * 10) / 10; // Round to 1 decimal
        console.log("[HealthService] Last night's sleep:", sleepHours, "hours");
        resolve(sleepHours);
      });
    });
  }

  /**
   * Check if user has sleep tracking capability (Apple Watch paired)
   */
  public async hasSleepTrackingCapability(): Promise<boolean> {
    // Try to fetch any sleep data from the past week to determine if user has sleep tracking
    const now = new Date();
    const lastWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const options: HealthInputOptions = {
      startDate: lastWeek.toISOString(),
      endDate: now.toISOString(),
    };

    return new Promise((resolve) => {
      if (!this.isInitialized) {
        resolve(false);
        return;
      }

      NativeHealthKit.getSleepSamples(options, (error: any, results: any) => {
        if (error || !results || results.length === 0) {
          console.log("[HealthService] No sleep tracking capability detected");
          resolve(false);
          return;
        }
        console.log("[HealthService] Sleep tracking capability confirmed");
        resolve(true);
      });
    });
  }

  /**
   * Fetch today's active calories burned
   */
  public async getActiveCalories(): Promise<number> {
    if (!this.isInitialized) {
      console.log("[HealthService] Not initialized, returning 0 calories");
      return 0;
    }

    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    const options: HealthInputOptions = {
      startDate: startOfDay.toISOString(),
      endDate: now.toISOString(),
    };

    return new Promise((resolve) => {
      NativeHealthKit.getActiveEnergyBurned(options, (error: any, results: any) => {
        if (error) {
          console.log("[HealthService] Error fetching calories:", error);
          resolve(0);
          return;
        }

        // Sum up all active energy samples for today
        if (!results || !Array.isArray(results)) {
          resolve(0);
          return;
        }

        const totalCalories = results.reduce((sum: number, sample: HealthValue) => {
          return sum + (sample.value || 0);
        }, 0);

        const roundedCalories = Math.round(totalCalories);
        console.log("[HealthService] Today's active calories:", roundedCalories);
        resolve(roundedCalories);
      });
    });
  }

  /**
   * Fetch all health data at once
   */
  public async getAllHealthData(): Promise<HealthData> {
    console.log("[HealthService] Fetching all health data...");

    const [steps, sleepHours, activeCalories, hasSleepTracking] = await Promise.all([
      this.getStepsToday(),
      this.getSleepHours(),
      this.getActiveCalories(),
      this.hasSleepTrackingCapability(),
    ]);

    // Determine sleep data source
    let sleepDataSource: "watch" | "manual" | "none" = "none";
    if (sleepHours !== null) {
      // If we have sleep data, assume it's from watch (most common)
      // Could be manual entry too, but we can't easily distinguish
      sleepDataSource = hasSleepTracking ? "watch" : "manual";
    }

    return {
      steps,
      sleepHours,
      activeCalories,
      lastUpdated: new Date(),
      sleepDataSource,
    };
  }
}

// Export singleton instance getter
export const getHealthService = () => HealthService.getInstance();

// Export for direct usage
export default HealthService;
