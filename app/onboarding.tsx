/**
 * Onboarding Screen - Permission Setup
 * Premium glassmorphic design with animated permission cards
 */

import AsyncStorage from "@react-native-async-storage/async-storage";
import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { router } from "expo-router";
import { Bell, Check, Heart, Shield, Sparkles } from "lucide-react-native";
import React, { useEffect, useState } from "react";
import { Alert, Platform, ScrollView, Text, View } from "react-native";
import Animated, {
  FadeIn,
  FadeInDown,
  FadeOut,
  SlideInRight,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import type { PermissionStatus } from "../src/components";
import { AnimatedBackground, GlassButton } from "../src/components";
import { getDataManager, getHealthService } from "../src/services";
import { ONBOARDING_COMPLETE_KEY } from "./index";

interface PermissionState {
  health: PermissionStatus;
  screenTime: PermissionStatus;
  notifications: PermissionStatus;
}

interface PermissionCardProps {
  icon: React.ElementType;
  iconColor: string;
  title: string;
  description: string;
  status: PermissionStatus;
  onEnable: () => void;
  delay?: number;
}

const PermissionCard: React.FC<PermissionCardProps> = ({
  icon: Icon,
  iconColor,
  title,
  description,
  status,
  onEnable,
  delay = 0,
}) => {
  const scale = useSharedValue(1);
  const isGranted = status === "granted";

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (!isGranted) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };

  return (
    <Animated.View
      entering={SlideInRight.delay(delay).duration(400).springify()}
      style={animatedStyle}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
    >
      <View
        style={{
          marginBottom: 16,
          borderRadius: 24,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: isGranted
            ? "rgba(52, 211, 153, 0.3)"
            : "rgba(255, 255, 255, 0.12)",
        }}
      >
        {/* Blur background */}
        {Platform.OS === "ios" && (
          <BlurView
            intensity={25}
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

        {/* Background */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: isGranted
              ? "rgba(52, 211, 153, 0.08)"
              : "rgba(255, 255, 255, 0.06)",
          }}
        />

        {/* Content */}
        <View style={{ padding: 20, flexDirection: "row", alignItems: "center" }}>
          {/* Icon */}
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              backgroundColor: `${iconColor}20`,
              alignItems: "center",
              justifyContent: "center",
              marginRight: 16,
            }}
          >
            {isGranted ? (
              <Check size={24} color="#34D399" />
            ) : (
              <Icon size={24} color={iconColor} />
            )}
          </View>

          {/* Text */}
          <View style={{ flex: 1 }}>
            <Text className="text-white font-semibold text-base mb-1">
              {title}
            </Text>
            <Text className="text-white/50 text-sm leading-5">
              {description}
            </Text>
          </View>

          {/* Enable button */}
          {!isGranted && (
            <GlassButton
              title={status === "loading" ? "" : "Enable"}
              onPress={onEnable}
              variant="primary"
              size="sm"
              loading={status === "loading"}
            />
          )}
        </View>
      </View>
    </Animated.View>
  );
};

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
  const grantedCount = Object.values(permissions).filter((s) => s === "granted").length;

  // Update progress based on granted permissions
  useEffect(() => {
    progressValue.value = withSpring(grantedCount / 3, {
      damping: 15,
      stiffness: 100,
    });
  }, [permissions, progressValue]);

  // Navigate to dashboard when all permissions granted
  useEffect(() => {
    if (allGranted) {
      const completeOnboarding = async () => {
        try {
          await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
          console.log("[Onboarding] Saved completion status");
        } catch (error) {
          console.error("[Onboarding] Failed to save completion status:", error);
        }
        router.replace("/dashboard" as const);
      };

      const timer = setTimeout(completeOnboarding, 1200);
      return () => clearTimeout(timer);
    }
  }, [allGranted]);

  const progressBarStyle = useAnimatedStyle(() => ({
    width: `${progressValue.value * 100}%`,
  }));

  // Request REAL HealthKit permission
  const requestHealthPermission = async () => {
    setPermissions((prev) => ({ ...prev, health: "loading" }));

    try {
      const healthService = getHealthService();
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

      const status = await healthService.requestPermissions();

      if (status === "granted") {
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

  // Screen Time permission (placeholder)
  const requestScreenTimePermission = async () => {
    setPermissions((prev) => ({ ...prev, screenTime: "loading" }));

    Alert.alert(
      "Screen Time Access",
      "Screen Time API requires a paid Apple Developer account. Using demo data for now.",
      [{ text: "OK" }]
    );

    await new Promise((resolve) => setTimeout(resolve, 800));
    setPermissions((prev) => ({ ...prev, screenTime: "granted" }));
  };

  // Notification permission (placeholder)
  const requestNotificationPermission = async () => {
    setPermissions((prev) => ({ ...prev, notifications: "loading" }));

    await new Promise((resolve) => setTimeout(resolve, 800));
    setPermissions((prev) => ({ ...prev, notifications: "granted" }));
  };

  return (
    <View className="flex-1 bg-charcoal-950">
      {/* Animated background */}
      <AnimatedBackground preset="violet" intensity="medium" />

      <SafeAreaView className="flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 24 }}
        >
          {/* Header */}
          <Animated.View entering={FadeIn.duration(600)} className="items-center pt-8 pb-8">
            <View
              style={{
                width: 88,
                height: 88,
                borderRadius: 32,
                overflow: "hidden",
                marginBottom: 24,
              }}
            >
              {Platform.OS === "ios" && (
                <BlurView
                  intensity={40}
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
              <LinearGradient
                colors={["rgba(164, 89, 255, 0.35)", "rgba(26, 160, 255, 0.2)"]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{
                  flex: 1,
                  alignItems: "center",
                  justifyContent: "center",
                  borderWidth: 1,
                  borderColor: "rgba(255, 255, 255, 0.2)",
                  borderRadius: 32,
                }}
              >
                <Sparkles size={40} color="#A459FF" />
              </LinearGradient>
            </View>
            <Text className="text-white text-3xl font-bold mb-3 tracking-tight">
              Welcome to TimeLens
            </Text>
            <Text className="text-white/50 text-center text-base leading-6 px-4">
              Grant permissions to unlock your full productivity potential
            </Text>
          </Animated.View>

          {/* Progress Bar */}
          <Animated.View entering={FadeInDown.delay(200).duration(400)} className="mb-8">
            <View className="h-2 bg-white/[0.08] rounded-full overflow-hidden">
              <Animated.View style={[progressBarStyle, { height: "100%" }]}>
                <LinearGradient
                  colors={["#34D399", "#06B6D4"]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ height: "100%", borderRadius: 8 }}
                />
              </Animated.View>
            </View>
            <Text className="text-white/40 text-xs text-center mt-3 font-medium">
              {grantedCount} of 3 permissions granted
            </Text>
          </Animated.View>

          {/* Permission Cards */}
          <PermissionCard
            icon={Heart}
            iconColor="#FB7185"
            title="Body Sync"
            description="Access steps, sleep, and calories from Apple Health."
            status={permissions.health}
            onEnable={requestHealthPermission}
            delay={300}
          />

          <PermissionCard
            icon={Shield}
            iconColor="#22D3EE"
            title="Focus Shield"
            description="Monitor screen time and app usage for wellness insights."
            status={permissions.screenTime}
            onEnable={requestScreenTimePermission}
            delay={450}
          />

          <PermissionCard
            icon={Bell}
            iconColor="#A459FF"
            title="Proactive Alerts"
            description="Receive timely insights to maintain your productivity."
            status={permissions.notifications}
            onEnable={requestNotificationPermission}
            delay={600}
          />

          {/* All Granted Message */}
          {allGranted && (
            <Animated.View
              entering={FadeIn.duration(400)}
              exiting={FadeOut.duration(200)}
              className="mt-4 items-center"
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
                <Text className="text-emerald-400 text-center font-semibold">
                  🎉 All set! Launching your dashboard...
                </Text>
              </View>
            </Animated.View>
          )}

          {/* Skip Option */}
          {!allGranted && (
            <Animated.View entering={FadeIn.delay(800).duration(400)} className="mt-6 items-center">
              <Text
                className="text-white/30 text-sm"
                onPress={async () => {
                  await AsyncStorage.setItem(ONBOARDING_COMPLETE_KEY, "true");
                  router.replace("/dashboard" as const);
                }}
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
