/**
 * BackButton - Consistent back navigation with theme support
 */

import { BlurView } from "expo-blur";
import { ArrowLeft } from "lucide-react-native";
import React from "react";
import { Platform, TouchableOpacity, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { useTheme } from "../contexts";

interface BackButtonProps {
    onPress: () => void;
    size?: "sm" | "md" | "lg";
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export const BackButton: React.FC<BackButtonProps> = ({
    onPress,
    size = "md",
}) => {
    const { currentTheme } = useTheme();
    const scale = useSharedValue(1);

    const sizes = {
        sm: { button: 36, icon: 16, radius: 10 },
        md: { button: 40, icon: 18, radius: 12 },
        lg: { button: 44, icon: 20, radius: 14 },
    };

    const { button: buttonSize, icon: iconSize, radius } = sizes[size];

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    const onPressIn = () => {
        scale.value = withSpring(0.92, { damping: 15, stiffness: 400 });
    };

    const onPressOut = () => {
        scale.value = withSpring(1, { damping: 15, stiffness: 400 });
    };

    return (
        <AnimatedTouchable
            onPress={onPress}
            onPressIn={onPressIn}
            onPressOut={onPressOut}
            activeOpacity={1}
            style={[
                {
                    width: buttonSize,
                    height: buttonSize,
                    borderRadius: radius,
                    overflow: "hidden",
                },
                animatedStyle,
            ]}
        >
            {Platform.OS === "ios" ? (
                <BlurView
                    intensity={20}
                    tint="dark"
                    style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        borderRadius: radius,
                        borderWidth: 1,
                        borderColor: currentTheme.colors.glass.border,
                    }}
                >
                    <ArrowLeft size={iconSize} color={currentTheme.colors.text.primary} />
                </BlurView>
            ) : (
                <View
                    style={{
                        flex: 1,
                        alignItems: "center",
                        justifyContent: "center",
                        backgroundColor: currentTheme.colors.glass.light,
                        borderRadius: radius,
                        borderWidth: 1,
                        borderColor: currentTheme.colors.glass.border,
                    }}
                >
                    <ArrowLeft size={iconSize} color={currentTheme.colors.text.primary} />
                </View>
            )}
        </AnimatedTouchable>
    );
};

export default BackButton;
