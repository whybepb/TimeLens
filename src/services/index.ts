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
