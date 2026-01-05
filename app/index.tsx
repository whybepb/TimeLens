import { View, ScrollView } from "react-native";
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

export default function Index() {
  // Placeholder data - will be replaced with real health/screen time data
  const pvcScore = 72;
  const healthData = {
    steps: "6,234",
    sleepHours: "7.2",
  };
  const screenData = {
    focusTime: "2h 45m",
    pickups: "42",
  };

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
        >
          {/* Header */}
          <DashboardHeader
            userName="Explorer"
            onSettingsPress={() => console.log("Settings pressed")}
          />

          {/* PVC Hero Section */}
          <View className="items-center justify-center py-8">
            <CircularProgress progress={pvcScore} />
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
                    value: healthData.steps,
                  },
                  {
                    icon: Moon,
                    iconColor: "#A459FF",
                    label: "Sleep",
                    value: healthData.sleepHours,
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
                    value: screenData.focusTime,
                  },
                  {
                    icon: Hand,
                    iconColor: "#FFAB00",
                    label: "Pickups",
                    value: screenData.pickups,
                  },
                ]}
              />
            </View>

            {/* Coach Insight Card */}
            <CoachInsightCard
              insight="Your physical activity is low today. A 10-minute walk will boost your cognitive score."
              actionText="Start a walk"
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
