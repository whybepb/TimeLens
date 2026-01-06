/**
 * DataCard - Glassmorphic data display card
 * Used for displaying metrics like Steps, Sleep, Focus Time, etc.
 */

import { BlurView } from "expo-blur";
import { LucideIcon } from "lucide-react-native";
import React from "react";
import { Platform, Text, View } from "react-native";
import Animated, {
  FadeIn,
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from "react-native-reanimated";

interface DataItemProps {
  icon: LucideIcon;
  iconColor: string;
  label: string;
  value: string;
  unit?: string;
}

interface DataCardProps {
  title: string;
  titleIcon: LucideIcon;
  titleIconColor: string;
  items: DataItemProps[];
}

export const DataCard: React.FC<DataCardProps> = ({
  title,
  titleIcon: TitleIcon,
  titleIconColor,
  items,
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

  return (
    <Animated.View
      entering={FadeIn.duration(400)}
      style={[animatedStyle, { flex: 1 }]}
      onTouchStart={handlePressIn}
      onTouchEnd={handlePressOut}
    >
      <View
        style={{
          flex: 1,
          borderRadius: 20,
          overflow: "hidden",
          borderWidth: 1,
          borderColor: "rgba(255, 255, 255, 0.12)",
        }}
      >
        {/* Blur background for iOS */}
        {Platform.OS === "ios" && (
          <BlurView
            intensity={25}
            tint="dark"
            style={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
            }}
          />
        )}

        {/* Background overlay */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(255, 255, 255, 0.06)",
          }}
        />

        {/* Inner highlight */}
        <View
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 1,
            backgroundColor: "rgba(255, 255, 255, 0.08)",
          }}
        />

        {/* Content */}
        <View style={{ padding: 16, zIndex: 1 }}>
          {/* Header */}
          <View className="flex-row items-center gap-2 mb-4">
            <View
              style={{
                width: 28,
                height: 28,
                borderRadius: 8,
                backgroundColor: `${titleIconColor}20`,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <TitleIcon size={16} color={titleIconColor} />
            </View>
            <Text className="text-white/80 text-sm font-semibold tracking-wide">
              {title}
            </Text>
          </View>

          {/* Data items */}
          <View className="gap-4">
            {items.map((item, index) => {
              const ItemIcon = item.icon;
              return (
                <View key={index} className="flex-row items-center justify-between">
                  <View className="flex-row items-center gap-2">
                    <View
                      style={{
                        width: 6,
                        height: 6,
                        borderRadius: 3,
                        backgroundColor: item.iconColor,
                        shadowColor: item.iconColor,
                        shadowOffset: { width: 0, height: 0 },
                        shadowOpacity: 0.6,
                        shadowRadius: 4,
                      }}
                    />
                    <Text className="text-white/50 text-xs font-medium">
                      {item.label}
                    </Text>
                  </View>
                  <View className="flex-row items-baseline gap-1">
                    <Text className="text-white font-bold text-xl tracking-tight">
                      {item.value}
                    </Text>
                    {item.unit && (
                      <Text className="text-white/40 text-xs font-medium">
                        {item.unit}
                      </Text>
                    )}
                  </View>
                </View>
              );
            })}
          </View>
        </View>
      </View>
    </Animated.View>
  );
};

export default DataCard;
