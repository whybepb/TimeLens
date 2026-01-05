import React, { useState, useEffect } from "react";
import { View, Text, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Heart, Shield, Bell, Sparkles } from "lucide-react-native";
import Animated, {
  FadeIn,
  FadeOut,
  SlideInRight,
  useAnimatedStyle,
  withSpring,
  useSharedValue,
} from "react-native-reanimated";

import { PermissionCard } from "../src/components";
import type { PermissionStatus } from "../src/components";

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

  // TODO: Replace with actual HealthKit permission request
  const requestHealthPermission = async () => {
    setPermissions((prev) => ({ ...prev, health: "loading" }));
    
    // TODO: Implement actual HealthKit permission request
    // import AppleHealthKit from 'react-native-health';
    // const permissions = {
    //   permissions: {
    //     read: [
    //       AppleHealthKit.Constants.Permissions.Steps,
    //       AppleHealthKit.Constants.Permissions.SleepAnalysis,
    //       AppleHealthKit.Constants.Permissions.ActiveEnergyBurned,
    //     ],
    //   },
    // };
    // AppleHealthKit.initHealthKit(permissions, (error) => {
    //   if (error) {
    //     setPermissions((prev) => ({ ...prev, health: "denied" }));
    //   } else {
    //     setPermissions((prev) => ({ ...prev, health: "granted" }));
    //   }
    // });

    // Simulated permission request
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setPermissions((prev) => ({ ...prev, health: "granted" }));
  };

  // TODO: Replace with actual Screen Time / DeviceActivity permission request
  const requestScreenTimePermission = async () => {
    setPermissions((prev) => ({ ...prev, screenTime: "loading" }));
    
    // TODO: Implement actual DeviceActivity permission request
    // Note: Requires Family Controls capability and entitlement
    // import { DeviceActivityMonitor } from 'react-native-device-activity';
    // try {
    //   const authorized = await DeviceActivityMonitor.requestAuthorization();
    //   setPermissions((prev) => ({
    //     ...prev,
    //     screenTime: authorized ? "granted" : "denied",
    //   }));
    // } catch (error) {
    //   setPermissions((prev) => ({ ...prev, screenTime: "denied" }));
    // }

    // Simulated permission request
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setPermissions((prev) => ({ ...prev, screenTime: "granted" }));
  };

  // TODO: Replace with actual push notification permission request
  const requestNotificationPermission = async () => {
    setPermissions((prev) => ({ ...prev, notifications: "loading" }));
    
    // TODO: Implement actual notification permission request
    // import * as Notifications from 'expo-notifications';
    // const { status } = await Notifications.requestPermissionsAsync();
    // setPermissions((prev) => ({
    //   ...prev,
    //   notifications: status === 'granted' ? "granted" : "denied",
    // }));

    // Simulated permission request
    await new Promise((resolve) => setTimeout(resolve, 1000));
    setPermissions((prev) => ({ ...prev, notifications: "granted" }));
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
