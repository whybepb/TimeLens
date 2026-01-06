/**
 * AppwriteService - Backend Integration
 * Handles authentication, database, and AI functions via Appwrite
 */

import { Client, Account, Databases, Functions, ID, Query } from "react-native-appwrite";

// Appwrite Configuration from environment variables
const APPWRITE_ENDPOINT = process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT || "https://sgp.cloud.appwrite.io/v1";
const APPWRITE_PROJECT_ID = process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID || "";

// Database and Collection IDs (we'll create these in Appwrite Console)
const DATABASE_ID = "timelens_db";
const COLLECTIONS = {
  USERS: "users",
  HEALTH_LOGS: "health_logs",
  GOALS: "goals",
  ACHIEVEMENTS: "achievements",
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

  private constructor() {}

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
}

// ============================================================================
// Exports
// ============================================================================

export const getAppwriteService = () => AppwriteService.getInstance();
export default AppwriteService;
