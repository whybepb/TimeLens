/**
 * useChartData - React hook for chart data aggregation
 */

import { useMemo } from "react";
import { DailyLog } from "../services";
import { useStreaks } from "./useStreaks";

export interface ChartDataPoint {
    date: string;
    label: string; // Short day label (Mon, Tue, etc.)
    value: number;
    isToday: boolean;
}

export interface WeeklyChartData {
    steps: ChartDataPoint[];
    sleep: ChartDataPoint[];
    focus: ChartDataPoint[];
    pvc: ChartDataPoint[];
    calories: ChartDataPoint[];
}

export interface HeatmapDay {
    date: string;
    dayOfMonth: number;
    value: number; // PVC score or goals met
    intensity: number; // 0-4 for color intensity
}

export interface UseChartDataReturn {
    weeklyData: WeeklyChartData;
    monthlyHeatmap: HeatmapDay[];
    averages: {
        steps: number;
        sleep: number;
        focus: number;
        pvc: number;
        calories: number;
    };
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/**
 * Get the past N days as date strings
 */
const getPastDays = (n: number): string[] => {
    const days: string[] = [];
    const today = new Date();

    for (let i = n - 1; i >= 0; i--) {
        const date = new Date(today);
        date.setDate(date.getDate() - i);
        days.push(date.toISOString().split("T")[0]);
    }

    return days;
};

/**
 * Get intensity level (0-4) based on value and max
 */
const getIntensity = (value: number, max: number): number => {
    if (value === 0) return 0;
    const ratio = value / max;
    if (ratio >= 0.8) return 4;
    if (ratio >= 0.6) return 3;
    if (ratio >= 0.4) return 2;
    if (ratio >= 0.2) return 1;
    return 0;
};

export function useChartData(): UseChartDataReturn {
    const { dailyLogs, getMonthLogs } = useStreaks();

    // Create a map for quick log lookup
    const logMap = useMemo(() => {
        const map = new Map<string, DailyLog>();
        dailyLogs.forEach((log) => map.set(log.date, log));
        return map;
    }, [dailyLogs]);

    // Generate weekly chart data
    const weeklyData = useMemo((): WeeklyChartData => {
        const pastWeek = getPastDays(7);
        const todayStr = new Date().toISOString().split("T")[0];

        const createDataPoints = (key: keyof DailyLog): ChartDataPoint[] => {
            return pastWeek.map((dateStr) => {
                const date = new Date(dateStr);
                const log = logMap.get(dateStr);
                const value = log ? (log[key] as number) ?? 0 : 0;

                return {
                    date: dateStr,
                    label: DAY_LABELS[date.getDay()],
                    value,
                    isToday: dateStr === todayStr,
                };
            });
        };

        return {
            steps: createDataPoints("steps"),
            sleep: pastWeek.map((dateStr) => {
                const date = new Date(dateStr);
                const log = logMap.get(dateStr);
                return {
                    date: dateStr,
                    label: DAY_LABELS[date.getDay()],
                    value: log?.sleepHours ?? 0,
                    isToday: dateStr === todayStr,
                };
            }),
            focus: createDataPoints("focusMinutes"),
            pvc: createDataPoints("pvcScore"),
            calories: createDataPoints("activeCalories"),
        };
    }, [logMap]);

    // Generate monthly heatmap data
    const monthlyHeatmap = useMemo((): HeatmapDay[] => {
        const now = new Date();
        const year = now.getFullYear();
        const month = now.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const monthLogs = getMonthLogs(year, month);
        const monthLogMap = new Map<string, DailyLog>();
        monthLogs.forEach((log) => monthLogMap.set(log.date, log));

        const maxPvc = 100; // PVC is 0-100

        const heatmap: HeatmapDay[] = [];
        for (let day = 1; day <= daysInMonth; day++) {
            const dateStr = `${year}-${String(month + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const log = monthLogMap.get(dateStr);
            const value = log?.pvcScore ?? 0;

            heatmap.push({
                date: dateStr,
                dayOfMonth: day,
                value,
                intensity: getIntensity(value, maxPvc),
            });
        }

        return heatmap;
    }, [getMonthLogs]);

    // Calculate averages
    const averages = useMemo(() => {
        if (dailyLogs.length === 0) {
            return { steps: 0, sleep: 0, focus: 0, pvc: 0, calories: 0 };
        }

        const sum = dailyLogs.reduce(
            (acc, log) => ({
                steps: acc.steps + log.steps,
                sleep: acc.sleep + (log.sleepHours ?? 0),
                focus: acc.focus + log.focusMinutes,
                pvc: acc.pvc + log.pvcScore,
                calories: acc.calories + log.activeCalories,
            }),
            { steps: 0, sleep: 0, focus: 0, pvc: 0, calories: 0 }
        );

        const count = dailyLogs.length;
        return {
            steps: Math.round(sum.steps / count),
            sleep: Math.round((sum.sleep / count) * 10) / 10,
            focus: Math.round(sum.focus / count),
            pvc: Math.round(sum.pvc / count),
            calories: Math.round(sum.calories / count),
        };
    }, [dailyLogs]);

    return {
        weeklyData,
        monthlyHeatmap,
        averages,
    };
}
