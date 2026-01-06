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
  Wifi,
} from "lucide-react-native";
import { Alert, RefreshControl, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useEffect } from "react";
import {
  CircularProgress,
  CoachInsightCard,
  DashboardHeader,
  DataCard,
  ProgressRings,
  StreakBadge,
} from "../src/components";
import { useAuth } from "../src/contexts";
import { useCoachAdvice, useGoals, useProductivityData, useShield, useStreaks } from "../src/hooks";
import { getAppwriteService, getGoalService, getStreakService } from "../src/services";

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

  // Shield demo trigger
  const { demoTrigger } = useShield();

  // Goals and streaks
  const { progress, completedCount, totalGoals } = useGoals();
  const { overallStreak } = useStreaks();

  return (
    <View className="flex-1 bg-charcoal-900">
      {/* Radial gradient background */}
      <LinearGradient
        colors={[
          "rgba(26, 160, 255, 0.08)",
          "rgba(164, 89, 255, 0.05)",
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
              tintColor="#1AA0FF"
            />
          }
        >
          {/* Header with Streak Badge */}
          <View className="flex-row items-center justify-between px-6 py-4">
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
          </View>

          {/* PVC Hero Section */}
          <View className="items-center justify-center py-6">
            <CircularProgress progress={pvc.score} />
          </View>

          {/* Goals Progress Mini Display */}
          <TouchableOpacity
            onPress={() => router.push("/stats")}
            className="mx-6 mb-4 bg-charcoal-800/50 rounded-2xl p-4 border border-charcoal-700"
            activeOpacity={0.7}
          >
            <View className="flex-row items-center justify-between mb-3">
              <View className="flex-row items-center gap-2">
                <Target size={18} color="#1AA0FF" />
                <Text className="text-white font-semibold">Today's Goals</Text>
              </View>
              <View className="flex-row items-center gap-1">
                <Text className="text-charcoal-400 text-sm">
                  {completedCount}/{totalGoals}
                </Text>
                <ChartBar size={16} color="#888" />
              </View>
            </View>
            <ProgressRings goals={progress} size={120} strokeWidth={6} showLegend={false} />
            <Text className="text-center text-charcoal-500 text-xs mt-2">
              Tap to see detailed stats →
            </Text>
          </TouchableOpacity>

          {/* Data Grid */}
          <View className="px-6">
            {/* 2x2 Grid */}
            <View className="flex-row gap-3 mb-3">
              {/* Body Card */}
              <DataCard
                title="Body"
                titleIcon={Heart}
                titleIconColor="#FF6B6B"
                items={[
                  {
                    icon: Footprints,
                    iconColor: "#00E676",
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
                titleIconColor="#1AA0FF"
                items={[
                  {
                    icon: Focus,
                    iconColor: "#00E676",
                    label: "Focus Time",
                    value: formatMinutes(stats.focusTimeMinutes),
                  },
                  {
                    icon: Hand,
                    iconColor: "#FFAB00",
                    label: "Pickups",
                    value: formatNumber(stats.pickups),
                  },
                ]}
              />
            </View>

            {/* Coach Insight Card - Strategy Pattern based advice */}
            <CoachInsightCard
              insight={advice.message}
              actionText={advice.actionLabel}
            />

            {/* View Stats Button */}
            <TouchableOpacity
              onPress={() => router.push("/stats")}
              className="mt-4 flex-row items-center justify-center gap-2 bg-electric-primary/20 border border-electric-primary/40 rounded-xl py-3 px-4"
              activeOpacity={0.7}
            >
              <ChartBar size={18} color="#1AA0FF" />
              <Text className="text-electric-primary font-medium text-sm">
                View Statistics & Goals
              </Text>
            </TouchableOpacity>

            {/* Demo: Test Shield Overlay */}
            <TouchableOpacity
              onPress={() => demoTrigger("Instagram")}
              className="mt-3 flex-row items-center justify-center gap-2 bg-violet-500/20 border border-violet-500/40 rounded-xl py-3 px-4"
              activeOpacity={0.7}
            >
              <Shield size={18} color="#A459FF" />
              <Text className="text-violet-400 font-medium text-sm">
                Demo: Test Focus Shield
              </Text>
            </TouchableOpacity>

            {/* Test Appwrite Connection */}
            <TouchableOpacity
              onPress={async () => {
                try {
                  const appwrite = getAppwriteService();
                  const connected = await appwrite.ping();
                  Alert.alert(
                    connected ? "✅ Success" : "❌ Failed",
                    connected
                      ? "Appwrite connection successful!"
                      : "Could not connect to Appwrite"
                  );
                } catch (error: any) {
                  Alert.alert("❌ Error", error.message || "Connection failed");
                }
              }}
              className="mt-3 flex-row items-center justify-center gap-2 bg-cyan-500/20 border border-cyan-500/40 rounded-xl py-3 px-4"
              activeOpacity={0.7}
            >
              <Wifi size={18} color="#00D9FF" />
              <Text className="text-cyan-400 font-medium text-sm">
                Send a Ping to Appwrite
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

