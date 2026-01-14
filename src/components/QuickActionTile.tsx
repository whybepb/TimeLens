/**
 * QuickActionTile - Premium 2x2 grid action tiles
 * Features: Gradient/Glass variants, spring animations, icon-centric design
 */

import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
import Animated from "react-native-reanimated";
import { useTheme } from "../contexts";
import { usePressAnimation } from "../hooks/usePressAnimation";

interface QuickActionTileProps {
    icon: React.ElementType;
    label: string;
    onPress: () => void;
    variant?: "gradient" | "glass";
    gradientColors?: readonly [string, string, ...string[]];
    iconColor?: string;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const QuickActionTile: React.FC<QuickActionTileProps> = ({
    icon: Icon,
    label,
    onPress,
    variant = "glass",
    gradientColors,
    iconColor,
}) => {
    const { currentTheme } = useTheme();
    const { pressHandlers, animatedStyle } = usePressAnimation({ scaleDown: 0.95 });

    const defaultIconColor = variant === "gradient"
        ? "#FFFFFF"
        : currentTheme.colors.primary.primary;

    const tileContent = (
        <View
            style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                padding: 16,
            }}
        >
            <View
                style={{
                    width: 48,
                    height: 48,
                    borderRadius: 16,
                    backgroundColor: variant === "gradient"
                        ? "rgba(255, 255, 255, 0.15)"
                        : currentTheme.colors.primary.glow,
                    alignItems: "center",
                    justifyContent: "center",
                    marginBottom: 12,
                }}
            >
                <Icon size={24} color={iconColor || defaultIconColor} />
            </View>
            <Text
                style={{
                    color: variant === "gradient"
                        ? "#FFFFFF"
                        : currentTheme.colors.text.primary,
                    fontSize: 14,
                    fontWeight: "600",
                }}
            >
                {label}
            </Text>
        </View>
    );

    if (variant === "gradient" && gradientColors) {
        return (
            <AnimatedTouchable
                style={[
                    {
                        flex: 1,
                        aspectRatio: 1,
                        borderRadius: 24,
                        overflow: "hidden",
                    },
                    animatedStyle,
                ]}
                onPress={onPress}
                activeOpacity={1}
                {...pressHandlers}
            >
                <LinearGradient
                    colors={gradientColors}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={{
                        flex: 1,
                        borderRadius: 24,
                    }}
                >
                    {tileContent}
                </LinearGradient>
            </AnimatedTouchable>
        );
    }

    return (
        <AnimatedTouchable
            style={[
                {
                    flex: 1,
                    aspectRatio: 1,
                    borderRadius: 24,
                    backgroundColor: currentTheme.colors.glass.light,
                    borderWidth: 1,
                    borderColor: currentTheme.colors.glass.border,
                },
                animatedStyle,
            ]}
            onPress={onPress}
            activeOpacity={1}
            {...pressHandlers}
        >
            {tileContent}
        </AnimatedTouchable>
    );
};

export default QuickActionTile;
