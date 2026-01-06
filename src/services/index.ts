export { getDataManager, default as DataManager } from "./DataManager";
export type { UserStats, PVCResult } from "./DataManager";

export {
  getRecommendationFactory,
  HighPerformanceStrategy,
  RecoveryStrategy,
  BalanceStrategy,
  default as RecommendationFactory,
} from "./AdviceEngine";
export type {
  AdviceStrategy,
  Recommendation,
  RecommendationIcon,
} from "./AdviceEngine";

export { getShieldService, default as ShieldService } from "./ShieldService";
export type { BlacklistedApp } from "./ShieldService";

export {
  updateWidgetData,
  reloadWidgetTimeline,
  syncWidgetWithStats,
  default as WidgetService,
} from "./WidgetService";
export type { WidgetData } from "./WidgetService";

export { getHealthService, default as HealthService } from "./HealthService";
export type { HealthData, HealthPermissionStatus } from "./HealthService";

export { getAppwriteService, default as AppwriteService } from "./AppwriteService";
export type { 
  AppwriteUser, 
  UserProfile, 
  HealthLog, 
  Goal, 
  AIInsightRequest, 
  AIInsightResponse 
} from "./AppwriteService";
