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
  Palette,
  Shield,
  Smartphone,
  Target,
  Timer,
  Wind
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
  ProgressRings,
  QuickActionTile,
  StreakBadge,
} from "../src/components";
import { useAuth, useTheme } from "../src/contexts";
import { useCoachAdvice, useGoals, useNotifications, useProductivityData, useShield, useStreaks } from "../src/hooks";
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
  const { currentTheme, themeName, setTheme, availableThemes } = useTheme();

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

  // Notifications
  const { requestPermissions, sendTestNotification } = useNotifications();

  return (
    <View style={{ flex: 1, backgroundColor: currentTheme.colors.background.primary }}>
      {/* Animated gradient orbs background */}
      <AnimatedBackground intensity="medium" />

      {/* Top gradient overlay for depth */}
      <LinearGradient
        colors={currentTheme.colors.gradients.glassOverlay as unknown as readonly [string, string, ...string[]]}
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
              tintColor={currentTheme.colors.primary.primary}
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
              onSettingsPress={() => router.push("/settings")}
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
              <View style={{
                backgroundColor: currentTheme.colors.glass.light,
                borderColor: currentTheme.colors.glass.border,
                borderWidth: 1,
                borderRadius: 24,
                padding: 20
              }}>
                <View className="flex-row items-center justify-between mb-4">
                  <View className="flex-row items-center gap-2">
                    <View style={{
                      width: 32,
                      height: 32,
                      borderRadius: 12,
                      backgroundColor: currentTheme.colors.secondary.glow,
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Target size={16} color={currentTheme.colors.secondary.primary} />
                    </View>
                    <Text style={{ color: currentTheme.colors.text.primary }} className="font-semibold">Today's Goals</Text>
                  </View>
                  <View style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 8,
                    backgroundColor: currentTheme.colors.glass.white,
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 20
                  }}>
                    <Text style={{ color: currentTheme.colors.text.secondary, fontSize: 14, fontWeight: '500' }}>
                      {completedCount}/{totalGoals}
                    </Text>
                    <ChartBar size={14} color={currentTheme.colors.text.tertiary} />
                  </View>
                </View>
                <ProgressRings goals={progress} size={130} strokeWidth={7} showLegend={false} />
                <Text style={{ color: currentTheme.colors.text.muted }} className="text-center text-xs mt-3 font-medium">
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

            {/* Quick Actions Grid - 2x2 */}
            <Animated.View
              entering={FadeInDown.delay(500).duration(400)}
              className="mt-5"
            >
              <View className="flex-row gap-3 mb-3">
                <QuickActionTile
                  icon={Timer}
                  label="Focus"
                  onPress={() => router.push("/focus")}
                  variant="gradient"
                  gradientColors={["#A459FF", "#7021CC"]}
                />
                <QuickActionTile
                  icon={Wind}
                  label="Breathe"
                  onPress={() => router.push("/breathe")}
                  variant="gradient"
                  gradientColors={["#22D3EE", "#0EA5E9"]}
                />
              </View>
              <View className="flex-row gap-3">
                <QuickActionTile
                  icon={ChartBar}
                  label="Stats"
                  onPress={() => router.push("/stats")}
                  variant="glass"
                />
                <QuickActionTile
                  icon={Shield}
                  label="Shield"
                  onPress={() => demoTrigger("Instagram")}
                  variant="glass"
                />
              </View>
            </Animated.View>

            {/* Theme Selector - Compact Pills */}
            <Animated.View
              entering={FadeInDown.delay(600).duration(400)}
              className="mt-6 mb-4"
            >
              <View className="flex-row items-center gap-2 mb-3 px-1">
                <Palette size={16} color={currentTheme.colors.text.tertiary} />
                <Text style={{ color: currentTheme.colors.text.tertiary, fontSize: 12, fontWeight: '500' }}>
                  Theme
                </Text>
              </View>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 8 }}
              >
                {Object.keys(availableThemes).map((themeKey) => {
                  const theme = availableThemes[themeKey];
                  const isActive = themeName === themeKey;
                  return (
                    <TouchableOpacity
                      key={themeKey}
                      onPress={() => setTheme(themeKey)}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 8,
                        paddingHorizontal: 14,
                        paddingVertical: 10,
                        borderRadius: 20,
                        backgroundColor: isActive
                          ? currentTheme.colors.primary.glow
                          : currentTheme.colors.glass.light,
                        borderWidth: 1,
                        borderColor: isActive
                          ? currentTheme.colors.primary.primary
                          : currentTheme.colors.glass.border,
                      }}
                      activeOpacity={0.7}
                    >
                      <View
                        style={{
                          width: 16,
                          height: 16,
                          borderRadius: 8,
                          backgroundColor: theme.colors.primary.primary,
                        }}
                      />
                      <Text
                        style={{
                          color: isActive
                            ? currentTheme.colors.primary.primary
                            : currentTheme.colors.text.secondary,
                          fontSize: 13,
                          fontWeight: isActive ? '600' : '400',
                        }}
                      >
                        {theme.displayName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
    </View >
  );
}
