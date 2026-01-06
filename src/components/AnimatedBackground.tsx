/**
 * AnimatedBackground - Floating gradient orbs for glassmorphic depth
 * Creates a dynamic, premium feel behind the UI
 */

import { LinearGradient } from "expo-linear-gradient";
import React from "react";
import { Dimensions, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withTiming,
} from "react-native-reanimated";

const { width, height } = Dimensions.get("window");

interface OrbConfig {
    size: number;
    colors: readonly [string, string, ...string[]];
    initialX: number;
    initialY: number;
    animDuration: number;
    delay: number;
    moveX: number;
    moveY: number;
}

interface AnimatedOrbProps extends OrbConfig { }

const AnimatedOrb: React.FC<AnimatedOrbProps> = ({
    size,
    colors,
    initialX,
    initialY,
    animDuration,
    delay,
    moveX,
    moveY,
}) => {
    const translateX = useSharedValue(0);
    const translateY = useSharedValue(0);
    const opacity = useSharedValue(0.6);

    React.useEffect(() => {
        translateX.value = withDelay(
            delay,
            withRepeat(
                withTiming(moveX, { duration: animDuration, easing: Easing.inOut(Easing.ease) }),
                -1,
                true
            )
        );
        translateY.value = withDelay(
            delay,
            withRepeat(
                withTiming(moveY, { duration: animDuration * 1.2, easing: Easing.inOut(Easing.ease) }),
                -1,
                true
            )
        );
        opacity.value = withDelay(
            delay,
            withRepeat(
                withTiming(0.9, { duration: animDuration * 0.8, easing: Easing.inOut(Easing.ease) }),
                -1,
                true
            )
        );
    }, []);

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [
            { translateX: translateX.value },
            { translateY: translateY.value },
        ],
        opacity: opacity.value,
    }));

    return (
        <Animated.View
            style={[
                {
                    position: "absolute",
                    left: initialX,
                    top: initialY,
                    width: size,
                    height: size,
                    borderRadius: size / 2,
                    overflow: "hidden",
                },
                animatedStyle,
            ]}
        >
            <LinearGradient
                colors={colors}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={{ width: size, height: size, borderRadius: size / 2 }}
            />
        </Animated.View>
    );
};

type OrbPreset = "default" | "violet" | "electric" | "warm" | "minimal";

interface AnimatedBackgroundProps {
    preset?: OrbPreset;
    intensity?: "subtle" | "medium" | "vibrant";
}

const ORB_PRESETS: Record<OrbPreset, OrbConfig[]> = {
    default: [
        {
            size: 300,
            colors: ["rgba(164, 89, 255, 0.25)", "rgba(164, 89, 255, 0.05)"] as const,
            initialX: -50,
            initialY: -80,
            animDuration: 8000,
            delay: 0,
            moveX: 40,
            moveY: 30,
        },
        {
            size: 250,
            colors: ["rgba(26, 160, 255, 0.2)", "rgba(26, 160, 255, 0.02)"] as const,
            initialX: width - 150,
            initialY: 100,
            animDuration: 10000,
            delay: 500,
            moveX: -30,
            moveY: 40,
        },
        {
            size: 200,
            colors: ["rgba(34, 211, 238, 0.15)", "rgba(34, 211, 238, 0.02)"] as const,
            initialX: width / 2 - 100,
            initialY: height * 0.5,
            animDuration: 12000,
            delay: 1000,
            moveX: 25,
            moveY: -35,
        },
    ],
    violet: [
        {
            size: 350,
            colors: ["rgba(164, 89, 255, 0.3)", "rgba(138, 61, 230, 0.05)"] as const,
            initialX: -100,
            initialY: -100,
            animDuration: 9000,
            delay: 0,
            moveX: 50,
            moveY: 40,
        },
        {
            size: 280,
            colors: ["rgba(180, 117, 255, 0.2)", "rgba(164, 89, 255, 0.02)"] as const,
            initialX: width - 180,
            initialY: height * 0.3,
            animDuration: 11000,
            delay: 500,
            moveX: -40,
            moveY: 30,
        },
    ],
    electric: [
        {
            size: 320,
            colors: ["rgba(26, 160, 255, 0.3)", "rgba(0, 136, 230, 0.05)"] as const,
            initialX: -80,
            initialY: -60,
            animDuration: 8500,
            delay: 0,
            moveX: 45,
            moveY: 35,
        },
        {
            size: 260,
            colors: ["rgba(34, 211, 238, 0.25)", "rgba(26, 160, 255, 0.02)"] as const,
            initialX: width - 160,
            initialY: 150,
            animDuration: 10500,
            delay: 400,
            moveX: -35,
            moveY: 45,
        },
    ],
    warm: [
        {
            size: 300,
            colors: ["rgba(251, 191, 36, 0.2)", "rgba(245, 158, 11, 0.02)"] as const,
            initialX: -60,
            initialY: -40,
            animDuration: 9000,
            delay: 0,
            moveX: 40,
            moveY: 30,
        },
        {
            size: 250,
            colors: ["rgba(251, 113, 133, 0.2)", "rgba(244, 63, 94, 0.02)"] as const,
            initialX: width - 140,
            initialY: 120,
            animDuration: 11000,
            delay: 600,
            moveX: -30,
            moveY: 40,
        },
    ],
    minimal: [
        {
            size: 400,
            colors: ["rgba(164, 89, 255, 0.12)", "rgba(164, 89, 255, 0.02)"] as const,
            initialX: -100,
            initialY: -150,
            animDuration: 15000,
            delay: 0,
            moveX: 30,
            moveY: 20,
        },
    ],
};

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
    preset = "default",
    intensity = "medium",
}) => {
    const orbs = ORB_PRESETS[preset];

    const intensityMultiplier = intensity === "subtle" ? 0.5 : intensity === "vibrant" ? 1.3 : 1;

    return (
        <View
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                overflow: "hidden",
            }}
            pointerEvents="none"
        >
            {orbs.map((orb, index) => (
                <AnimatedOrb
                    key={index}
                    {...orb}
                    size={orb.size * intensityMultiplier}
                />
            ))}
        </View>
    );
};

export default AnimatedBackground;
