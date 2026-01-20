/**
 * DashboardHeader - Enhanced with theme support and avatar placeholder
 */

import { LinearGradient } from "expo-linear-gradient";
import { Settings } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import { useTheme } from "../contexts";

interface DashboardHeaderProps {
  userName?: string;
  onSettingsPress?: () => void;
  onLogout?: () => void;
  isAuthenticated?: boolean;
}

const getGreeting = (): string => {
  const hour = new Date().getHours();
  if (hour < 12) return "Good Morning";
  if (hour < 17) return "Good Afternoon";
  if (hour < 21) return "Good Evening";
  return "Good Night";
};

const getInitials = (name: string): string => {
  const parts = name.split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName = "Explorer",
  onSettingsPress,
  onLogout,
  isAuthenticated = false,
}) => {
  const { currentTheme } = useTheme();

  return (
    <View className="flex-row items-center justify-between flex-1">
      <View className="flex-row items-center gap-3">
        {/* Avatar with gradient */}
        <View
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            overflow: "hidden",
          }}
        >
          <LinearGradient
            colors={[currentTheme.colors.primary.primary, currentTheme.colors.secondary.primary]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{
              flex: 1,
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <Text style={{ color: "#FFFFFF", fontWeight: "700", fontSize: 16 }}>
              {getInitials(userName)}
            </Text>
          </LinearGradient>
        </View>

        <View>
          <Text style={{ color: currentTheme.colors.text.tertiary, fontSize: 13 }}>
            {getGreeting()}
          </Text>
          <Text style={{ color: currentTheme.colors.text.primary, fontSize: 20, fontWeight: "700" }}>
            {userName}
          </Text>
        </View>
      </View>

      <View className="flex-row gap-2">
        <TouchableOpacity
          onPress={onSettingsPress}
          style={{
            width: 40,
            height: 40,
            borderRadius: 20,
            backgroundColor: currentTheme.colors.glass.light,
            alignItems: "center",
            justifyContent: "center",
            borderWidth: 1,
            borderColor: currentTheme.colors.glass.border,
          }}
          activeOpacity={0.7}
        >
          <Settings size={20} color={currentTheme.colors.text.secondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DashboardHeader;
