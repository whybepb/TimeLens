import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { Settings } from "lucide-react-native";

interface DashboardHeaderProps {
  userName?: string;
  onSettingsPress?: () => void;
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
}) => {
  return (
    <View className="flex-row items-center justify-between px-6 pt-4 pb-2">
      <View>
        <Text className="text-white/60 text-sm">{getGreeting()}</Text>
        <Text className="text-white text-2xl font-bold">{userName}</Text>
      </View>
      <TouchableOpacity
        onPress={onSettingsPress}
        className="w-11 h-11 rounded-full bg-white/10 items-center justify-center border border-white/20"
        activeOpacity={0.7}
      >
        <Settings size={22} color="rgba(255,255,255,0.8)" />
      </TouchableOpacity>
    </View>
  );
};

export default DashboardHeader;
