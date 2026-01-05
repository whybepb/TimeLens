/**
 * AdviceEngine - Strategy Pattern Implementation
 * Provides personalized recommendations based on user's productivity-vitality state
 */

import { UserStats, PVCResult } from "./DataManager";

// ============================================================================
// Types & Interfaces
// ============================================================================

export type RecommendationIcon = 
  | "zap"           // High energy actions
  | "coffee"        // Break/recovery
  | "footprints"    // Walking/movement
  | "moon"          // Rest/sleep
  | "focus"         // Deep work
  | "sparkles"      // General motivation
  | "heart"         // Health focus
  | "shield"        // Screen time management
  | "trending-up"   // Progress/momentum
  | "battery";      // Energy management

export interface Recommendation {
  title: string;
  message: string;
  icon: RecommendationIcon;
  actionLabel?: string;
  priority: "high" | "medium" | "low";
  category: "productivity" | "health" | "balance" | "recovery";
}

/**
 * Strategy Interface - All advice strategies must implement this
 */
export interface AdviceStrategy {
  name: string;
  getRecommendation(stats: UserStats, pvc: PVCResult): Recommendation;
}

// ============================================================================
// Strategy Implementations
// ============================================================================

/**
 * High Performance Strategy
 * Activated when PVC score is high (70+)
 * Focuses on maximizing deep work and maintaining momentum
 */
export class HighPerformanceStrategy implements AdviceStrategy {
  name = "HighPerformance";

  getRecommendation(stats: UserStats, pvc: PVCResult): Recommendation {
    const { steps, focusTimeMinutes, sleepHours } = stats;

    // Already crushed focus time - suggest maintaining momentum
    if (focusTimeMinutes >= 180) {
      return {
        title: "Peak Performance Mode",
        message: "You're in the zone! Take a 5-minute micro-break to sustain this flow state for longer.",
        icon: "zap",
        actionLabel: "Set 5-min timer",
        priority: "medium",
        category: "productivity",
      };
    }

    // High energy, good sleep - push for deep work
    if (sleepHours >= 7 && steps >= 5000) {
      return {
        title: "Optimal Conditions",
        message: "Your body and mind are primed for deep work. Block out distractions and tackle your most challenging task.",
        icon: "focus",
        actionLabel: "Start focus session",
        priority: "high",
        category: "productivity",
      };
    }

    // High score but could move more
    if (steps < 5000) {
      return {
        title: "Unlock Extra Energy",
        message: "A quick 10-minute walk will boost your already high cognitive performance by 15%.",
        icon: "footprints",
        actionLabel: "Start a walk",
        priority: "medium",
        category: "balance",
      };
    }

    // Default high performance advice
    return {
      title: "Momentum Builder",
      message: "You're performing at a high level. Keep the streak going by completing one more meaningful task.",
      icon: "trending-up",
      actionLabel: "View tasks",
      priority: "medium",
      category: "productivity",
    };
  }
}

/**
 * Recovery Strategy
 * Activated when PVC score is low (<40) or health indicators are poor
 * Focuses on rest, movement, and recovery
 */
export class RecoveryStrategy implements AdviceStrategy {
  name = "Recovery";

  getRecommendation(stats: UserStats, pvc: PVCResult): Recommendation {
    const { steps, sleepHours, socialMediaMinutes, pickups } = stats;

    // Sleep deprivation is the top priority
    if (sleepHours < 6) {
      return {
        title: "Rest Priority",
        message: "Sleep debt is affecting your cognitive performance. Consider an earlier bedtime tonight to restore your vitality.",
        icon: "moon",
        actionLabel: "Set sleep reminder",
        priority: "high",
        category: "recovery",
      };
    }

    // Too much social media - digital detox needed
    if (socialMediaMinutes > 90) {
      return {
        title: "Digital Detox Time",
        message: "High social media usage is draining your mental energy. Try a 30-minute screen break to reset.",
        icon: "shield",
        actionLabel: "Start detox",
        priority: "high",
        category: "recovery",
      };
    }

    // Very sedentary - movement is crucial
    if (steps < 2000) {
      return {
        title: "Movement Break",
        message: "Your body needs movement. Even a 5-minute stretch or short walk will improve your energy levels.",
        icon: "heart",
        actionLabel: "Stretch routine",
        priority: "high",
        category: "health",
      };
    }

    // Too many pickups - fragmented attention
    if (pickups > 60) {
      return {
        title: "Focus Recovery",
        message: "Frequent phone pickups are fragmenting your attention. Try putting your phone in another room for 1 hour.",
        icon: "shield",
        actionLabel: "Enable focus mode",
        priority: "medium",
        category: "recovery",
      };
    }

    // General low energy recovery
    return {
      title: "Recharge Mode",
      message: "Your vitality is low today. Take it easy and focus on light tasks until your energy recovers.",
      icon: "battery",
      priority: "medium",
      category: "recovery",
    };
  }
}

