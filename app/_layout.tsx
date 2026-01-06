import { Stack, useRouter, useSegments } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { useEffect } from "react";
import { ActivityIndicator, View } from "react-native";
import "../global.css";
import { ShieldOverlay } from "../src/components";
import { AuthProvider, useAuth } from "../src/contexts";
import { useShield } from "../src/hooks";

function RootLayoutNav() {
  const { isActive, currentApp, proceed, returnToFocus } = useShield();
  const { user, isLoading, isAuthenticated } = useAuth();
  const router = useRouter();
  const segments = useSegments();

  // Handle auth-based navigation
  useEffect(() => {
    if (isLoading) return; // Wait for auth check

    const inAuthGroup = segments[0] === "auth";
    const inOnboarding = segments[0] === "onboarding";
    const inDashboard = segments[0] === "dashboard";
    const inStats = segments[0] === "stats";

    if (!isAuthenticated && !inAuthGroup && !inOnboarding && !inDashboard && !inStats) {
      // Not authenticated and on index - redirect to auth
      router.replace("/auth");
    } else if (isAuthenticated && inAuthGroup) {
      // Authenticated but on auth screen - go to dashboard
      router.replace("/dashboard");
    }
  }, [isAuthenticated, isLoading, segments]);

  // Show loading screen while checking auth
  if (isLoading) {
    return (
      <View className="flex-1 bg-charcoal-900 items-center justify-center">
        <ActivityIndicator size="large" color="#A459FF" />
      </View>
    );
  }

  return (
    <View className="flex-1 bg-charcoal-900">
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0D0D0F" },
          animation: "slide_from_right",
        }}
      >
        <Stack.Screen name="auth" options={{ animation: "fade" }} />
        <Stack.Screen name="onboarding" />
        <Stack.Screen name="dashboard" />
        <Stack.Screen name="stats" />
      </Stack>

      {/* Focus Shield Overlay - intercepts blacklisted apps */}
      <ShieldOverlay
        visible={isActive}
        appName={currentApp ?? undefined}
        onProceed={proceed}
        onBackToFocus={returnToFocus}
      />
    </View>
  );
}

export default function RootLayout() {
  return (
    <AuthProvider>
      <RootLayoutNav />
    </AuthProvider>
  );
}

