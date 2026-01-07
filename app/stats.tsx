/**
 * Stats Screen - Goals, Streaks, and Data Visualization
 * Premium glassmorphic design with animated charts
 */

import { BlurView } from "expo-blur";
import { useRouter } from "expo-router";
import { ArrowLeft, Flame, Target, TrendingUp } from "lucide-react-native";
import React, { useState } from "react";
import { Platform, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    AnimatedBackground,
    CalendarHeatmap,
    GlassCard,
    GoalCard,
    ProgressRings,
    StreakBadge,
    WeeklyChart,
} from "../src/components";
import { useTheme } from "../src/contexts";
import { useChartData, useGoals, useProductivityData, useStreaks } from "../src/hooks";

type ChartType = "steps" | "sleep" | "focus" | "pvc";

const CHART_OPTIONS: { key: ChartType; label: string; icon: string; color: string }[] = [
    { key: "steps", label: "Steps", icon: "👟", color: "#34D399" },
    { key: "pvc", label: "PVC", icon: "⚡", color: "#FBBF24" },
    { key: "focus", label: "Focus", icon: "🎯", color: "#22D3EE" },
    { key: "sleep", label: "Sleep", icon: "🌙", color: "#A459FF" },
];

interface SectionHeaderProps {
    icon: React.ElementType;
    iconColor: string;
    title: string;
    rightElement?: React.ReactNode;
}

