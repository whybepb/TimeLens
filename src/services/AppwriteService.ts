/**
 * AppwriteService - Backend Integration
 * Handles authentication, database, and AI functions via Appwrite
 */

import { Account, Client, Databases, Functions, ID, Query } from "react-native-appwrite";

// Appwrite Configuration from environment variables
const APPWRITE_ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || "https://sgp.cloud.appwrite.io/v1";
const APPWRITE_PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "";

// Database and Collection IDs
const DATABASE_ID = "695bd3f2001141d9a3a0"; // Actual TimeLens database ID
const COLLECTIONS = {
  USERS: "users",
  HEALTH_LOGS: "health_logs",
  GOALS: "goals",
  ACHIEVEMENTS: "achievements",
  DAILY_LOGS: "daily_logs",
  STREAKS: "streaks",
  USER_GOALS: "user_goals",
};

// Function IDs
const FUNCTIONS = {
  AI_INSIGHTS: "ai_insights",
};

// ============================================================================
// Initialize Appwrite Client
// ============================================================================

const client = new Client()
  .setEndpoint(APPWRITE_ENDPOINT)
  .setProject(APPWRITE_PROJECT_ID);

const account = new Account(client);
const databases = new Databases(client);
const functions = new Functions(client);

// ============================================================================
// Types
// ============================================================================

export interface AppwriteUser {
  $id: string;
  email: string;
  name: string;
}

export interface UserProfile {
  userId: string;
  name: string;
  email: string;
  stepGoal: number;
  sleepGoal: number;
  createdAt: string;
}

export interface HealthLog {
  userId: string;
  date: string;
  steps: number;
  sleepHours: number | null;
  activeCalories: number;
  pvcScore: number;
}

export interface Goal {
  userId: string;
  type: "steps" | "sleep" | "calories";
  target: number;
  current: number;
  date: string;
}

export interface AIInsightRequest {
  steps: number;
  sleepHours: number | null;
  activeCalories: number;
  pvcScore: number;
}

export interface AIInsightResponse {
  summary: string;
  tips: string[];
  encouragement: string;
}

// ============================================================================
// AppwriteService Class
// ============================================================================

class AppwriteService {
  private static instance: AppwriteService;
  private currentUser: AppwriteUser | null = null;

  private constructor() { }

  public static getInstance(): AppwriteService {
    if (!AppwriteService.instance) {
      AppwriteService.instance = new AppwriteService();
    }
    return AppwriteService.instance;
  }

  // ============================================================================
  // Connection Test
  // ============================================================================

  /**
   * Test connection to Appwrite
   */
  public async ping(): Promise<boolean> {
    try {
      // Try to get current session (will fail if not logged in, but connection works)
      await account.get();
      console.log("[Appwrite] Connection successful - user logged in");
      return true;
    } catch (error: any) {
      if (error.code === 401) {
        // Not logged in, but connection works
        console.log("[Appwrite] Connection successful - no active session");
        return true;
      }
      console.error("[Appwrite] Connection failed:", error);
      return false;
    }
  }

  // ============================================================================
  // Authentication
  // ============================================================================

  /**
   * Create a new account
   */
  public async createAccount(email: string, password: string, name: string): Promise<AppwriteUser | null> {
    try {
      const newAccount = await account.create(ID.unique(), email, password, name);

      // Auto login after creating account
      await this.login(email, password);

      // Create user profile in database
      await this.createUserProfile(newAccount.$id, name, email);

      return {
        $id: newAccount.$id,
        email: newAccount.email,
        name: newAccount.name,
      };
    } catch (error) {
      console.error("[Appwrite] Create account error:", error);
      throw error;
    }
  }

