/**
 * useGoals - React hook for goal management
 */

import { useCallback, useEffect, useState } from "react";
import { getGoalService, GoalProgress, GoalType, UserGoals } from "../services";
import { useProductivityData } from "./useProductivityData";

export interface UseGoalsReturn {
    goals: UserGoals;
    progress: GoalProgress[];
    completedCount: number;
    totalGoals: number;
    isLoading: boolean;
    setGoal: (type: GoalType, target: number) => Promise<void>;
    resetGoals: () => Promise<void>;
}

export function useGoals(): UseGoalsReturn {
    const goalService = getGoalService();
    const { stats, pvc } = useProductivityData();

    const [goals, setGoals] = useState<UserGoals>(goalService.getGoals());
    const [isLoading, setIsLoading] = useState(false);

    // Calculate progress based on current stats
    const progress = goalService.calculateProgress({
        steps: stats.steps,
        sleepHours: stats.sleepHours,
        focusMinutes: stats.focusTimeMinutes,
        pvcScore: pvc.score,
        activeCalories: stats.activeCalories,
    });

    const completedCount = progress.filter((p) => p.isCompleted).length;
    const totalGoals = progress.length;

    // Subscribe to goal changes
    useEffect(() => {
        const unsubscribe = goalService.subscribe(() => {
            setGoals(goalService.getGoals());
        });
        return unsubscribe;
    }, []);

    // Update a single goal
    const setGoal = useCallback(async (type: GoalType, target: number) => {
        setIsLoading(true);
        try {
            await goalService.setGoal(type, target);
        } finally {
            setIsLoading(false);
        }
    }, []);

    // Reset all goals to defaults
    const resetGoals = useCallback(async () => {
        setIsLoading(true);
        try {
            await goalService.resetGoals();
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        goals,
        progress,
        completedCount,
        totalGoals,
        isLoading,
        setGoal,
        resetGoals,
    };
}
