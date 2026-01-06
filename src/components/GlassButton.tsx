/**
 * GlassButton - Premium glassmorphic button component
 * Supports multiple variants, loading states, and press animations
 */

import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { LucideIcon } from "lucide-react-native";
import React from "react";
import { ActivityIndicator, Platform, Text, TouchableOpacity, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";

type ButtonVariant = "primary" | "secondary" | "ghost" | "gradient";
type ButtonSize = "sm" | "md" | "lg";

interface GlassButtonProps {
    title: string;
    onPress: () => void;
    variant?: ButtonVariant;
    size?: ButtonSize;
    icon?: LucideIcon;
    iconPosition?: "left" | "right";
    loading?: boolean;
    disabled?: boolean;
    fullWidth?: boolean;
    gradientColors?: readonly [string, string, ...string[]];
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const GlassButton: React.FC<GlassButtonProps> = ({
    title,
    onPress,
    variant = "primary",
    size = "md",
    icon: Icon,
    iconPosition = "left",
    loading = false,
    disabled = false,
    fullWidth = false,
    gradientColors,
}) => {
    const scale = useSharedValue(1);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const handlePressIn = () => {
        scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
    };

    const handlePressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    };

    // Size configurations
    const sizeConfig = {
        sm: { paddingX: 16, paddingY: 10, fontSize: 13, iconSize: 16 },
        md: { paddingX: 20, paddingY: 14, fontSize: 15, iconSize: 18 },
        lg: { paddingX: 24, paddingY: 18, fontSize: 17, iconSize: 20 },
    };

    const config = sizeConfig[size];

    // Variant styles
    const variantStyles = {
        primary: {
            bg: "rgba(164, 89, 255, 0.9)",
            border: "rgba(164, 89, 255, 0.6)",
            textColor: "#FFFFFF",
        },
        secondary: {
            bg: "rgba(255, 255, 255, 0.1)",
            border: "rgba(255, 255, 255, 0.2)",
            textColor: "#FFFFFF",
        },
        ghost: {
            bg: "transparent",
            border: "rgba(255, 255, 255, 0.15)",
            textColor: "rgba(255, 255, 255, 0.8)",
        },
        gradient: {
            bg: "transparent",
            border: "transparent",
            textColor: "#FFFFFF",
        },
    };

    const style = variantStyles[variant];
    const isGradient = variant === "gradient";

    const buttonContent = (
        <View
            style={{
                flexDirection: "row",
                alignItems: "center",
                justifyContent: "center",
                gap: 8,
                paddingHorizontal: config.paddingX,
                paddingVertical: config.paddingY,
            }}
        >
            {loading ? (
                <ActivityIndicator size="small" color={style.textColor} />
            ) : (
                <>
                    {Icon && iconPosition === "left" && (
                        <Icon size={config.iconSize} color={style.textColor} />
                    )}
                    <Text
                        style={{
                            color: style.textColor,
                            fontSize: config.fontSize,
                            fontWeight: "600",
                        }}
                    >
                        {title}
                    </Text>
                    {Icon && iconPosition === "right" && (
                        <Icon size={config.iconSize} color={style.textColor} />
                    )}
                </>
            )}
        </View>
    );

    const buttonElement = (
        <AnimatedTouchable
            onPress={onPress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            disabled={disabled || loading}
            activeOpacity={0.9}
            style={[
                animatedStyle,
                {
                    borderRadius: 16,
                    overflow: "hidden",
                    opacity: disabled ? 0.5 : 1,
                    alignSelf: fullWidth ? "stretch" : "center",
                },
            ]}
        >
            {isGradient ? (
                <LinearGradient
                    colors={gradientColors || ["#A459FF", "#1AA0FF"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={{ borderRadius: 16 }}
                >
                    {buttonContent}
                </LinearGradient>
            ) : (
                <View
                    style={{
                        backgroundColor: style.bg,
                        borderWidth: 1,
                        borderColor: style.border,
                        borderRadius: 16,
                    }}
                >
                    {Platform.OS === "ios" && variant === "secondary" && (
                        <BlurView
                            intensity={20}
                            tint="dark"
                            style={{
                                position: "absolute",
                                top: 0,
                                left: 0,
                                right: 0,
                                bottom: 0,
                                borderRadius: 16,
                            }}
                        />
                    )}
                    {buttonContent}
                </View>
            )}
        </AnimatedTouchable>
    );

    return buttonElement;
};

export default GlassButton;
