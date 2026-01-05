import { View, ScrollView, RefreshControl } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import {
  Footprints,
  Moon,
  Heart,
  Smartphone,
  Focus,
  Hand,
} from "lucide-react-native";

import {
  CircularProgress,
  DashboardHeader,
  DataCard,
  CoachInsightCard,
} from "../src/components";
import { useProductivityData, useCoachAdvice } from "../src/hooks";

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
  // Use the productivity data hook - connected to DataManager singleton
  const { stats, pvc, isLoading, refresh } = useProductivityData();
  
  // Use the coach advice hook - Strategy Pattern based recommendations
  const advice = useCoachAdvice();

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
          {/* Header */}
          <DashboardHeader
            userName="Explorer"
            onSettingsPress={() => console.log("Settings pressed")}
          />

          {/* PVC Hero Section */}
          <View className="items-center justify-center py-8">
            <CircularProgress progress={pvc.score} />
          </View>

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
                    value: stats.sleepHours.toFixed(1),
                    unit: "hrs",
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
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
