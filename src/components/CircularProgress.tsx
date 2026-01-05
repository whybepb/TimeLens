import React from "react";
import { View, Text } from "react-native";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

interface CircularProgressProps {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0-100
  label?: string;
}

export const CircularProgress: React.FC<CircularProgressProps> = ({
  size = 220,
  strokeWidth = 12,
  progress,
  label = "Energy Level",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  const getEnergyLabel = (score: number): string => {
    if (score >= 80) return "Peak Performance";
    if (score >= 60) return "High Focus Potential";
    if (score >= 40) return "Moderate Energy";
    if (score >= 20) return "Low Energy";
    return "Rest Recommended";
  };

  const getGradientColors = (score: number): [string, string] => {
    if (score >= 70) return ["#00E676", "#1AA0FF"];
    if (score >= 40) return ["#FFAB00", "#FF6D00"];
    return ["#FF5252", "#FF1744"];
  };

  const [startColor, endColor] = getGradientColors(progress);

  return (
    <View className="items-center justify-center">
      <View className="relative items-center justify-center">
        <Svg width={size} height={size}>
          <Defs>
            <LinearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <Stop offset="0%" stopColor={startColor} />
              <Stop offset="100%" stopColor={endColor} />
            </LinearGradient>
          </Defs>
          
          {/* Background circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.1)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
          {/* Progress circle */}
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>

        {/* Center content */}
        <View className="absolute items-center justify-center">
          <Text className="text-6xl font-bold text-white">{Math.round(progress)}</Text>
          <Text className="text-sm text-white/50 mt-1">PVC Score</Text>
        </View>
      </View>

      {/* Energy label */}
      <View className="mt-4 px-4 py-2 rounded-full bg-white/10 border border-white/20">
        <Text className="text-sm text-white/80">{getEnergyLabel(progress)}</Text>
      </View>
    </View>
  );
};

export default CircularProgress;
