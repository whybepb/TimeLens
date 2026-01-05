import "../global.css";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { View } from "react-native";
import { ShieldOverlay } from "../src/components";
import { useShield } from "../src/hooks";

export default function RootLayout() {
  const { isActive, currentApp, proceed, returnToFocus } = useShield();

  return (
    <View className="flex-1 bg-charcoal-900">
      <StatusBar style="light" />
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: "#0D0D0F" },
          animation: "slide_from_right",
        }}
      />
      
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
