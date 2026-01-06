/**
 * Dashboard - Main app screen
 * Premium glassmorphic design with animated background
 */

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import {
  ChartBar,
  Focus,
  Footprints,
  Hand,
  Heart,
  Moon,
  Shield,
  Smartphone,
  Target,
} from "lucide-react-native";
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { useEffect } from "react";
import {
  AICoachCard,
  AnimatedBackground,
  CircularProgress,
  DashboardHeader,
  DataCard,
  GlassButton,
  ProgressRings,
  StreakBadge,
} from "../src/components";
import { useAuth } from "../src/contexts";
import { useCoachAdvice, useGoals, useProductivityData, useShield, useStreaks } from "../src/hooks";
import { getGoalService, getStreakService } from "../src/services";

// Helper to format minutes to hours and minutes string
const formatMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${mins}m`;
};

// Helper to format number with commas
const formatNumber = (num: number): string => {
  return num.toLocaleString();
};

export default function Dashboard() {
  const router = useRouter();
  const { user, isAuthenticated, logout } = useAuth();

  // Sync data from cloud on login
  useEffect(() => {
    if (isAuthenticated) {
      console.log("[Dashboard] Authenticated, syncing from cloud...");
      getGoalService().syncFromCloud();
      getStreakService().syncFromCloud();
    }
  }, [isAuthenticated]);

  // Use the productivity data hook - connected to DataManager singleton
  const { stats, pvc, isLoading, refresh } = useProductivityData();

  // Use the coach advice hook - Strategy Pattern based recommendations
  const advice = useCoachAdvice();

  // Goals and streaks
  const { progress, completedCount, totalGoals } = useGoals();
  const { overallStreak } = useStreaks();

  // Shield demo trigger
  const { demoTrigger } = useShield();

  return (
    <View className="flex-1 bg-charcoal-950">
      {/* Animated gradient orbs background */}
      <AnimatedBackground preset="default" intensity="medium" />

      {/* Top gradient overlay for depth */}
      <LinearGradient
        colors={[
          "rgba(13, 13, 15, 0.3)",
          "transparent",
        ]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.3 }}
        className="absolute top-0 left-0 right-0 h-40"
        pointerEvents="none"
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
          {/* Header with Streak Badge */}
          <Animated.View
            entering={FadeInDown.duration(400)}
            className="flex-row items-center justify-between px-6 py-4"
          >
            <DashboardHeader
              userName={user?.name || "Explorer"}
              onSettingsPress={() => Alert.alert("Settings", "Settings screen coming soon!")}
              onLogout={logout}
              isAuthenticated={isAuthenticated}
            />
            <StreakBadge
              currentStreak={overallStreak.currentStreak}
              longestStreak={overallStreak.longestStreak}
              isActiveToday={overallStreak.isActiveToday}
              size="md"
              showLongest={false}
            />
          </Animated.View>

          {/* PVC Hero Section */}
          <Animated.View
            entering={FadeInDown.delay(100).duration(500)}
            className="items-center justify-center py-8"
          >
            <CircularProgress progress={pvc.score} />
          </Animated.View>

          {/* Goals Progress Mini Display */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)}>
            <TouchableOpacity
              onPress={() => router.push("/stats")}
              className="mx-6 mb-5"
              activeOpacity={0.8}
            >
              <View className="bg-white/[0.06] rounded-3xl p-5 border border-white/[0.1]">
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center gap-2">
                    <View className="w-8 h-8 rounded-xl bg-electric-400/20 items-center justify-center">
                      <Target size={16} color="#1AA0FF" />
                    </View>
                    <Text className="text-white font-semibold">Today's Goals</Text>
                  </View>
                  <View className="flex-row items-center gap-2 bg-white/[0.08] px-3 py-1.5 rounded-full">
                    <Text className="text-white/70 text-sm font-medium">
                      {completedCount}/{totalGoals}
                    </Text>
                    <ChartBar size={14} color="rgba(255,255,255,0.5)" />
                  </View>
                </View>
                <ProgressRings goals={progress} size={130} strokeWidth={7} showLegend={false} />
                <Text className="text-center text-white/40 text-xs mt-3 font-medium">
                  Tap for detailed stats →
                </Text>
              </View>
            </TouchableOpacity>
          </Animated.View>

          {/* Data Grid */}
          <Animated.View
            entering={FadeInDown.delay(300).duration(400)}
            className="px-6"
          >
            {/* 2x2 Grid */}
            <View className="flex-row gap-3 mb-4">
              {/* Body Card */}
              <DataCard
                title="Body"
                titleIcon={Heart}
                titleIconColor="#FB7185"
                items={[
                  {
                    icon: Footprints,
                    iconColor: "#34D399",
                    label: "Steps",
                    value: formatNumber(stats.steps),
                  },
                  {
                    icon: Moon,
                    iconColor: "#A459FF",
                    label: "Sleep",
                    value: stats.sleepHours !== null ? stats.sleepHours.toFixed(1) : "—",
                    unit: stats.sleepHours !== null ? "hrs" : "",
                  },
                ]}
              />

              {/* Digital Card */}
              <DataCard
                title="Digital"
                titleIcon={Smartphone}
                titleIconColor="#22D3EE"
                items={[
                  {
                    icon: Focus,
                    iconColor: "#34D399",
                    label: "Focus Time",
                    value: formatMinutes(stats.focusTimeMinutes),
                  },
                  {
                    icon: Hand,
                    iconColor: "#FBBF24",
                    label: "Pickups",
                    value: formatNumber(stats.pickups),
                  },
                ]}
              />
            </View>

            {/* AI Coach Card - LLM-powered personalized advice */}
            <Animated.View entering={FadeInDown.delay(400).duration(400)}>
              <AICoachCard
                onActionPress={(action) => {
                  Alert.alert("Action", action);
                }}
              />
            </Animated.View>

            {/* View Stats Button */}
            <Animated.View
              entering={FadeInDown.delay(500).duration(400)}
              className="mt-5"
            >
              <GlassButton
                title="View Statistics & Goals"
                onPress={() => router.push("/stats")}
                variant="secondary"
                icon={ChartBar}
                fullWidth
              />
            </Animated.View>

            {/* Focus Shield Demo - v0 feature preview */}
            <Animated.View
              entering={FadeInDown.delay(600).duration(400)}
              className="mt-3"
            >
              <GlassButton
                title="Try Focus Shield"
                onPress={() => demoTrigger("Instagram")}
                variant="ghost"
                icon={Shield}
                fullWidth
              />
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
