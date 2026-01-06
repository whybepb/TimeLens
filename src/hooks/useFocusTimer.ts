/**
 * useFocusTimer - React hook for Pomodoro timer functionality
 * Manages timer state, countdown, and session completion
 */

import * as Haptics from "expo-haptics";
import { useCallback, useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus } from "react-native";

import {
    FocusSession,
    FocusSettings,
    FocusStats,
    getFocusService,
    SessionType,
} from "../services/FocusService";

export type TimerState = "idle" | "running" | "paused" | "completed";

export interface UseFocusTimerReturn {
    // Timer state
    timerState: TimerState;
    sessionType: SessionType;
    timeRemaining: number; // seconds
    totalDuration: number; // seconds
    progress: number; // 0-1

    // Session info
    intention: string;
    setIntention: (text: string) => void;
    completedFocusSessions: number;

    // Controls
    start: () => void;
    pause: () => void;
    resume: () => void;
    skip: () => void;
    reset: () => void;

    // Settings & Stats
    settings: FocusSettings;
    stats: FocusStats;
    sessions: FocusSession[];
    updateSettings: (updates: Partial<FocusSettings>) => Promise<void>;
}

export function useFocusTimer(): UseFocusTimerReturn {
    const focusService = getFocusService();

    // Timer state
    const [timerState, setTimerState] = useState<TimerState>("idle");
    const [sessionType, setSessionType] = useState<SessionType>("focus");
    const [timeRemaining, setTimeRemaining] = useState(25 * 60);
    const [totalDuration, setTotalDuration] = useState(25 * 60);
    const [intention, setIntention] = useState("");
    const [completedFocusSessions, setCompletedFocusSessions] = useState(0);

    // Settings & data
    const [settings, setSettings] = useState<FocusSettings>(focusService.getSettings());
    const [stats, setStats] = useState<FocusStats>(focusService.getStats());
    const [sessions, setSessions] = useState<FocusSession[]>(focusService.getSessions());

    // Refs
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const startTimeRef = useRef<number>(0);
    const pausedTimeRef = useRef<number>(0);
    const appStateRef = useRef<AppStateStatus>(AppState.currentState);

    // Subscribe to service changes
    useEffect(() => {
        const unsubscribe = focusService.subscribe(() => {
            setSettings(focusService.getSettings());
            setStats(focusService.getStats());
            setSessions(focusService.getSessions());
        });
        return unsubscribe;
    }, []);

    // Initialize timer duration based on settings
    useEffect(() => {
        if (timerState === "idle") {
            const duration = focusService.getDurationForType(sessionType);
            setTimeRemaining(duration);
            setTotalDuration(duration);
        }
    }, [sessionType, settings, timerState]);

    // Handle app state changes (background/foreground)
    useEffect(() => {
        const handleAppStateChange = (nextState: AppStateStatus) => {
            if (
                appStateRef.current.match(/inactive|background/) &&
                nextState === "active" &&
                timerState === "running"
            ) {
                // App came to foreground - recalculate remaining time
                const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
                const remaining = Math.max(0, totalDuration - elapsed);
                setTimeRemaining(remaining);

                if (remaining === 0) {
                    handleComplete();
                }
            }
            appStateRef.current = nextState;
        };

        const subscription = AppState.addEventListener("change", handleAppStateChange);
        return () => subscription.remove();
    }, [timerState, totalDuration]);

    // Timer countdown effect
    useEffect(() => {
        if (timerState === "running") {
            intervalRef.current = setInterval(() => {
                setTimeRemaining((prev) => {
                    if (prev <= 1) {
                        handleComplete();
                        return 0;
                    }
                    return prev - 1;
                });
            }, 1000);
        } else {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
        }

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
            }
        };
    }, [timerState]);

    // Handle session completion
    const handleComplete = useCallback(async () => {
        setTimerState("completed");

        // Haptic feedback
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

        // Record session
        await focusService.recordSession(
            sessionType,
            totalDuration,
            false, // not interrupted
            intention || undefined
        );

        // Update focus session count
        if (sessionType === "focus") {
            setCompletedFocusSessions((prev) => prev + 1);
        }

        // Determine next session type
        if (sessionType === "focus") {
            const nextType = focusService.getNextSessionType(completedFocusSessions + 1);
            setSessionType(nextType);
        } else {
            setSessionType("focus");
        }

        console.log("[useFocusTimer] Session completed:", sessionType);
    }, [sessionType, totalDuration, intention, completedFocusSessions]);

    // Timer controls
    const start = useCallback(() => {
        const duration = focusService.getDurationForType(sessionType);
        setTotalDuration(duration);
        setTimeRemaining(duration);
        startTimeRef.current = Date.now();
        setTimerState("running");

        // Light haptic on start
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);

        console.log("[useFocusTimer] Started:", sessionType, duration);
    }, [sessionType]);

    const pause = useCallback(() => {
        setTimerState("paused");
        pausedTimeRef.current = timeRemaining;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, [timeRemaining]);

    const resume = useCallback(() => {
        startTimeRef.current = Date.now() - (totalDuration - pausedTimeRef.current) * 1000;
        setTimerState("running");
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }, [totalDuration]);

    const skip = useCallback(async () => {
        // Record as interrupted if was running
        if (timerState === "running" || timerState === "paused") {
            const elapsed = totalDuration - timeRemaining;
            if (elapsed > 60 && sessionType === "focus") {
                // Only record if at least 1 minute was spent
                await focusService.recordSession(sessionType, elapsed, true, intention);
            }
        }

        // Skip to next session
        if (sessionType === "focus") {
            const nextType = focusService.getNextSessionType(completedFocusSessions);
            setSessionType(nextType);
        } else {
            setSessionType("focus");
        }

        setTimerState("idle");
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    }, [timerState, sessionType, totalDuration, timeRemaining, intention, completedFocusSessions]);

    const reset = useCallback(() => {
        setTimerState("idle");
        setSessionType("focus");
        setCompletedFocusSessions(0);
        setIntention("");
        const duration = focusService.getDurationForType("focus");
        setTimeRemaining(duration);
        setTotalDuration(duration);
    }, []);

    const updateSettings = useCallback(async (updates: Partial<FocusSettings>) => {
        await focusService.updateSettings(updates);
    }, []);

    // Calculate progress
    const progress = totalDuration > 0 ? 1 - timeRemaining / totalDuration : 0;

    return {
        timerState,
        sessionType,
        timeRemaining,
        totalDuration,
        progress,
        intention,
        setIntention,
        completedFocusSessions,
        start,
        pause,
        resume,
        skip,
        reset,
        settings,
        stats,
        sessions,
        updateSettings,
    };
}

export default useFocusTimer;
