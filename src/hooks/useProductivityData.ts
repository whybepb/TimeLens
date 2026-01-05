import { useState, useEffect, useCallback } from "react";
import { getDataManager, UserStats, PVCResult } from "../services/DataManager";

export interface ProductivityData {
  stats: UserStats;
  pvc: PVCResult;
  insight: string;
  isLoading: boolean;
  lastUpdated: Date | null;
  refresh: () => Promise<void>;
}

/**
 * Custom hook that subscribes to the DataManager singleton
 * Provides reactive updates when productivity data changes
 */
export function useProductivityData(): ProductivityData {
  const [stats, setStats] = useState<UserStats | null>(null);
  const [pvc, setPvc] = useState<PVCResult | null>(null);
  const [insight, setInsight] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const dataManager = getDataManager();

    // Subscribe to data changes
    const unsubscribe = dataManager.subscribe((newStats, newPvc) => {
      setStats(newStats);
      setPvc(newPvc);
      setInsight(dataManager.generateInsight());
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, []);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      const dataManager = getDataManager();
      await dataManager.refreshData();
    } catch (error) {
      console.error("[useProductivityData] Refresh failed:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Return default values while loading
  if (!stats || !pvc) {
    return {
      stats: {
        steps: 0,
        sleepHours: 0,
        activeCalories: 0,
        focusTimeMinutes: 0,
        socialMediaMinutes: 0,
        totalScreenTimeMinutes: 0,
        pickups: 0,
        lastUpdated: new Date(),
      },
      pvc: {
        score: 0,
        rawScore: 0,
        breakdown: {
          stepsContribution: 0,
          focusContribution: 0,
          socialMediaPenalty: 0,
        },
        level: "rest",
      },
      insight: "Loading your vitality data...",
      isLoading: true,
      lastUpdated: null,
      refresh,
    };
  }

  return {
    stats,
    pvc,
    insight,
    isLoading,
    lastUpdated: stats.lastUpdated,
    refresh,
  };
}

export default useProductivityData;
