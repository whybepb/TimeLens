import React from "react";
import { View, Text, TouchableOpacity, ActivityIndicator } from "react-native";
import { LucideIcon, Check } from "lucide-react-native";
import Animated, {
  useAnimatedStyle,
  withSpring,
  withTiming,
  interpolateColor,
} from "react-native-reanimated";

export type PermissionStatus = "idle" | "loading" | "granted" | "denied";

interface PermissionCardProps {
  icon: LucideIcon;
  iconColor: string;
  title: string;
  description: string;
  status: PermissionStatus;
  onEnable: () => void;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const PermissionCard: React.FC<PermissionCardProps> = ({
  icon: Icon,
  iconColor,
  title,
  description,
  status,
  onEnable,
}) => {
  const isGranted = status === "granted";
  const isLoading = status === "loading";
  const isDenied = status === "denied";

  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      borderColor: withTiming(
        isGranted
          ? "rgba(0, 230, 118, 0.4)"
          : isDenied
          ? "rgba(255, 82, 82, 0.4)"
          : "rgba(255, 255, 255, 0.15)",
        { duration: 300 }
      ),
      transform: [
        {
          scale: withSpring(isGranted ? 1.02 : 1, {
            damping: 15,
            stiffness: 150,
          }),
        },
      ],
    };
  }, [isGranted, isDenied]);

  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: withTiming(isGranted ? 0.6 : 1, { duration: 200 }),
    };
  }, [isGranted]);

  return (
    <Animated.View
      style={cardAnimatedStyle}
      className="bg-white/[0.08] border rounded-2xl p-5 mb-4"
    >
      <View className="flex-row items-start gap-4">
        {/* Icon */}
        <View
          className="w-12 h-12 rounded-full items-center justify-center"
          style={{ backgroundColor: `${iconColor}20` }}
        >
          {isGranted ? (
            <Check size={24} color="#00E676" />
          ) : (
            <Icon size={24} color={iconColor} />
          )}
        </View>

        {/* Content */}
        <View className="flex-1">
          <Text className="text-white text-lg font-semibold mb-1">{title}</Text>
          <Text className="text-white/60 text-sm leading-5 mb-3">
            {description}
          </Text>

          {/* Enable Button */}
          <AnimatedTouchable
            style={buttonAnimatedStyle}
            onPress={onEnable}
            disabled={isGranted || isLoading}
            activeOpacity={0.7}
            className={`
              py-2.5 px-4 rounded-xl items-center justify-center
              ${isGranted ? "bg-green-500/20" : isDenied ? "bg-red-500/20" : "bg-electric-400/20"}
            `}
          >
            {isLoading ? (
              <ActivityIndicator size="small" color="#1AA0FF" />
            ) : (
              <Text
                className={`
                  font-semibold text-sm
                  ${isGranted ? "text-green-400" : isDenied ? "text-red-400" : "text-electric-400"}
                `}
              >
                {isGranted ? "Enabled" : isDenied ? "Denied - Tap to Retry" : "Enable"}
              </Text>
            )}
          </AnimatedTouchable>
        </View>
      </View>
    </Animated.View>
  );
};

export default PermissionCard;
