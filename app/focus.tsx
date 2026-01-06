/**
 * Focus Screen - Pomodoro Timer with Deep Focus Mode
 * Beautiful glassmorphic timer with session history
 */

import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { ArrowLeft, History, Settings2, Sparkles, Timer } from "lucide-react-native";
import React, { useState } from "react";
import {
    Modal,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeIn, FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    AnimatedBackground,
    FocusTimer,
    GlassButton,
    GlassCard,
} from "../src/components";
import { useFocusTimer } from "../src/hooks/useFocusTimer";

export default function FocusScreen() {
    const router = useRouter();
    const [showSettings, setShowSettings] = useState(false);
    const [showHistory, setShowHistory] = useState(false);

    const {
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
    } = useFocusTimer();

    const isIdle = timerState === "idle";
    const isCompleted = timerState === "completed";

    return (
        <View className="flex-1 bg-charcoal-950">
            {/* Animated background */}
            <AnimatedBackground
                preset={sessionType === "focus" ? "violet" : "electric"}
                intensity="subtle"
            />

            <SafeAreaView className="flex-1">
                {/* Header */}
                <Animated.View
                    entering={FadeInDown.duration(400)}
                    className="flex-row items-center justify-between px-6 py-4"
                >
                    <TouchableOpacity
                        onPress={() => router.back()}
                        className="w-10 h-10 rounded-xl bg-white/[0.08] items-center justify-center"
                    >
                        <ArrowLeft size={20} color="#fff" />
                    </TouchableOpacity>

                    <View className="flex-row items-center gap-2">
                        <Timer size={20} color="#A459FF" />
                        <Text className="text-white font-bold text-lg">Focus</Text>
                    </View>

                    <View className="flex-row gap-2">
                        <TouchableOpacity
                            onPress={() => setShowHistory(true)}
                            className="w-10 h-10 rounded-xl bg-white/[0.08] items-center justify-center"
                        >
                            <History size={18} color="rgba(255,255,255,0.6)" />
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => setShowSettings(true)}
                            className="w-10 h-10 rounded-xl bg-white/[0.08] items-center justify-center"
                        >
                            <Settings2 size={18} color="rgba(255,255,255,0.6)" />
                        </TouchableOpacity>
                    </View>
                </Animated.View>

                <ScrollView
                    className="flex-1"
                    contentContainerStyle={{
                        flexGrow: 1,
                        justifyContent: "center",
                        paddingHorizontal: 24,
                        paddingBottom: 40,
                    }}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Intention Input (only when idle) */}
                    {isIdle && (
                        <Animated.View
                            entering={FadeIn.duration(400)}
                            className="mb-8"
                        >
                            <View
                                style={{
                                    borderRadius: 20,
                                    overflow: "hidden",
                                    borderWidth: 1,
                                    borderColor: "rgba(255, 255, 255, 0.1)",
                                }}
                            >
                                {Platform.OS === "ios" && (
                                    <BlurView
                                        intensity={20}
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
                                        backgroundColor: Platform.OS === "android" ? "rgba(255,255,255,0.06)" : "transparent",
                                        padding: 16,
                                    }}
                                >
                                    <View className="flex-row items-center gap-2 mb-2">
                                        <Sparkles size={16} color="#A459FF" />
                                        <Text className="text-white/60 text-sm font-medium">
                                            Set your intention
                                        </Text>
                                    </View>
                                    <TextInput
                                        value={intention}
                                        onChangeText={setIntention}
                                        placeholder="What will you focus on?"
                                        placeholderTextColor="rgba(255,255,255,0.3)"
                                        className="text-white text-base"
                                        multiline
                                        maxLength={100}
                                    />
                                </View>
                            </View>
                        </Animated.View>
                    )}

                    {/* Main Timer */}
                    <Animated.View entering={FadeInDown.delay(100).duration(500)}>
                        <FocusTimer
                            timerState={timerState}
                            sessionType={sessionType}
                            timeRemaining={timeRemaining}
                            totalDuration={totalDuration}
                            progress={progress}
                            completedFocusSessions={completedFocusSessions}
                            onStart={start}
                            onPause={pause}
                            onResume={resume}
                            onSkip={skip}
                            onReset={reset}
                        />
                    </Animated.View>

                    {/* Completion celebration */}
                    {isCompleted && (
                        <Animated.View
                            entering={FadeIn.duration(400)}
                            className="mt-8 items-center"
                        >
                            <View
                                style={{
                                    backgroundColor: "rgba(52, 211, 153, 0.15)",
                                    borderWidth: 1,
                                    borderColor: "rgba(52, 211, 153, 0.3)",
                                    borderRadius: 20,
                                    paddingHorizontal: 24,
                                    paddingVertical: 16,
                                }}
                            >
                                <Text className="text-emerald-400 text-center font-semibold text-lg">
                                    🎉 Session Complete!
                                </Text>
                                <Text className="text-emerald-400/70 text-center text-sm mt-1">
                                    {sessionType === "focus"
                                        ? "Time for a break"
                                        : "Ready to focus again?"}
                                </Text>
                            </View>
                        </Animated.View>
                    )}

                    {/* Stats summary */}
                    <Animated.View
                        entering={FadeInDown.delay(200).duration(400)}
                        className="mt-10"
                    >
                        <GlassCard variant="light" padding="md">
                            <View className="flex-row justify-around">
                                <View className="items-center">
                                    <Text className="text-white font-bold text-2xl">{stats.todaySessions}</Text>
                                    <Text className="text-white/40 text-xs mt-1">Today</Text>
                                </View>
                                <View className="w-px h-10 bg-white/10" />
                                <View className="items-center">
                                    <Text className="text-white font-bold text-2xl">{stats.todayMinutes}m</Text>
                                    <Text className="text-white/40 text-xs mt-1">Focus Time</Text>
                                </View>
                                <View className="w-px h-10 bg-white/10" />
                                <View className="items-center">
                                    <Text className="text-white font-bold text-2xl">{stats.currentStreak}</Text>
                                    <Text className="text-white/40 text-xs mt-1">Streak</Text>
                                </View>
                            </View>
                        </GlassCard>
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>

            {/* Settings Modal */}
            <Modal visible={showSettings} transparent animationType="fade">
                <View className="flex-1 bg-black/70 justify-center px-6">
                    <View className="bg-charcoal-800 rounded-3xl p-6 border border-charcoal-700">
                        <Text className="text-white text-xl font-bold mb-6">Timer Settings</Text>

                        {/* Focus Duration */}
                        <View className="mb-4">
                            <Text className="text-white/60 text-sm mb-2">Focus Duration (min)</Text>
                            <View className="flex-row gap-2">
                                {[15, 25, 30, 45, 60].map((mins) => (
                                    <TouchableOpacity
                                        key={mins}
                                        onPress={() => updateSettings({ focusDuration: mins })}
                                        className={`flex-1 py-3 rounded-xl items-center ${settings.focusDuration === mins
                                                ? "bg-violet-500/30 border border-violet-500"
                                                : "bg-white/10"
                                            }`}
                                    >
                                        <Text
                                            className={
                                                settings.focusDuration === mins ? "text-violet-400" : "text-white/60"
                                            }
                                        >
                                            {mins}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Break Duration */}
                        <View className="mb-4">
                            <Text className="text-white/60 text-sm mb-2">Short Break (min)</Text>
                            <View className="flex-row gap-2">
                                {[3, 5, 10, 15].map((mins) => (
                                    <TouchableOpacity
                                        key={mins}
                                        onPress={() => updateSettings({ shortBreakDuration: mins })}
                                        className={`flex-1 py-3 rounded-xl items-center ${settings.shortBreakDuration === mins
                                                ? "bg-emerald-500/30 border border-emerald-500"
                                                : "bg-white/10"
                                            }`}
                                    >
                                        <Text
                                            className={
                                                settings.shortBreakDuration === mins ? "text-emerald-400" : "text-white/60"
                                            }
                                        >
                                            {mins}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        {/* Long Break Duration */}
                        <View className="mb-6">
                            <Text className="text-white/60 text-sm mb-2">Long Break (min)</Text>
                            <View className="flex-row gap-2">
                                {[10, 15, 20, 30].map((mins) => (
                                    <TouchableOpacity
                                        key={mins}
                                        onPress={() => updateSettings({ longBreakDuration: mins })}
                                        className={`flex-1 py-3 rounded-xl items-center ${settings.longBreakDuration === mins
                                                ? "bg-cyan-500/30 border border-cyan-500"
                                                : "bg-white/10"
                                            }`}
                                    >
                                        <Text
                                            className={
                                                settings.longBreakDuration === mins ? "text-cyan-400" : "text-white/60"
                                            }
                                        >
                                            {mins}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>
                        </View>

                        <GlassButton
                            title="Done"
                            onPress={() => setShowSettings(false)}
                            variant="primary"
                            fullWidth
                        />
                    </View>
                </View>
            </Modal>

            {/* History Modal */}
            <Modal visible={showHistory} transparent animationType="fade">
                <View className="flex-1 bg-black/70 justify-end">
                    <View className="bg-charcoal-800 rounded-t-3xl p-6 max-h-[70%] border-t border-charcoal-700">
                        <View className="flex-row items-center justify-between mb-4">
                            <Text className="text-white text-xl font-bold">Session History</Text>
                            <TouchableOpacity onPress={() => setShowHistory(false)}>
                                <Text className="text-violet-400 font-medium">Done</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView showsVerticalScrollIndicator={false}>
                            {sessions.length === 0 ? (
                                <View className="py-8 items-center">
                                    <Text className="text-white/40">No sessions yet</Text>
                                    <Text className="text-white/30 text-sm mt-1">Start your first focus session!</Text>
                                </View>
                            ) : (
                                sessions.map((session) => (
                                    <View
                                        key={session.id}
                                        className="flex-row items-center justify-between py-3 border-b border-white/[0.06]"
                                    >
                                        <View className="flex-row items-center gap-3">
                                            <View
                                                className="w-10 h-10 rounded-xl items-center justify-center"
                                                style={{
                                                    backgroundColor:
                                                        session.type === "focus"
                                                            ? "rgba(164, 89, 255, 0.2)"
                                                            : "rgba(52, 211, 153, 0.2)",
                                                }}
                                            >
                                                <Text className="text-lg">
                                                    {session.type === "focus" ? "🎯" : "☕"}
                                                </Text>
                                            </View>
                                            <View>
                                                <Text className="text-white font-medium">
                                                    {session.type === "focus"
                                                        ? "Focus Session"
                                                        : session.type === "shortBreak"
                                                            ? "Short Break"
                                                            : "Long Break"}
                                                </Text>
                                                <Text className="text-white/40 text-xs">
                                                    {Math.round(session.duration / 60)} min
                                                    {session.wasInterrupted ? " (interrupted)" : ""}
                                                </Text>
                                            </View>
                                        </View>
                                        <Text className="text-white/30 text-xs">
                                            {new Date(session.completedAt).toLocaleTimeString([], {
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </Text>
                                    </View>
                                ))
                            )}
                        </ScrollView>
                    </View>
                </View>
            </Modal>
        </View>
    );
}
