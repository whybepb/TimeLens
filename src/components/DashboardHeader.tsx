import { LogOut, Settings } from "lucide-react-native";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

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

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  userName = "there",
  onSettingsPress,
  onLogout,
  isAuthenticated = false,
}) => {
  return (
    <View className="flex-row items-center justify-between">
      <View>
        <Text className="text-white/60 text-sm">{getGreeting()}</Text>
        <Text className="text-white text-2xl font-bold">{userName}</Text>
      </View>
      <View className="flex-row gap-2">
        {isAuthenticated && onLogout && (
          <TouchableOpacity
            onPress={onLogout}
            className="w-11 h-11 rounded-full bg-red-500/20 items-center justify-center border border-red-500/30"
            activeOpacity={0.7}
          >
            <LogOut size={20} color="#FF6B6B" />
          </TouchableOpacity>
        )}
        <TouchableOpacity
          onPress={onSettingsPress}
          className="w-11 h-11 rounded-full bg-white/10 items-center justify-center border border-white/20"
          activeOpacity={0.7}
        >
          <Settings size={22} color="rgba(255,255,255,0.8)" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default DashboardHeader;

