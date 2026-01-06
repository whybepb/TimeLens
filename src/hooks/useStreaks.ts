/**
 * useStreaks - React hook for streak tracking
 */

import { useCallback, useEffect, useState } from "react";
import { DailyLog, getStreakService, Streak, StreakData, StreakType } from "../services";

export interface UseStreaksReturn {
    streaks: StreakData;
    overallStreak: Streak;
    dailyLogs: DailyLog[];
    recordCompletion: (type: StreakType, completed: boolean) => Promise<void>;
    saveDailyLog: (log: Omit<DailyLog, "date">) => Promise<void>;
    getMonthLogs: (year: number, month: number) => DailyLog[];
}

export function useStreaks(): UseStreaksReturn {
    const streakService = getStreakService();

    const [streaks, setStreaks] = useState<StreakData>(streakService.getStreaks());
    const [dailyLogs, setDailyLogs] = useState<DailyLog[]>(streakService.getDailyLogs(30));

    // Subscribe to streak changes
    useEffect(() => {
        const unsubscribe = streakService.subscribe(() => {
            setStreaks(streakService.getStreaks());
            setDailyLogs(streakService.getDailyLogs(30));
        });
        return unsubscribe;
    }, []);

    // Record goal completion
    const recordCompletion = useCallback(async (type: StreakType, completed: boolean) => {
        await streakService.recordGoalCompletion(type, completed);
    }, []);

    // Save daily log
    const saveDailyLog = useCallback(async (log: Omit<DailyLog, "date">) => {
        await streakService.saveDailyLog(log);
    }, []);

    // Get logs for a specific month
    const getMonthLogs = useCallback((year: number, month: number) => {
        return streakService.getMonthLogs(year, month);
    }, []);

    return {
        streaks,
        overallStreak: streaks.overall,
        dailyLogs,
        recordCompletion,
        saveDailyLog,
        getMonthLogs,
    };
}
