/**
 * useLLMCoach - Hook for AI-powered coaching
 * Provides personalized advice using LLM
 */

import { useState, useEffect, useCallback } from "react";
import { getLLMService, LLMResponse, CoachingContext } from "../services/LLMService";
import { useProductivityData } from "./useProductivityData";
import LLMService from "../services/LLMService";

export interface LLMCoachState {
  advice: string;
  actionItems: string[];
  motivation: string;
  isLoading: boolean;
  isOnline: boolean;
  isCached: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  setApiKey: (provider: "groq" | "openai", key: string) => void;
}

export function useLLMCoach(): LLMCoachState {
  const { stats, pvc } = useProductivityData();
  const [response, setResponse] = useState<LLMResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const llmService = getLLMService();

  const fetchAdvice = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const context: CoachingContext = {
        stats,
        pvc,
        timeOfDay: LLMService.getTimeOfDay(),
        dayOfWeek: LLMService.getDayOfWeek(),
      };

      const result = await llmService.getCoachingAdvice(context);
      setResponse(result);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Failed to get advice";
      setError(message);
      console.error("[useLLMCoach] Error:", err);
    } finally {
      setIsLoading(false);
    }
  }, [stats, pvc, llmService]);

  // Fetch advice on mount and when data changes significantly
  useEffect(() => {
    fetchAdvice();
  }, [pvc.level]); // Only refetch when level changes to avoid too many calls

  const setApiKey = useCallback((provider: "groq" | "openai", key: string) => {
    llmService.setApiKey(provider, key);
    fetchAdvice(); // Refetch with new provider
  }, [llmService, fetchAdvice]);

  return {
    advice: response?.advice || "Analyzing your data...",
    actionItems: response?.actionItems || [],
    motivation: response?.motivation || "",
    isLoading,
    isOnline: llmService.getProvider() !== "offline",
    isCached: response?.cached || false,
    error,
    refresh: fetchAdvice,
    setApiKey,
  };
}

export default useLLMCoach;
