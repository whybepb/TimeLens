/**
 * LLMService - AI-Powered Coaching Layer
 * Provides personalized advice using LLM APIs
 * Supports multiple providers: Groq (free), OpenAI, etc.
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { UserStats, PVCResult } from "./DataManager";

// ============================================================================
// Types
// ============================================================================

export type LLMProvider = "groq" | "openai" | "offline";

export interface CoachMessage {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  timestamp: Date;
}

export interface CoachingContext {
  stats: UserStats;
  pvc: PVCResult;
  timeOfDay: "morning" | "afternoon" | "evening" | "night";
  dayOfWeek: string;
  previousAdvice?: string;
}

export interface LLMResponse {
  advice: string;
  actionItems: string[];
  motivation: string;
  cached: boolean;
}

// ============================================================================
// Configuration
// ============================================================================

// API Keys - Read from environment variables
// Set these in .env file (not committed to git)
const API_KEYS = {
  groq: process.env.EXPO_PUBLIC_GROQ_API_KEY || "",
  openai: process.env.EXPO_PUBLIC_OPENAI_API_KEY || "",
};

const CACHE_KEY = "@timelens/llm_cache";
const CACHE_DURATION_MS = 30 * 60 * 1000; // 30 minutes

// System prompt for the AI coach
const SYSTEM_PROMPT = `You are TimeLens Coach, a friendly and insightful AI wellness coach. Your role is to help users optimize their productivity and vitality based on their health and screen time data.

Key principles:
1. Be encouraging but honest - celebrate wins, gently address areas for improvement
2. Give specific, actionable advice based on the user's actual data
3. Keep responses concise (2-3 sentences max for the main advice)
4. Use a warm, supportive tone - like a knowledgeable friend
5. Reference specific numbers from their data to show you understand their situation
6. Consider the time of day and day of week in your advice

Response format (JSON):
{
  "advice": "Main personalized advice (2-3 sentences)",
  "actionItems": ["Specific action 1", "Specific action 2"],
  "motivation": "Short motivational closing (1 sentence)"
}`;

// ============================================================================
// LLMService Class
// ============================================================================

class LLMService {
  private static instance: LLMService;
  private provider: LLMProvider = "offline";
  private conversationHistory: CoachMessage[] = [];
  private cache: Map<string, { response: LLMResponse; timestamp: number }> = new Map();

  private constructor() {
    this.loadCache();
    this.detectAvailableProvider();
  }

  public static getInstance(): LLMService {
    if (!LLMService.instance) {
      LLMService.instance = new LLMService();
    }
    return LLMService.instance;
  }

  /**
   * Set API key for a provider
   */
  public setApiKey(provider: LLMProvider, key: string): void {
    if (provider === "groq") {
      API_KEYS.groq = key;
    } else if (provider === "openai") {
      API_KEYS.openai = key;
    }
    this.detectAvailableProvider();
  }

  /**
   * Detect which provider is available based on API keys
   */
  private detectAvailableProvider(): void {
    if (API_KEYS.groq) {
      this.provider = "groq";
      console.log("[LLMService] Using Groq provider");
    } else if (API_KEYS.openai) {
      this.provider = "openai";
      console.log("[LLMService] Using OpenAI provider");
    } else {
      this.provider = "offline";
      console.log("[LLMService] No API key found, using offline mode");
    }
  }

  /**
   * Get current provider
   */
  public getProvider(): LLMProvider {
    return this.provider;
  }

  /**
   * Generate personalized coaching advice
   */
  public async getCoachingAdvice(context: CoachingContext): Promise<LLMResponse> {
    // Check cache first
    const cacheKey = this.generateCacheKey(context);
    const cached = this.cache.get(cacheKey);
    
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION_MS) {
      console.log("[LLMService] Returning cached advice");
      return { ...cached.response, cached: true };
    }

    // If offline, use fallback
    if (this.provider === "offline") {
      return this.generateOfflineAdvice(context);
    }

    try {
      const response = await this.callLLM(context);
      
      // Cache the response
      this.cache.set(cacheKey, { response, timestamp: Date.now() });
      this.saveCache();
      
      return response;
    } catch (error) {
      console.error("[LLMService] API call failed, using fallback:", error);
      return this.generateOfflineAdvice(context);
    }
  }

  /**
   * Call the LLM API
   */
  private async callLLM(context: CoachingContext): Promise<LLMResponse> {
    const userMessage = this.buildUserMessage(context);
    
    if (this.provider === "groq") {
      return this.callGroq(userMessage);
    } else if (this.provider === "openai") {
      return this.callOpenAI(userMessage);
    }
    
    return this.generateOfflineAdvice(context);
  }

  /**
   * Call Groq API (free tier available)
   */
  private async callGroq(userMessage: string): Promise<LLMResponse> {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEYS.groq}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // Updated model name
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 500,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("[LLMService] Groq error response:", errorText);
      throw new Error(`Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    return this.parseResponse(content);
  }

  /**
   * Call OpenAI API
   */
  private async callOpenAI(userMessage: string): Promise<LLMResponse> {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEYS.openai}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4o-mini", // Cost-effective
        messages: [
          { role: "system", content: SYSTEM_PROMPT },
          { role: "user", content: userMessage },
        ],
        temperature: 0.7,
        max_tokens: 300,
        response_format: { type: "json_object" },
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0]?.message?.content;
    
    return this.parseResponse(content);
  }

  /**
   * Build user message with context
   */
  private buildUserMessage(context: CoachingContext): string {
    const { stats, pvc, timeOfDay, dayOfWeek } = context;
    
    return `Here's my current data for today (${dayOfWeek}, ${timeOfDay}):

📊 Productivity-Vitality Score: ${pvc.score.toFixed(0)}/100 (${pvc.level})

🏃 Health Data:
- Steps: ${stats.steps.toLocaleString()}
- Sleep: ${stats.sleepHours.toFixed(1)} hours
- Active Calories: ${stats.activeCalories}

📱 Digital Wellness:
- Focus Time: ${stats.focusTimeMinutes} minutes
- Social Media: ${stats.socialMediaMinutes} minutes
- Phone Pickups: ${stats.pickups}

Based on this data, give me personalized advice to optimize my productivity and wellbeing.`;
  }

  /**
   * Parse LLM response
   */
  private parseResponse(content: string): LLMResponse {
    try {
      const parsed = JSON.parse(content);
      return {
        advice: parsed.advice || "Keep up the great work!",
        actionItems: parsed.actionItems || [],
        motivation: parsed.motivation || "You've got this!",
        cached: false,
      };
    } catch {
      // If JSON parsing fails, use the raw content
      return {
        advice: content || "Keep focusing on your goals!",
        actionItems: [],
        motivation: "Every step counts!",
        cached: false,
      };
    }
  }

  /**
   * Generate offline advice using rules (fallback)
   */
  private generateOfflineAdvice(context: CoachingContext): LLMResponse {
    const { stats, pvc, timeOfDay } = context;
    
    // Time-based greetings
    const greetings: Record<string, string> = {
      morning: "Good morning! ",
      afternoon: "Good afternoon! ",
      evening: "Good evening! ",
      night: "Winding down? ",
    };

    let advice = greetings[timeOfDay];
    const actionItems: string[] = [];
    let motivation = "Keep pushing forward!";

    // Score-based advice
    if (pvc.score >= 80) {
      advice += `Amazing! Your PVC of ${pvc.score.toFixed(0)} shows you're in peak form today.`;
      actionItems.push("Maintain this momentum with a challenging task");
      motivation = "You're unstoppable today!";
    } else if (pvc.score >= 60) {
      advice += `Solid progress with a PVC of ${pvc.score.toFixed(0)}. `;
      
      if (stats.steps < 5000) {
        advice += "A quick walk would boost your energy.";
        actionItems.push("Take a 10-minute walking break");
      } else if (stats.socialMediaMinutes > 60) {
        advice += "Consider reducing screen time to maintain focus.";
        actionItems.push("Try a 30-minute digital detox");
      } else {
        advice += "Keep the balance going!";
      }
      motivation = "You're building great habits!";
    } else if (pvc.score >= 40) {
      advice += `Your PVC of ${pvc.score.toFixed(0)} suggests room for improvement. `;
      
      if (stats.sleepHours < 7) {
        advice += "Prioritize sleep tonight - it's your superpower.";
        actionItems.push("Set a sleep reminder for 10 PM");
      } else if (stats.focusTimeMinutes < 60) {
        advice += "Try a focused work session to boost your score.";
        actionItems.push("Start a 25-minute Pomodoro session");
      }
      motivation = "Small changes lead to big results!";
    } else {
      advice += `Time for a reset. Your PVC of ${pvc.score.toFixed(0)} indicates you need some self-care.`;
      actionItems.push("Take a break from screens");
      actionItems.push("Get some fresh air");
      motivation = "Tomorrow is a fresh start!";
    }

    return {
      advice,
      actionItems,
      motivation,
      cached: false,
    };
  }

  /**
   * Generate cache key from context
   */
  private generateCacheKey(context: CoachingContext): string {
    const { pvc, timeOfDay } = context;
    // Round score to nearest 10 for caching efficiency
    const roundedScore = Math.round(pvc.score / 10) * 10;
    return `${roundedScore}-${pvc.level}-${timeOfDay}`;
  }

  /**
   * Load cache from AsyncStorage
   */
  private async loadCache(): Promise<void> {
    try {
      const cached = await AsyncStorage.getItem(CACHE_KEY);
      if (cached) {
        const entries = JSON.parse(cached);
        this.cache = new Map(entries);
      }
    } catch (error) {
      console.error("[LLMService] Failed to load cache:", error);
    }
  }

  /**
   * Save cache to AsyncStorage
   */
  private async saveCache(): Promise<void> {
    try {
      const entries = Array.from(this.cache.entries());
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(entries));
    } catch (error) {
      console.error("[LLMService] Failed to save cache:", error);
    }
  }

  /**
   * Get time of day category
   */
  public static getTimeOfDay(): CoachingContext["timeOfDay"] {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return "morning";
    if (hour >= 12 && hour < 17) return "afternoon";
    if (hour >= 17 && hour < 21) return "evening";
    return "night";
  }

  /**
   * Get day of week
   */
  public static getDayOfWeek(): string {
    return new Date().toLocaleDateString("en-US", { weekday: "long" });
  }

  /**
   * Clear conversation history
   */
  public clearHistory(): void {
    this.conversationHistory = [];
  }

  /**
   * Clear cache
   */
  public async clearCache(): Promise<void> {
    this.cache.clear();
    await AsyncStorage.removeItem(CACHE_KEY);
  }
}

// Export singleton getter
export const getLLMService = () => LLMService.getInstance();

export default LLMService;
