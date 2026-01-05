import { useState, useEffect } from "react";
import { getDataManager, UserStats, PVCResult } from "../services/DataManager";
import {
  getRecommendationFactory,
  Recommendation,
  RecommendationIcon,
} from "../services/AdviceEngine";

export interface CoachAdvice {
  title: string;
  message: string;
  icon: RecommendationIcon;
  actionLabel?: string;
  priority: "high" | "medium" | "low";
  category: "productivity" | "health" | "balance" | "recovery";
  isLoading: boolean;
}

/**
 * Custom hook that provides personalized coach advice
 * Uses the Strategy Pattern via AdviceEngine to select appropriate recommendations
 */
export function useCoachAdvice(): CoachAdvice {
  const [advice, setAdvice] = useState<Recommendation | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const dataManager = getDataManager();
    const factory = getRecommendationFactory();

    // Subscribe to data changes and update recommendations
    const unsubscribe = dataManager.subscribe(
      (stats: UserStats, pvc: PVCResult) => {
        const recommendation = factory.getRecommendation(stats, pvc);
        setAdvice(recommendation);
        setIsLoading(false);
      }
    );

    return () => {
      unsubscribe();
    };
  }, []);

  // Return default while loading
  if (!advice || isLoading) {
    return {
      title: "Analyzing...",
      message: "Calculating your personalized advice...",
      icon: "sparkles",
      priority: "low",
      category: "balance",
      isLoading: true,
    };
  }

  return {
    ...advice,
    isLoading: false,
  };
}

export default useCoachAdvice;