  /**
   * Login with email and password
   */
  public async login(email: string, password: string): Promise<AppwriteUser | null> {
    try {
      await account.createEmailPasswordSession(email, password);
      const user = await account.get();

      this.currentUser = {
        $id: user.$id,
        email: user.email,
        name: user.name,
      };

      console.log("[Appwrite] Login successful:", user.email);
      return this.currentUser;
    } catch (error) {
      console.error("[Appwrite] Login error:", error);
      throw error;
    }
  }

  /**
   * Logout current user
   */
  public async logout(): Promise<void> {
    try {
      await account.deleteSession("current");
      this.currentUser = null;
      console.log("[Appwrite] Logout successful");
    } catch (error) {
      console.error("[Appwrite] Logout error:", error);
      throw error;
    }
  }

  /**
   * Get current logged in user
   */
  public async getCurrentUser(): Promise<AppwriteUser | null> {
    try {
      const user = await account.get();
      this.currentUser = {
        $id: user.$id,
        email: user.email,
        name: user.name,
      };
      return this.currentUser;
    } catch (error) {
      this.currentUser = null;
      return null;
    }
  }

  /**
   * Check if user is logged in
   */
  public async isLoggedIn(): Promise<boolean> {
    const user = await this.getCurrentUser();
    return user !== null;
  }

  // ============================================================================
  // User Profile
  // ============================================================================

