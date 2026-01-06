/**
 * FocusTimer - Beautiful circular countdown timer
 * With progress ring, pulsing animations, and session info
 */

import { BlurView } from "expo-blur";
import { Pause, Play, RotateCcw, SkipForward } from "lucide-react-native";
import React, { useEffect } from "react";
import { Platform, Text, TouchableOpacity, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedProps,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withSpring,
    withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

import { SessionType } from "../services/FocusService";

export type TimerState = "idle" | "running" | "paused" | "completed";

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface FocusTimerProps {
    timerState: TimerState;
    sessionType: SessionType;
    timeRemaining: number;
    totalDuration: number;
    progress: number;
    completedFocusSessions: number;
    onStart: () => void;
    onPause: () => void;
    onResume: () => void;
    onSkip: () => void;
    onReset: () => void;
}

const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
};

const getSessionColor = (type: SessionType): string[] => {
    switch (type) {
        case "focus":
            return ["#A459FF", "#7021CC"];
        case "shortBreak":
            return ["#34D399", "#10B981"];
        case "longBreak":
            return ["#22D3EE", "#0891B2"];
        default:
            return ["#A459FF", "#7021CC"];
    }
};

const getSessionLabel = (type: SessionType): string => {
    switch (type) {
        case "focus":
            return "Focus Time";
        case "shortBreak":
            return "Short Break";
        case "longBreak":
            return "Long Break";
        default:
            return "Focus Time";
    }
};