/**
 * Balance Strategy
 * Default strategy for mid-range PVC scores (40-70)
 * Provides moderate, balanced advice
 */
export class BalanceStrategy implements AdviceStrategy {
  name = "Balance";

  getRecommendation(stats: UserStats, pvc: PVCResult): Recommendation {
    const { steps, sleepHours, focusTimeMinutes, socialMediaMinutes } = stats;

    // Good sleep, could do more movement
    if (sleepHours >= 7 && steps < 5000) {
      return {
        title: "Balance Your Day",
        message: "You're well-rested. A midday walk would elevate your afternoon productivity.",
        icon: "footprints",
        actionLabel: "Walking route",
        priority: "medium",
        category: "balance",
      };
    }

    // Decent focus, watch the social media
    if (focusTimeMinutes >= 60 && socialMediaMinutes > 45) {
      return {
        title: "Mindful Screen Use",
        message: "Good focus session today! Be mindful of social media creep - you're approaching your daily limit.",
        icon: "sparkles",
        priority: "low",
        category: "balance",
      };
    }

    // Need more focus time
    if (focusTimeMinutes < 60) {
      return {
        title: "Focus Opportunity",
        message: "You have the energy for a productive session. Try 25 minutes of focused work to build momentum.",
        icon: "focus",
        actionLabel: "Start Pomodoro",
        priority: "medium",
        category: "productivity",
      };
    }

    // Could sleep better
    if (sleepHours < 7 && sleepHours >= 6) {
      return {
        title: "Sleep Optimization",
        message: "Slightly below optimal sleep. An extra 30 minutes tonight could boost tomorrow's score significantly.",
        icon: "moon",
        priority: "low",
        category: "health",
      };
    }

    // Default balanced advice
    return {
      title: "Steady Progress",
      message: "You're maintaining a healthy balance. Keep this sustainable pace going!",
      icon: "sparkles",
      priority: "low",
      category: "balance",
    };
  }
}

// ============================================================================
// Recommendation Factory
// ============================================================================

/**
 * RecommendationFactory
 * Selects the appropriate strategy based on the current PVC score and user stats
 */
export class RecommendationFactory {
  private highPerformanceStrategy: AdviceStrategy;
  private recoveryStrategy: AdviceStrategy;
  private balanceStrategy: AdviceStrategy;

  constructor() {
    this.highPerformanceStrategy = new HighPerformanceStrategy();
    this.recoveryStrategy = new RecoveryStrategy();
    this.balanceStrategy = new BalanceStrategy();
  }

  /**
   * Select the best strategy based on current state
   */
  selectStrategy(stats: UserStats, pvc: PVCResult): AdviceStrategy {
    // Check for recovery conditions first (overrides score)
    if (this.needsRecovery(stats)) {
      return this.recoveryStrategy;
    }

    // Score-based selection
    if (pvc.score >= 70) {
      return this.highPerformanceStrategy;
    }

    if (pvc.score < 40) {
      return this.recoveryStrategy;
    }

    return this.balanceStrategy;
  }

  /**
   * Check if user needs recovery regardless of score
   */
  private needsRecovery(stats: UserStats): boolean {
    return (
      stats.sleepHours < 5.5 ||
      stats.socialMediaMinutes > 120 ||
      stats.pickups > 80
    );
  }

  /**
   * Get a recommendation using the appropriate strategy
   */
  getRecommendation(stats: UserStats, pvc: PVCResult): Recommendation {
    const strategy = this.selectStrategy(stats, pvc);
    console.log(`[AdviceEngine] Using ${strategy.name} strategy for PVC: ${pvc.score}`);
    return strategy.getRecommendation(stats, pvc);
  }
}

// ============================================================================
// Singleton Export
// ============================================================================

let factoryInstance: RecommendationFactory | null = null;

export const getRecommendationFactory = (): RecommendationFactory => {
  if (!factoryInstance) {
    factoryInstance = new RecommendationFactory();
  }
  return factoryInstance;
};

export default RecommendationFactory;