  /**
   * Create user profile in database
   */
  private async createUserProfile(userId: string, name: string, email: string): Promise<void> {
    try {
      await databases.createDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        userId,
        {
          userId,
          name,
          email,
          stepGoal: 10000,
          sleepGoal: 8,
          createdAt: new Date().toISOString(),
        }
      );
      console.log("[Appwrite] User profile created");
    } catch (error) {
      console.error("[Appwrite] Create user profile error:", error);
    }
  }

  /**
   * Get user profile
   */
  public async getUserProfile(): Promise<UserProfile | null> {
    if (!this.currentUser) return null;

    try {
      const doc = await databases.getDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        this.currentUser.$id
      );
      return doc as unknown as UserProfile;
    } catch (error) {
      console.error("[Appwrite] Get user profile error:", error);
      return null;
    }
  }

  /**
   * Update user goals
   */
  public async updateGoals(stepGoal: number, sleepGoal: number): Promise<void> {
    if (!this.currentUser) return;

    try {
      await databases.updateDocument(
        DATABASE_ID,
        COLLECTIONS.USERS,
        this.currentUser.$id,
        { stepGoal, sleepGoal }
      );
      console.log("[Appwrite] Goals updated");
    } catch (error) {
      console.error("[Appwrite] Update goals error:", error);
    }
  }

  // ============================================================================
  // Health Logs
  // ============================================================================

  /**
   * Save daily health log
   */
  public async saveHealthLog(log: Omit<HealthLog, "userId">): Promise<void> {
    if (!this.currentUser) return;

    try {
      // Check if log exists for today
      const today = new Date().toISOString().split("T")[0];
      const existing = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.HEALTH_LOGS,
        [
          Query.equal("userId", this.currentUser.$id),
          Query.equal("date", today),
        ]
      );

      if (existing.documents.length > 0) {
        // Update existing log
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.HEALTH_LOGS,
          existing.documents[0].$id,
          { ...log, userId: this.currentUser.$id }
        );
      } else {
        // Create new log
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.HEALTH_LOGS,
          ID.unique(),
          { ...log, userId: this.currentUser.$id, date: today }
        );
      }
      console.log("[Appwrite] Health log saved");
    } catch (error) {
      console.error("[Appwrite] Save health log error:", error);
    }
  }

  /**
   * Get health logs for the past N days
   */
  public async getHealthLogs(days: number = 7): Promise<HealthLog[]> {
    if (!this.currentUser) return [];

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const result = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.HEALTH_LOGS,
        [
          Query.equal("userId", this.currentUser.$id),
          Query.greaterThan("date", startDate.toISOString().split("T")[0]),
          Query.orderDesc("date"),
        ]
      );

      return result.documents as unknown as HealthLog[];
    } catch (error) {
      console.error("[Appwrite] Get health logs error:", error);
      return [];
    }
  }

  // ============================================================================
  // AI Insights (via Appwrite Function)
  // ============================================================================

  /**
   * Get AI-generated insights based on health data
   * This calls an Appwrite Function that securely calls Groq API
   */
  public async getAIInsights(data: AIInsightRequest): Promise<AIInsightResponse | null> {
    try {
      const execution = await functions.createExecution(
        FUNCTIONS.AI_INSIGHTS,
        JSON.stringify(data),
        false // async = false, wait for response
      );

      if (execution.status === "completed") {
        const response = JSON.parse(execution.responseBody);
        console.log("[Appwrite] AI insights received");
        return response as AIInsightResponse;
      } else {
        console.error("[Appwrite] AI function failed:", execution.errors);
        return null;
      }
    } catch (error) {
      console.error("[Appwrite] AI insights error:", error);

      // Fallback: Return mock insights for development
      return this.getMockInsights(data);
    }
  }

  /**
   * Mock insights for development/fallback
   */
  private getMockInsights(data: AIInsightRequest): AIInsightResponse {
    const { steps, sleepHours, pvcScore } = data;

    let summary = "";
    let tips: string[] = [];
    let encouragement = "";

    if (pvcScore >= 70) {
      summary = "Excellent day! You're performing at a high level.";
      tips = [
        "Keep up the great momentum!",
        "Consider a light stretch session to maintain flexibility",
        "Stay hydrated throughout the day",
      ];
      encouragement = "You're crushing it! 💪";
    } else if (pvcScore >= 40) {
      summary = "Solid day with room for improvement.";
      tips = [
        steps < 5000 ? "Try to add a short walk to boost your steps" : "Great step count!",
        sleepHours === null ? "Consider tracking your sleep for better insights" :
          sleepHours < 7 ? "Aim for 7-8 hours of sleep tonight" : "Good sleep!",
        "Take short breaks to stay refreshed",
      ];
      encouragement = "You're making progress! Keep going! 🌟";
    } else {
      summary = "Recovery day - focus on rest and rejuvenation.";
      tips = [
        "Prioritize getting quality sleep tonight",
        "A short walk can help boost energy levels",
        "Stay hydrated and eat nutritious meals",
      ];
      encouragement = "Every day is a fresh start. You've got this! 🌱";
    }

    return { summary, tips, encouragement };
  }

  // ============================================================================
  // User Goals Sync
  // ============================================================================

  /**
   * Save user goals to Appwrite
   */
  public async saveUserGoals(goals: {
    steps: number;
    sleep: number;
    focus: number;
    pvc: number;
    calories: number;
  }): Promise<void> {
    if (!this.currentUser) {
      console.log("[Appwrite] No user logged in, skipping goals sync");
      return;
    }

    try {
      // Try to find existing goals document
      const existing = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USER_GOALS,
        [Query.equal("userId", this.currentUser.$id)]
      );

      const data = {
        userId: this.currentUser.$id,
        ...goals,
        updatedAt: new Date().toISOString(),
      };

      if (existing.documents.length > 0) {
        // Update existing
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.USER_GOALS,
          existing.documents[0].$id,
          data
        );
        console.log("[Appwrite] User goals updated");
      } else {
        // Create new
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.USER_GOALS,
          ID.unique(),
          data
        );
        console.log("[Appwrite] User goals created");
      }
    } catch (error: any) {
      // Collection might not exist yet - that's ok, we'll create it next time
      if (error.code === 404) {
        console.log("[Appwrite] Collection not found - will sync later when collection is created");
      } else {
        console.error("[Appwrite] Save user goals error:", error);
      }
    }
  }

  /**
   * Get user goals from Appwrite
   */
  public async getUserGoals(): Promise<{
    steps: number;
    sleep: number;
    focus: number;
    pvc: number;
    calories: number;
  } | null> {
    if (!this.currentUser) return null;

    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.USER_GOALS,
        [Query.equal("userId", this.currentUser.$id)]
      );

      if (result.documents.length > 0) {
        const doc = result.documents[0];
        return {
          steps: doc.steps as number,
          sleep: doc.sleep as number,
          focus: doc.focus as number,
          pvc: doc.pvc as number,
          calories: doc.calories as number,
        };
      }
      return null;
    } catch (error) {
      console.error("[Appwrite] Get user goals error:", error);
      return null;
    }
  }

  // ============================================================================
  // Daily Logs Sync
  // ============================================================================

  /**
   * Save daily log to Appwrite
   */
  public async saveDailyLog(log: {
    date: string;
    steps: number;
    sleepHours: number | null;
    focusMinutes: number;
    pvcScore: number;
    activeCalories: number;
    goalsMetCount: number;
  }): Promise<void> {
    if (!this.currentUser) {
      console.log("[Appwrite] No user logged in, skipping daily log sync");
      return;
    }

    try {
      // Check if log exists for this date
      const existing = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DAILY_LOGS,
        [
          Query.equal("userId", this.currentUser.$id),
          Query.equal("date", log.date),
        ]
      );

      const data = {
        userId: this.currentUser.$id,
        ...log,
      };

      if (existing.documents.length > 0) {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.DAILY_LOGS,
          existing.documents[0].$id,
          data
        );
        console.log("[Appwrite] Daily log updated for", log.date);
      } else {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.DAILY_LOGS,
          ID.unique(),
          data
        );
        console.log("[Appwrite] Daily log created for", log.date);
      }
    } catch (error: any) {
      if (error.code === 404) {
        console.log("[Appwrite] Collection not found - will sync later");
      } else {
        console.error("[Appwrite] Save daily log error:", error);
      }
    }
  }

  /**
   * Get daily logs from Appwrite
   */
  public async getDailyLogs(days: number = 30): Promise<Array<{
    date: string;
    steps: number;
    sleepHours: number | null;
    focusMinutes: number;
    pvcScore: number;
    activeCalories: number;
    goalsMetCount: number;
  }>> {
    if (!this.currentUser) return [];

    try {
      const startDate = new Date();
      startDate.setDate(startDate.getDate() - days);

      const result = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.DAILY_LOGS,
        [
          Query.equal("userId", this.currentUser.$id),
          Query.greaterThan("date", startDate.toISOString().split("T")[0]),
          Query.orderDesc("date"),
          Query.limit(days),
        ]
      );

      return result.documents.map((doc) => ({
        date: doc.date as string,
        steps: doc.steps as number,
        sleepHours: doc.sleepHours as number | null,
        focusMinutes: doc.focusMinutes as number,
        pvcScore: doc.pvcScore as number,
        activeCalories: doc.activeCalories as number,
        goalsMetCount: doc.goalsMetCount as number,
      }));
    } catch (error) {
      console.error("[Appwrite] Get daily logs error:", error);
      return [];
    }
  }

  // ============================================================================
  // Streaks Sync
  // ============================================================================

  /**
   * Save streaks to Appwrite
   */
  public async saveStreaks(streaks: {
    steps: { currentStreak: number; longestStreak: number; lastActiveDate: string };
    sleep: { currentStreak: number; longestStreak: number; lastActiveDate: string };
    focus: { currentStreak: number; longestStreak: number; lastActiveDate: string };
    pvc: { currentStreak: number; longestStreak: number; lastActiveDate: string };
    overall: { currentStreak: number; longestStreak: number; lastActiveDate: string };
  }): Promise<void> {
    if (!this.currentUser) {
      console.log("[Appwrite] No user logged in, skipping streaks sync");
      return;
    }

    try {
      // Check if streaks document exists
      const existing = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.STREAKS,
        [Query.equal("userId", this.currentUser.$id)]
      );

      const data = {
        userId: this.currentUser.$id,
        stepsCurrentStreak: streaks.steps.currentStreak,
        stepsLongestStreak: streaks.steps.longestStreak,
        stepsLastActiveDate: streaks.steps.lastActiveDate,
        sleepCurrentStreak: streaks.sleep.currentStreak,
        sleepLongestStreak: streaks.sleep.longestStreak,
        sleepLastActiveDate: streaks.sleep.lastActiveDate,
        focusCurrentStreak: streaks.focus.currentStreak,
        focusLongestStreak: streaks.focus.longestStreak,
        focusLastActiveDate: streaks.focus.lastActiveDate,
        pvcCurrentStreak: streaks.pvc.currentStreak,
        pvcLongestStreak: streaks.pvc.longestStreak,
        pvcLastActiveDate: streaks.pvc.lastActiveDate,
        overallCurrentStreak: streaks.overall.currentStreak,
        overallLongestStreak: streaks.overall.longestStreak,
        overallLastActiveDate: streaks.overall.lastActiveDate,
        updatedAt: new Date().toISOString(),
      };

      if (existing.documents.length > 0) {
        await databases.updateDocument(
          DATABASE_ID,
          COLLECTIONS.STREAKS,
          existing.documents[0].$id,
          data
        );
        console.log("[Appwrite] Streaks updated");
      } else {
        await databases.createDocument(
          DATABASE_ID,
          COLLECTIONS.STREAKS,
          ID.unique(),
          data
        );
        console.log("[Appwrite] Streaks created");
      }
    } catch (error: any) {
      if (error.code === 404) {
        console.log("[Appwrite] Collection not found - will sync later");
      } else {
        console.error("[Appwrite] Save streaks error:", error);
      }
    }
  }

  /**
   * Get streaks from Appwrite
   */
  public async getStreaks(): Promise<{
    steps: { currentStreak: number; longestStreak: number; lastActiveDate: string };
    sleep: { currentStreak: number; longestStreak: number; lastActiveDate: string };
    focus: { currentStreak: number; longestStreak: number; lastActiveDate: string };
    pvc: { currentStreak: number; longestStreak: number; lastActiveDate: string };
    overall: { currentStreak: number; longestStreak: number; lastActiveDate: string };
  } | null> {
    if (!this.currentUser) return null;

    try {
      const result = await databases.listDocuments(
        DATABASE_ID,
        COLLECTIONS.STREAKS,
        [Query.equal("userId", this.currentUser.$id)]
      );

      if (result.documents.length > 0) {
        const doc = result.documents[0];
        return {
          steps: {
            currentStreak: doc.stepsCurrentStreak as number,
            longestStreak: doc.stepsLongestStreak as number,
            lastActiveDate: doc.stepsLastActiveDate as string,
          },
          sleep: {
            currentStreak: doc.sleepCurrentStreak as number,
            longestStreak: doc.sleepLongestStreak as number,
            lastActiveDate: doc.sleepLastActiveDate as string,
          },
          focus: {
            currentStreak: doc.focusCurrentStreak as number,
            longestStreak: doc.focusLongestStreak as number,
            lastActiveDate: doc.focusLastActiveDate as string,
          },
          pvc: {
            currentStreak: doc.pvcCurrentStreak as number,
            longestStreak: doc.pvcLongestStreak as number,
            lastActiveDate: doc.pvcLastActiveDate as string,
          },
          overall: {
            currentStreak: doc.overallCurrentStreak as number,
            longestStreak: doc.overallLongestStreak as number,
            lastActiveDate: doc.overallLastActiveDate as string,
          },
        };
      }
      return null;
    } catch (error) {
      console.error("[Appwrite] Get streaks error:", error);
      return null;
    }
  }
}

// ============================================================================
// Exports
// ============================================================================

export const getAppwriteService = () => AppwriteService.getInstance();
export default AppwriteService;

