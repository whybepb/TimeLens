/**
 * WidgetService - Manages data sharing with iOS Home Screen Widget
 * Uses App Groups to share PVC data via shared UserDefaults
 */

import { Platform, NativeModules } from "react-native";

// App Group identifier - must match the entitlements in app.json and widget
const APP_GROUP_ID = "group.com.timelenses.productivity";
const WIDGET_DATA_KEY = "pvc_widget_data";

export interface WidgetData {
  score: number;
  level: string;
  stepsToday: number;
  focusMinutes: number;
  lastUpdated: string; // ISO date string
}

/**
 * Get the energy level label based on score
 */
const getEnergyLevel = (score: number): string => {
  if (score >= 80) return "Peak Performance";
  if (score >= 70) return "High Focus";
  if (score >= 60) return "Good Energy";
  if (score >= 40) return "Moderate";
  if (score >= 20) return "Low Energy";
  return "Rest Mode";
};

/**
 * Update widget data in shared UserDefaults
 * This writes data to App Group so the iOS widget can read it
 */
export const updateWidgetData = async (
  score: number,
  stepsToday: number = 0,
  focusMinutes: number = 0
): Promise<boolean> => {
  // Only available on iOS
  if (Platform.OS !== "ios") {
    console.log("[WidgetService] Widgets only supported on iOS");
    return false;
  }

  const widgetData: WidgetData = {
    score: Math.round(score),
    level: getEnergyLevel(score),
    stepsToday,
    focusMinutes,
    lastUpdated: new Date().toISOString(),
  };

  try {
    // Try using react-native-shared-group-preferences if available
    const SharedGroupPreferences = NativeModules.SharedGroupPreferences;
    
    if (SharedGroupPreferences) {
      await SharedGroupPreferences.setItem(
        WIDGET_DATA_KEY,
        JSON.stringify(widgetData),
        APP_GROUP_ID
      );
      console.log("[WidgetService] Widget data updated:", widgetData);
      return true;
    }

    // Fallback: Log that native module is not available
    // TODO: In production, you'd use a proper native module
    console.log("[WidgetService] SharedGroupPreferences not available");
    console.log("[WidgetService] Would write to widget:", widgetData);
    
    // For development/testing without the native module
    return true;
  } catch (error) {
    console.error("[WidgetService] Failed to update widget data:", error);
    return false;
  }
};

/**
 * Request widget timeline reload
 * Call this after updating widget data to force a refresh
 */
export const reloadWidgetTimeline = async (): Promise<void> => {
  if (Platform.OS !== "ios") return;

  try {
    // TODO: Implement native module to call WidgetCenter.shared.reloadAllTimelines()
    // This requires a custom native module or expo-modules
    // 
    // Native Swift code would be:
    // import WidgetKit
    // WidgetCenter.shared.reloadTimelines(ofKind: "PVC_Widget")
    
    console.log("[WidgetService] Widget timeline reload requested");
  } catch (error) {
    console.error("[WidgetService] Failed to reload widget:", error);
  }
};

/**
 * Convenience function to update widget with full stats
 */
export const syncWidgetWithStats = async (stats: {
  score: number;
  steps: number;
  focusTimeMinutes: number;
}): Promise<void> => {
  await updateWidgetData(stats.score, stats.steps, stats.focusTimeMinutes);
  await reloadWidgetTimeline();
};

export default {
  updateWidgetData,
  reloadWidgetTimeline,
  syncWidgetWithStats,
  APP_GROUP_ID,
};
