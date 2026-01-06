/**
 * GlassCard - Premium glassmorphic card component
 * Uses expo-blur for real frosted glass effect on iOS
 */

import { BlurView } from "expo-blur";
import React from "react";
import { Platform, View, ViewProps } from "react-native";
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  variant?: "default" | "light" | "medium" | "strong";
  blurIntensity?: number;
  borderGlow?: boolean;
  glowColor?: string;
  padding?: "none" | "sm" | "md" | "lg";
  animated?: boolean;
  fullWidth?: boolean;
}

const AnimatedView = Animated.createAnimatedComponent(View);

export const GlassCard: React.FC<GlassCardProps> = ({
  children,
  variant = "default",
  blurIntensity = 20,
  borderGlow = false,
  glowColor = "rgba(164, 89, 255, 0.3)",
  padding = "md",
  animated = false,
  fullWidth = false,
  className = "",
  style,
  ...props
}) => {
  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    if (animated) {
      scale.value = withSpring(0.98, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    if (animated) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
  };

  // Variant opacity levels
  const variantOpacity = {
    default: 0.08,
    light: 0.12,
    medium: 0.18,
    strong: 0.25,
  };

  // Padding sizes
  const paddingSizes = {
    none: 0,
    sm: 12,
    md: 16,
    lg: 24,
  };

  const bgOpacity = variantOpacity[variant];
  const paddingValue = paddingSizes[padding];

  const cardContent = (
    <View
      style={[
        {
          flex: fullWidth ? undefined : 1,
          width: fullWidth ? "100%" : undefined,
          borderRadius: 20,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: borderGlow ? glowColor : `rgba(255, 255, 255, 0.15)`,
        },
        borderGlow && {
          shadowColor: glowColor,
          shadowOffset: { width: 0, height: 0 },
          shadowOpacity: 0.5,
          shadowRadius: 10,
          elevation: 5,
        },
        style,
      ]}
      {...props}
    >
      {/* Blur background for iOS */}
      {Platform.OS === "ios" ? (
        <BlurView
          intensity={blurIntensity}
          tint="dark"
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          }}
        />
      ) : null}

      {/* Fallback background for Android or overlay for iOS */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: `rgba(255, 255, 255, ${bgOpacity})`,
        }}
      />

      {/* Inner highlight for depth */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: 1,
          backgroundColor: "rgba(255, 255, 255, 0.1)",
        }}
      />

      {/* Content */}
      <View style={{ padding: paddingValue, zIndex: 1 }}>
        {children}
      </View>
    </View>
  );

  if (animated) {
    return (
      <AnimatedView
        style={animatedStyle}
        onTouchStart={handlePressIn}
        onTouchEnd={handlePressOut}
      >
        {cardContent}
      </AnimatedView>
    );
  }

  return cardContent;
};

export default GlassCard;
