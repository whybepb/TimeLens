export { default as DataManager, getDataManager } from "./DataManager";
export type { PVCResult, UserStats } from "./DataManager";

export {
  BalanceStrategy, getRecommendationFactory, HighPerformanceStrategy, default as RecommendationFactory, RecoveryStrategy
} from "./AdviceEngine";
export type {
  AdviceStrategy,
  Recommendation,
  RecommendationIcon
} from "./AdviceEngine";

export { getShieldService, default as ShieldService } from "./ShieldService";
export type { BlacklistedApp } from "./ShieldService";

export {
  reloadWidgetTimeline,
  syncWidgetWithStats, updateWidgetData, default as WidgetService
} from "./WidgetService";
export type { WidgetData } from "./WidgetService";

export { getHealthService, default as HealthService } from "./HealthService";
export type { HealthData, HealthPermissionStatus } from "./HealthService";

export { default as AppwriteService, getAppwriteService } from "./AppwriteService";
export type {
  AIInsightRequest,
  AIInsightResponse, AppwriteUser, Goal, HealthLog, UserProfile
} from "./AppwriteService";

export { getGoalService, default as GoalService } from "./GoalService";
export type { GoalProgress, GoalType, Goal as UserGoal, UserGoals } from "./GoalService";

export { getStreakService, default as StreakService } from "./StreakService";
export type { DailyLog, Streak, StreakData, StreakType } from "./StreakService";

export { getLLMService, default as LLMService } from "./LLMService";
export type { CoachingContext, LLMProvider, LLMResponse } from "./LLMService";

export { default as FocusService, getFocusService } from "./FocusService";
export type { FocusSession, FocusSettings, FocusStats, SessionType } from "./FocusService";

export { getNotificationService, default as NotificationService } from "./NotificationService";
export type { NotificationSettings, NotificationType } from "./NotificationService";

