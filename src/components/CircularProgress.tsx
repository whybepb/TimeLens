/**
 * CircularProgress - PVC Score Display with Glow Effects
 * Premium animated circular progress indicator
 */

import React, { useEffect } from "react";
import { Text, View } from "react-native";
import Animated, {
  Easing,
  useAnimatedProps,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSpring,
  withTiming,
} from "react-native-reanimated";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

interface CircularProgressProps {
  size?: number;
  strokeWidth?: number;
  progress: number; // 0-100
  label?: string;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const CircularProgress: React.FC<CircularProgressProps> = ({
  size = 220,
  strokeWidth = 14,
  progress,
  label = "Energy Level",
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;

  // Animated values
  const animatedProgress = useSharedValue(0);
  const glowOpacity = useSharedValue(0.5);
  const scoreScale = useSharedValue(1);

  useEffect(() => {
    // Animate progress
    animatedProgress.value = withSpring(progress / 100, {
      damping: 15,
      stiffness: 80,
    });

    // Pulse effect on score change
    scoreScale.value = withSpring(1.05, { damping: 10 }, () => {
      scoreScale.value = withSpring(1, { damping: 10 });
    });

    // Glow animation
    glowOpacity.value = withRepeat(
      withTiming(0.8, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      true
    );
  }, [progress]);

  const animatedProps = useAnimatedProps(() => ({
    strokeDashoffset: circumference * (1 - animatedProgress.value),
  }));

  const scoreStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scoreScale.value }],
  }));

  const glowStyle = useAnimatedStyle(() => ({
    opacity: glowOpacity.value,
  }));

  const getEnergyLabel = (score: number): string => {
    if (score >= 80) return "Peak Performance";
    if (score >= 60) return "High Focus";
    if (score >= 40) return "Steady Energy";
    if (score >= 20) return "Low Energy";
    return "Rest Mode";
  };

  const getGradientColors = (score: number): [string, string] => {
    if (score >= 70) return ["#34D399", "#06B6D4"]; // emerald to cyan
    if (score >= 40) return ["#FBBF24", "#F59E0B"]; // amber variants
    return ["#FB7185", "#F43F5E"]; // rose variants
  };

  const getGlowColor = (score: number): string => {
    if (score >= 70) return "rgba(52, 211, 153, 0.4)";
    if (score >= 40) return "rgba(251, 191, 36, 0.4)";
    return "rgba(251, 113, 133, 0.4)";
  };

  const [startColor, endColor] = getGradientColors(progress);
  const glowColor = getGlowColor(progress);

  return (
    <View className="items-center justify-center">
      <View className="relative items-center justify-center">
        {/* Outer glow effect */}
        <Animated.View
          style={[
            {
              position: "absolute",
              width: size + 40,
              height: size + 40,
              borderRadius: (size + 40) / 2,
              backgroundColor: glowColor,
            },
            glowStyle,
          ]}
        />

        {/* SVG Ring */}
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
            stroke="rgba(255, 255, 255, 0.08)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />

          {/* Progress circle */}
          <AnimatedCircle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke="url(#progressGradient)"
            strokeWidth={strokeWidth}
            fill="transparent"
            strokeLinecap="round"
            strokeDasharray={circumference}
            animatedProps={animatedProps}
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>

        {/* Center content */}
        <Animated.View
          className="absolute items-center justify-center"
          style={scoreStyle}
        >
          <Text className="text-6xl font-bold text-white tracking-tight">
            {Math.round(progress)}
          </Text>
          <Text className="text-sm text-white/40 mt-0.5 tracking-wider uppercase">
            PVC Score
          </Text>
        </Animated.View>
      </View>

      {/* Energy label badge */}
      <View className="mt-5 px-5 py-2.5 rounded-full bg-white/[0.08] border border-white/[0.15]">
        <Text className="text-sm text-white/70 font-medium">
          {getEnergyLabel(progress)}
        </Text>
      </View>
    </View>
  );
};

export default CircularProgress;
