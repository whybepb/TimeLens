import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Bell, Heart, Shield, Sparkles } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import type { PermissionStatus } from "../src/components";
import { PermissionCard } from "../src/components";
import { getDataManager, getHealthService } from "../src/services";

interface PermissionState {
  health: PermissionStatus;
  screenTime: PermissionStatus;
  notifications: PermissionStatus;
}

export default function OnboardingScreen() {
  const [permissions, setPermissions] = useState<PermissionState>({
    health: "idle",
    screenTime: "idle",
    notifications: "idle",
  });

  const allGranted =
    permissions.health === "granted" &&
    permissions.screenTime === "granted" &&
    permissions.notifications === "granted";

  const progressValue = useSharedValue(0);

  // Update progress based on granted permissions
  useEffect(() => {
    const grantedCount = Object.values(permissions).filter(
      (s) => s === "granted"
    ).length;
    progressValue.value = withSpring(grantedCount / 3, {
      damping: 15,
      stiffness: 100,
    });
  }, [permissions, progressValue]);

  // Navigate to dashboard when all permissions granted
  useEffect(() => {
    if (allGranted) {
      const timer = setTimeout(() => {
        router.replace("/dashboard" as const);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [allGranted]);

  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: `${progressValue.value * 100}%`,
    };
  });

  // Request REAL HealthKit permission
  const requestHealthPermission = async () => {
    setPermissions((prev) => ({ ...prev, health: "loading" }));

    try {
      const healthService = getHealthService();

      // Check if HealthKit is available
      const isAvailable = await healthService.isAvailable();

      if (!isAvailable) {
        Alert.alert(
          "HealthKit Unavailable",
          "Apple Health is not available on this device. Health data will use demo values.",
          [{ text: "OK" }]
        );
        setPermissions((prev) => ({ ...prev, health: "granted" }));
        return;
      }

      // Request actual HealthKit permissions
      const status = await healthService.requestPermissions();

      if (status === "granted") {
        // Fetch initial health data
        const dataManager = getDataManager();
        await dataManager.refreshData();
        setPermissions((prev) => ({ ...prev, health: "granted" }));
      } else if (status === "denied") {
        Alert.alert(
          "Permission Denied",
          "You can enable Health access later in Settings → Privacy → Health → TimeLens.",
          [{ text: "OK" }]
        );
        setPermissions((prev) => ({ ...prev, health: "denied" }));
      } else {
        setPermissions((prev) => ({ ...prev, health: "denied" }));
      }
    } catch (error) {
      console.error("[Onboarding] HealthKit error:", error);
      Alert.alert("Error", "Failed to request health permissions. Please try again.");
      setPermissions((prev) => ({ ...prev, health: "idle" }));
    }
  };

  // Screen Time permission (requires paid developer account)
  // For now, auto-grant with demo data
  const requestScreenTimePermission = async () => {
    setPermissions((prev) => ({ ...prev, screenTime: "loading" }));

    // Note: DeviceActivity API requires Family Controls entitlement
    // which is only available with a paid Apple Developer account ($99/year)

    // Show info alert
    Alert.alert(
      "Screen Time Access",
      "Screen Time API requires a paid Apple Developer account. Using demo data for now.",
      [{ text: "OK" }]
    );

    // Simulate a short delay then grant
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setPermissions((prev) => ({ ...prev, screenTime: "granted" }));
  };

  // Notification permission using expo-notifications
  const requestNotificationPermission = async () => {
    setPermissions((prev) => ({ ...prev, notifications: "loading" }));

    try {
      // For now, simulate permission grant
      // TODO: Implement with expo-notifications when needed
      // import * as Notifications from 'expo-notifications';
      // const { status } = await Notifications.requestPermissionsAsync();
      // setPermissions((prev) => ({
      //   ...prev,
      //   notifications: status === 'granted' ? "granted" : "denied",
      // }));

      await new Promise((resolve) => setTimeout(resolve, 1000));
      setPermissions((prev) => ({ ...prev, notifications: "granted" }));
    } catch (error) {
      console.error("[Onboarding] Notification error:", error);
      setPermissions((prev) => ({ ...prev, notifications: "denied" }));
    }
  };

  return (
    <View className="flex-1 bg-charcoal-900">
      {/* Radial gradient background */}
      <LinearGradient
        colors={[
          "rgba(164, 89, 255, 0.12)",
          "rgba(26, 160, 255, 0.08)",
          "transparent",
        ]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 0.7 }}
        className="absolute top-0 left-0 right-0 h-96"
      />

      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 24 }}
        >
          {/* Header */}
          <Animated.View
            entering={FadeIn.duration(600)}
            className="items-center pt-8 pb-6"
          >
            <View className="w-20 h-20 rounded-full bg-violet-500/20 items-center justify-center mb-6">
              <Sparkles size={40} color="#A459FF" />
            </View>
            <Text className="text-white text-3xl font-bold mb-2">
              Welcome to TimeLens
            </Text>
            <Text className="text-white/60 text-center text-base leading-6">
              To calculate your Productivity-Vitality Score, we need a few permissions.
            </Text>
          </Animated.View>

          {/* Progress Bar */}
          <View className="mb-8">
            <View className="h-2 bg-white/10 rounded-full overflow-hidden">
              <Animated.View
                style={progressBarStyle}
                className="h-full bg-gradient-to-r from-electric-400 to-violet-500 rounded-full"
              >
                <LinearGradient
                  colors={["#1AA0FF", "#A459FF"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  className="h-full w-full"
                />
              </Animated.View>
            </View>
            <Text className="text-white/40 text-xs text-center mt-2">
              {Object.values(permissions).filter((s) => s === "granted").length} of 3 permissions granted
            </Text>
          </View>

          {/* Permission Cards */}
          <Animated.View entering={SlideInRight.delay(200).duration(400)}>
            <PermissionCard
              icon={Heart}
              iconColor="#FF6B6B"
              title="Body Sync"
              description="Access your health data including steps, sleep, and active calories from Apple Health."
              status={permissions.health}
              onEnable={requestHealthPermission}
            />
          </Animated.View>

          <Animated.View entering={SlideInRight.delay(400).duration(400)}>
            <PermissionCard
              icon={Shield}
              iconColor="#1AA0FF"
              title="Focus Shield"
              description="Monitor screen time and app usage to calculate your digital wellness score."
              status={permissions.screenTime}
              onEnable={requestScreenTimePermission}
            />
          </Animated.View>

          <Animated.View entering={SlideInRight.delay(600).duration(400)}>
            <PermissionCard
              icon={Bell}
              iconColor="#A459FF"
              title="Proactive Alerts"
              description="Receive timely insights and reminders to maintain your productivity flow."
              status={permissions.notifications}
              onEnable={requestNotificationPermission}
            />
          </Animated.View>

          {/* All Granted Message */}
          {allGranted && (
            <Animated.View
              entering={FadeIn.duration(400)}
              exiting={FadeOut.duration(200)}
              className="mt-6 items-center"
            >
              <View className="bg-green-500/20 border border-green-500/40 rounded-2xl px-6 py-4">
                <Text className="text-green-400 text-center font-semibold">
                  🎉 All set! Launching your dashboard...
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Skip Option */}
          {!allGranted && (
            <Animated.View entering={FadeIn.delay(800).duration(400)} className="mt-8 items-center">
              <Text
                className="text-white/40 text-sm underline"
                onPress={() => router.replace("/dashboard" as const)}
              >
                Skip for now
              </Text>
            </Animated.View>
          )}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}
