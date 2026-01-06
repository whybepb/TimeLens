export { default as DataManager, getDataManager } from "./DataManager";
export type { PVCResult, UserStats } from "./DataManager";

export {
  BalanceStrategy, HighPerformanceStrategy, default as RecommendationFactory, RecoveryStrategy, getRecommendationFactory
} from "./AdviceEngine";
export type {
  AdviceStrategy,
  Recommendation,
  RecommendationIcon
} from "./AdviceEngine";

export { default as ShieldService, getShieldService } from "./ShieldService";
export type { BlacklistedApp } from "./ShieldService";

export {
  default as WidgetService, reloadWidgetTimeline,
  syncWidgetWithStats, updateWidgetData
} from "./WidgetService";
export type { WidgetData } from "./WidgetService";

export { default as HealthService, getHealthService } from "./HealthService";
export type { HealthData, HealthPermissionStatus } from "./HealthService";

export { default as AppwriteService, getAppwriteService } from "./AppwriteService";
export type {
  AIInsightRequest,
  AIInsightResponse, AppwriteUser, Goal, HealthLog, UserProfile
} from "./AppwriteService";

export { default as GoalService, getGoalService } from "./GoalService";
export type { GoalProgress, GoalType, Goal as UserGoal, UserGoals } from "./GoalService";

export { default as StreakService, getStreakService } from "./StreakService";
export type { DailyLog, Streak, StreakData, StreakType } from "./StreakService";

export { default as LLMService, getLLMService } from "./LLMService";
export type { CoachingContext, LLMProvider, LLMResponse } from "./LLMService";

