/**
 * Stats Screen - Goals, Streaks, and Data Visualization
 */

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { ArrowLeft, Flame, Target, TrendingUp } from "lucide-react-native";
import React, { useState } from "react";
import { RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import {
    CalendarHeatmap,
    GlassCard,
    GoalCard,
    ProgressRings,
    StreakBadge,
    WeeklyChart,
} from "../src/components";
import { useChartData, useGoals, useProductivityData, useStreaks } from "../src/hooks";

type ChartType = "steps" | "sleep" | "focus" | "pvc";

const CHART_OPTIONS: { key: ChartType; label: string; icon: string; color: string }[] = [
    { key: "steps", label: "Steps", icon: "👟", color: "#00E676" },
    { key: "pvc", label: "PVC", icon: "⚡", color: "#FFAB00" },
    { key: "focus", label: "Focus", icon: "🎯", color: "#1AA0FF" },
    { key: "sleep", label: "Sleep", icon: "🌙", color: "#A459FF" },
];

export default function StatsScreen() {
    const router = useRouter();
    const { refresh, isLoading } = useProductivityData();
    const { progress, completedCount, totalGoals, setGoal } = useGoals();
    const { streaks, overallStreak } = useStreaks();
    const { weeklyData, monthlyHeatmap, averages } = useChartData();

    const [selectedChart, setSelectedChart] = useState<ChartType>("steps");

    const currentChartOption = CHART_OPTIONS.find((o) => o.key === selectedChart)!;

    return (
        <View className="flex-1 bg-charcoal-900">
            {/* Gradient background */}
            <LinearGradient
                colors={[
                    "rgba(164, 89, 255, 0.08)",
                    "rgba(26, 160, 255, 0.05)",
                    "transparent",
                ]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 0.6 }}
                className="absolute top-0 left-0 right-0 h-96"
            />

            <SafeAreaView className="flex-1">
                <ScrollView
                    className="flex-1"
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40 }}
                    refreshControl={
                        <RefreshControl
                            refreshing={isLoading}
                            onRefresh={refresh}
                            tintColor="#A459FF"
                        />
                    }
                >
                    {/* Header */}
                    <View className="flex-row items-center justify-between px-6 py-4">
                        <TouchableOpacity
                            onPress={() => router.back()}
                            className="p-2 -ml-2"
                        >
                            <ArrowLeft size={24} color="#fff" />
                        </TouchableOpacity>
                        <Text className="text-white font-semibold text-lg">Statistics</Text>
                        <View className="w-8" />
                    </View>

                    {/* Streak Overview */}
                    <View className="px-6 mb-6">
                        <View className="flex-row items-center justify-between mb-3">
                            <View className="flex-row items-center gap-2">
                                <Flame size={20} color="#FF6B6B" />
                                <Text className="text-white font-semibold">Your Streak</Text>
                            </View>
                            <StreakBadge
                                currentStreak={overallStreak.currentStreak}
                                longestStreak={overallStreak.longestStreak}
                                isActiveToday={overallStreak.isActiveToday}
                                size="lg"
                            />
                        </View>
                    </View>

                    {/* Goals Progress */}
                    <View className="px-6 mb-6">
                        <View className="flex-row items-center gap-2 mb-3">
                            <Target size={20} color="#1AA0FF" />
                            <Text className="text-white font-semibold">Daily Goals</Text>
                            <Text className="text-charcoal-400 text-sm">
                                {completedCount}/{totalGoals} complete
                            </Text>
                        </View>

                        <View className="bg-charcoal-800/50 rounded-2xl p-4 border border-charcoal-700">
                            <ProgressRings goals={progress} size={140} strokeWidth={8} />
                        </View>

                        {/* Individual Goal Cards */}
                        <View className="gap-2 mt-3">
                            {progress.map((goal) => (
                                <GoalCard
                                    key={goal.type}
                                    goal={goal}
                                    onUpdateGoal={setGoal}
                                    compact
                                />
                            ))}
                        </View>
                    </View>

                    {/* Weekly Charts */}
                    <View className="px-6 mb-6">
                        <View className="flex-row items-center gap-2 mb-3">
                            <TrendingUp size={20} color="#00E676" />
                            <Text className="text-white font-semibold">Weekly Trends</Text>
                        </View>

                        {/* Chart type selector */}
                        <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="mb-3"
                            contentContainerStyle={{ gap: 8 }}
                        >
                            {CHART_OPTIONS.map((option) => (
                                <TouchableOpacity
                                    key={option.key}
                                    onPress={() => setSelectedChart(option.key)}
                                    className={`flex-row items-center gap-1.5 px-3 py-2 rounded-full ${selectedChart === option.key
                                            ? "bg-white/10 border border-white/20"
                                            : "bg-charcoal-800/50 border border-charcoal-700"
                                        }`}
                                >
                                    <Text>{option.icon}</Text>
                                    <Text
                                        className={
                                            selectedChart === option.key
                                                ? "text-white font-medium"
                                                : "text-charcoal-400"
                                        }
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
                    </View>

                    {/* Calendar Heatmap */}
                    <View className="px-6 mb-6">
                        <CalendarHeatmap
                            data={monthlyHeatmap}
                            title="Activity This Month"
                            onDayPress={(day) => {
                                console.log("Tapped day:", day);
                            }}
                        />
                    </View>

                    {/* Averages Summary */}
                    <View className="px-6">
                        <GlassCard>
                            <Text className="text-white font-semibold mb-3">30-Day Averages</Text>
                            <View className="flex-row flex-wrap gap-4">
                                <View className="flex-1 min-w-[80px]">
                                    <Text className="text-charcoal-400 text-xs mb-1">Steps</Text>
                                    <Text className="text-white font-bold text-lg">
                                        {averages.steps.toLocaleString()}
                                    </Text>
                                </View>
                                <View className="flex-1 min-w-[80px]">
                                    <Text className="text-charcoal-400 text-xs mb-1">Sleep</Text>
                                    <Text className="text-white font-bold text-lg">
                                        {averages.sleep}h
                                    </Text>
                                </View>
                                <View className="flex-1 min-w-[80px]">
                                    <Text className="text-charcoal-400 text-xs mb-1">Focus</Text>
                                    <Text className="text-white font-bold text-lg">
                                        {averages.focus}m
                                    </Text>
                                </View>
                                <View className="flex-1 min-w-[80px]">
                                    <Text className="text-charcoal-400 text-xs mb-1">PVC</Text>
                                    <Text className="text-white font-bold text-lg">
                                        {averages.pvc}
                                    </Text>
                                </View>
                            </View>
                        </GlassCard>
                    </View>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