const SectionHeader: React.FC<SectionHeaderProps> = ({
    icon: Icon,
    iconColor,
    title,
    rightElement,
}) => (
    <View className="flex-row items-center justify-between mb-4">
        <View className="flex-row items-center gap-3">
            <View
                style={{
                    width: 36,
                    height: 36,
                    borderRadius: 12,
                    backgroundColor: `${iconColor}20`,
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <Icon size={18} color={iconColor} />
            </View>
            <Text className="text-white font-semibold text-lg">{title}</Text>
        </View>
        {rightElement}
    </View>
);

export default function StatsScreen() {
    const router = useRouter();
    const { refresh, isLoading } = useProductivityData();
    const { progress, completedCount, totalGoals, setGoal } = useGoals();
    const { streaks, overallStreak } = useStreaks();
    const { weeklyData, monthlyHeatmap, averages } = useChartData();
    const { currentTheme } = useTheme();

    const [selectedChart, setSelectedChart] = useState<ChartType>("steps");

    const currentChartOption = CHART_OPTIONS.find((o) => o.key === selectedChart)!;

    return (
        <View style={{ flex: 1, backgroundColor: currentTheme.colors.background.primary }}>
            {/* Animated background */}
            <AnimatedBackground intensity="subtle" />

            <SafeAreaView className="flex-1">
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoading}
                            onRefresh={refresh}
                            tintColor={currentTheme.colors.primary.primary}
                        />
                    }
                >
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
                        <Text className="text-white font-bold text-xl">Statistics</Text>
                        <View className="w-10" />
                    </Animated.View>

                    {/* Streak Overview */}
                    <Animated.View
                        entering={FadeInDown.delay(100).duration(400)}
                        className="px-6 mb-6"
                    >
                        <SectionHeader
                            icon={Flame}
                            iconColor="#FB7185"
                            title="Your Streak"
                            rightElement={
                                <StreakBadge
                                    currentStreak={overallStreak.currentStreak}
                                    longestStreak={overallStreak.longestStreak}
                                    isActiveToday={overallStreak.isActiveToday}
                                    size="lg"
                                />
                            }
                        />
                    </Animated.View>

                    {/* Goals Progress */}
                    <Animated.View
                        entering={FadeInDown.delay(200).duration(400)}
                        className="px-6 mb-6"
                    >
                        <SectionHeader
                            icon={Target}
                            iconColor="#22D3EE"
                            title="Daily Goals"
                            rightElement={
                                <View className="bg-white/[0.08] px-3 py-1.5 rounded-full">
                                    <Text className="text-white/60 text-sm font-medium">
                                        {completedCount}/{totalGoals}
                                    </Text>
                                </View>
                            }
                        />

                        <View
                            style={{
                                borderRadius: 24,
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
                                    backgroundColor: Platform.OS === "android" ? "rgba(255, 255, 255, 0.06)" : "transparent",
                                    padding: 20,
                                }}
                            >
                                <ProgressRings goals={progress} size={150} strokeWidth={9} />
                            </View>
                        </View>

                        {/* Individual Goal Cards */}
                        <View className="gap-3 mt-4">
                            {progress.map((goal, index) => (
                                <Animated.View
                                    key={goal.type}
                                    entering={FadeInDown.delay(300 + index * 100).duration(400)}
                                >
                                    <GoalCard goal={goal} onUpdateGoal={setGoal} compact />
                                </Animated.View>
                            ))}
                        </View>
                    </Animated.View>

                    {/* Weekly Charts */}
                    <Animated.View
                        entering={FadeInDown.delay(400).duration(400)}
                        className="px-6 mb-6"
                    >
                        <SectionHeader icon={TrendingUp} iconColor="#34D399" title="Weekly Trends" />

                        {/* Chart type selector */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="mb-4"
                            contentContainerStyle={{ gap: 10 }}
                        >
                            {CHART_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option.key}
                                    onPress={() => setSelectedChart(option.key)}
                                    style={{
                                        flexDirection: "row",
                                        alignItems: "center",
                                        gap: 8,
                                        paddingHorizontal: 14,
                                        paddingVertical: 10,
                                        borderRadius: 14,
                                        backgroundColor:
                                            selectedChart === option.key
                                                ? "rgba(255, 255, 255, 0.12)"
                                                : "rgba(255, 255, 255, 0.04)",
                                        borderWidth: 1,
                                        borderColor:
                                            selectedChart === option.key
                                                ? "rgba(255, 255, 255, 0.2)"
                                                : "rgba(255, 255, 255, 0.08)",
                                    }}
                                >
                                    <Text style={{ fontSize: 16 }}>{option.icon}</Text>
                                    <Text
                                        style={{
                                            color: selectedChart === option.key ? "#fff" : "rgba(255, 255, 255, 0.5)",
                                            fontWeight: selectedChart === option.key ? "600" : "400",
                                            fontSize: 14,
                                        }}
                                    >
                                        {option.label}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        {/* Chart */}
                        <WeeklyChart
                            data={weeklyData[selectedChart]}
                            title={`${currentChartOption.label} This Week`}
                            color={currentChartOption.color}
                            icon={currentChartOption.icon}
                        />
                    </Animated.View>

                    {/* Calendar Heatmap */}
                    <Animated.View
                        entering={FadeInDown.delay(500).duration(400)}
                        className="px-6 mb-6"
                    >
                        <CalendarHeatmap
                            data={monthlyHeatmap}
                            title="Activity This Month"
                            onDayPress={(day) => {
                                console.log("Tapped day:", day);
                            }}
                        />
                    </Animated.View>

                    {/* Averages Summary */}
                    <Animated.View
                        entering={FadeInDown.delay(600).duration(400)}
                        className="px-6"
                    >
                        <GlassCard variant="light" padding="lg">
                            <Text className="text-white font-semibold text-lg mb-4">30-Day Averages</Text>
                            <View className="flex-row flex-wrap gap-4">
                                <View className="flex-1 min-w-[80px]">
                                    <Text className="text-white/40 text-xs mb-1 font-medium">Steps</Text>
                                    <Text className="text-white font-bold text-2xl tracking-tight">
                                        {averages.steps.toLocaleString()}
                                    </Text>
                                </View>
                                <View className="flex-1 min-w-[80px]">
                                    <Text className="text-white/40 text-xs mb-1 font-medium">Sleep</Text>
                                    <Text className="text-white font-bold text-2xl tracking-tight">
                                        {averages.sleep}h
                                    </Text>
                                </View>
                                <View className="flex-1 min-w-[80px]">
                                    <Text className="text-white/40 text-xs mb-1 font-medium">Focus</Text>
                                    <Text className="text-white font-bold text-2xl tracking-tight">
                                        {averages.focus}m
                                    </Text>
                                </View>
                                <View className="flex-1 min-w-[80px]">
                                    <Text className="text-white/40 text-xs mb-1 font-medium">PVC</Text>
                                    <Text className="text-white font-bold text-2xl tracking-tight">
                                        {averages.pvc}
                                    </Text>
                                </View>
                            </View>
                        </GlassCard>
                    </Animated.View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