export function FocusTimer({
    timerState,
    sessionType,
    timeRemaining,
    totalDuration,
    progress,
    completedFocusSessions,
    onStart,
    onPause,
    onResume,
    onSkip,
    onReset,
}: FocusTimerProps) {
    const size = 280;
    const strokeWidth = 12;
    const radius = (size - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const colors = getSessionColor(sessionType);

    // Animations
    const progressAnim = useSharedValue(0);
    const pulseAnim = useSharedValue(1);
    const glowOpacity = useSharedValue(0.3);

    // Sync progress animation
    useEffect(() => {
        progressAnim.value = withTiming(progress, {
            duration: 300,
            easing: Easing.out(Easing.cubic),
        });
    }, [progress]);

    // Pulse animation when running
    useEffect(() => {
        if (timerState === "running") {
            pulseAnim.value = withRepeat(
                withSequence(
                    withTiming(1.05, { duration: 1000 }),
                    withTiming(1, { duration: 1000 })
                ),
                -1,
                true
            );
            glowOpacity.value = withRepeat(
                withSequence(
                    withTiming(0.6, { duration: 1500 }),
                    withTiming(0.3, { duration: 1500 })
                ),
                -1,
                true
            );
        } else {
            pulseAnim.value = withSpring(1);
            glowOpacity.value = withTiming(0.3);
        }
    }, [timerState]);

    const animatedProgressProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference * (1 - progressAnim.value),
    }));

    const pulseStyle = useAnimatedStyle(() => ({
        transform: [{ scale: pulseAnim.value }],
    }));

    const glowStyle = useAnimatedStyle(() => ({
        opacity: glowOpacity.value,
    }));

    const isIdle = timerState === "idle";
    const isRunning = timerState === "running";
    const isPaused = timerState === "paused";
    const isCompleted = timerState === "completed";

    return (
        <View className="items-center">
            {/* Timer Ring Container */}
            <Animated.View style={pulseStyle}>
                <View style={{ width: size, height: size, position: "relative" }}>
                    {/* Outer glow */}
                    <Animated.View
                        style={[
                            glowStyle,
                            {
                                position: "absolute",
                                top: -20,
                                left: -20,
                                right: -20,
                                bottom: -20,
                                borderRadius: size,
                                backgroundColor: colors[0],
                                transform: [{ scale: 1.1 }],
                            },
                        ]}
                    />

                    {/* SVG Ring */}
                    <Svg width={size} height={size} style={{ position: "relative", zIndex: 1 }}>
                        <Defs>
                            <LinearGradient id="progressGradient" x1="0" y1="0" x2="1" y2="1">
                                <Stop offset="0%" stopColor={colors[0]} />
                                <Stop offset="100%" stopColor={colors[1]} />
                            </LinearGradient>
                        </Defs>

                        {/* Background circle */}
                        <Circle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke="rgba(255, 255, 255, 0.08)"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                        />

                        {/* Progress circle */}
                        <AnimatedCircle
                            cx={size / 2}
                            cy={size / 2}
                            r={radius}
                            stroke="url(#progressGradient)"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeDasharray={circumference}
                            animatedProps={animatedProgressProps}
                            strokeLinecap="round"
                            rotation="-90"
                            origin={`${size / 2}, ${size / 2}`}
                        />
                    </Svg>

                    {/* Center content */}
                    <View className="absolute inset-0 items-center justify-center">
                        {/* Glass background */}
                        <View
                            style={{
                                width: size - strokeWidth * 4,
                                height: size - strokeWidth * 4,
                                borderRadius: (size - strokeWidth * 4) / 2,
                                overflow: "hidden",
                            }}
                        >
                            {Platform.OS === "ios" && (
                                <BlurView
                                    intensity={40}
                                    tint="dark"
                                    style={{
                                        position: "absolute",
                                        top: 0,
                                        left: 0,
                                        right: 0,
                                        bottom: 0,
                                    }}
                                />
                            )}
                            <View
                                style={{
                                    flex: 1,
                                    backgroundColor: Platform.OS === "android" ? "rgba(13, 13, 15, 0.9)" : "transparent",
                                    alignItems: "center",
                                    justifyContent: "center",
                                }}
                            >
                                {/* Session type label */}
                                <Text
                                    className="text-white/50 text-sm font-medium uppercase tracking-wider mb-2"
                                >
                                    {getSessionLabel(sessionType)}
                                </Text>

                                {/* Time display */}
                                <Text className="text-white font-bold text-5xl tracking-tight">
                                    {formatTime(timeRemaining)}
                                </Text>

                                {/* Completed sessions */}
                                <View className="flex-row items-center gap-1 mt-3">
                                    {[...Array(4)].map((_, i) => (
                                        <View
                                            key={i}
                                            className="w-2 h-2 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    i < completedFocusSessions % 4
                                                        ? colors[0]
                                                        : "rgba(255, 255, 255, 0.15)",
                                            }}
                                        />
                                    ))}
                                </View>
                            </View>
                        </View>
                    </View>
                </View>
            </Animated.View>

            {/* Control Buttons */}
            <View className="flex-row items-center justify-center gap-4 mt-10">
                {/* Reset button */}
                {!isIdle && (
                    <TouchableOpacity
                        onPress={onReset}
                        className="w-14 h-14 rounded-full bg-white/[0.08] items-center justify-center"
                        activeOpacity={0.7}
                    >
                        <RotateCcw size={22} color="rgba(255, 255, 255, 0.6)" />
                    </TouchableOpacity>
                )}

                {/* Main play/pause button */}
                <TouchableOpacity
                    onPress={isIdle || isCompleted ? onStart : isRunning ? onPause : onResume}
                    style={{
                        width: 72,
                        height: 72,
                        borderRadius: 36,
                        backgroundColor: colors[0],
                        alignItems: "center",
                        justifyContent: "center",
                        shadowColor: colors[0],
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.4,
                        shadowRadius: 12,
                        elevation: 8,
                    }}
                    activeOpacity={0.8}
                >
                    {isRunning ? (
                        <Pause size={28} color="#fff" fill="#fff" />
                    ) : (
                        <Play size={28} color="#fff" fill="#fff" style={{ marginLeft: 4 }} />
                    )}
                </TouchableOpacity>

                {/* Skip button */}
                {!isIdle && (
                    <TouchableOpacity
                        onPress={onSkip}
                        className="w-14 h-14 rounded-full bg-white/[0.08] items-center justify-center"
                        activeOpacity={0.7}
                    >
                        <SkipForward size={22} color="rgba(255, 255, 255, 0.6)" />
                    </TouchableOpacity>
                )}
            </View>
        </View>
    );
}

export default FocusTimer;
