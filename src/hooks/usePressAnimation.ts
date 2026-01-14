/**
 * usePressAnimation - Shared press animation hook
 * Provides spring-based press feedback for any touchable component
 */

import {
    useAnimatedStyle,
    useSharedValue,
    withSpring,
    withTiming,
} from "react-native-reanimated";

interface PressAnimationConfig {
    scaleDown?: number;
    damping?: number;
    stiffness?: number;
}

const DEFAULT_CONFIG: Required<PressAnimationConfig> = {
    scaleDown: 0.96,
    damping: 15,
    stiffness: 400,
};

export const usePressAnimation = (config?: PressAnimationConfig) => {
    const { scaleDown, damping, stiffness } = { ...DEFAULT_CONFIG, ...config };

    const scale = useSharedValue(1);
    const opacity = useSharedValue(1);

    const pressHandlers = {
        onPressIn: () => {
            scale.value = withSpring(scaleDown, { damping, stiffness });
            opacity.value = withTiming(0.9, { duration: 100 });
        },
        onPressOut: () => {
            scale.value = withSpring(1, { damping, stiffness });
            opacity.value = withTiming(1, { duration: 100 });
        },
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
        opacity: opacity.value,
    }));

    return { pressHandlers, animatedStyle };
};

export default usePressAnimation;
