/**
 * StreakBadge - Displays streak count with fire emoji
 */

import { Flame } from "lucide-react-native";
import React from "react";
import { Text, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from "react-native-reanimated";

interface StreakBadgeProps {
    currentStreak: number;
    longestStreak: number;
    isActiveToday?: boolean;
    size?: "sm" | "md" | "lg";
    showLongest?: boolean;
}

const SIZES = {
    sm: { icon: 16, text: 14, badge: "px-2 py-1" },
    md: { icon: 20, text: 18, badge: "px-3 py-1.5" },
    lg: { icon: 28, text: 24, badge: "px-4 py-2" },
};

export function StreakBadge({
    currentStreak,
    longestStreak,
    isActiveToday = false,
    size = "md",
    showLongest = true,
}: StreakBadgeProps) {
    const sizeConfig = SIZES[size];

    // Flame animation
    const flameScale = useSharedValue(1);

    React.useEffect(() => {
        if (currentStreak > 0 && isActiveToday) {
            flameScale.value = withRepeat(
                withSequence(
                    withTiming(1.15, { duration: 600 }),
                    withTiming(1, { duration: 600 })
                ),
                -1,
                true
            );
        }
    }, [currentStreak, isActiveToday]);

    const flameAnimatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: flameScale.value }],
    }));

    const hasStreak = currentStreak > 0;
    const flameColor = hasStreak ? (isActiveToday ? "#FF6B6B" : "#FF9500") : "#666";

    return (
        <View className="flex-row items-center gap-2">
            {/* Main streak badge */}
            <View
                className={`flex-row items-center gap-1 ${sizeConfig.badge} rounded-full ${hasStreak
                        ? isActiveToday
                            ? "bg-orange-500/20 border border-orange-500/40"
                            : "bg-charcoal-700 border border-charcoal-600"
                        : "bg-charcoal-800 border border-charcoal-700"
                    }`}
            >
                <Animated.View style={flameAnimatedStyle}>
                    <Flame
                        size={sizeConfig.icon}
                        color={flameColor}
                        fill={hasStreak && isActiveToday ? flameColor : "transparent"}
                    />
                </Animated.View>
                <Text
                    className={`font-bold ${hasStreak ? "text-white" : "text-charcoal-500"
                        }`}
                    style={{ fontSize: sizeConfig.text }}
                >
                    {currentStreak}
                </Text>
            </View>

            {/* Longest streak indicator */}
            {showLongest && longestStreak > 0 && currentStreak < longestStreak && (
                <View className="flex-row items-center gap-1 px-2 py-1 bg-charcoal-800/50 rounded-full">
                    <Text className="text-charcoal-500 text-xs">Best:</Text>
                    <Text className="text-charcoal-400 text-xs font-medium">{longestStreak}</Text>
                </View>
            )}

            {/* New record indicator */}
            {currentStreak > 0 && currentStreak >= longestStreak && (
                <View className="px-2 py-0.5 bg-green-500/20 rounded-full">
                    <Text className="text-green-400 text-xs font-medium">
                        {currentStreak === longestStreak && longestStreak > 1 ? "🏆 Best!" : ""}
                    </Text>
                </View>
            )}
        </View>
    );
}

export default StreakBadge;
