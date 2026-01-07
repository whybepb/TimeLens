/**
 * AnimatedBackground - Enhanced with 5 orbs
 * Features: Theme-based colors, color transitions, holiday themes
 * No device motion to save battery
 */

import { LinearGradient } from "expo-linear-gradient";
import React, { useEffect, useRef } from "react";
import { Dimensions, View } from "react-native";
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withRepeat,
    withTiming,
} from "react-native-reanimated";
import { useTheme } from "../contexts";

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

type HolidayPreset = "christmas" | "halloween" | "newyear" | "valentines";

interface AnimatedBackgroundProps {
    intensity?: "subtle" | "medium" | "vibrant";
    holidayPreset?: HolidayPreset | null;
}

const hexToRgba = (hex: string, opacity: number): string => {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const getActiveHoliday = (): HolidayPreset | null => {
    const now = new Date();
    const month = now.getMonth();
    const day = now.getDate();

    if (month === 11 && day >= 20) return "christmas";
    if (month === 9) return "halloween";
    if (month === 0 && day <= 7) return "newyear";
    if (month === 1 && day === 14) return "valentines";

    return null;
};

const HOLIDAY_COLORS = {
    christmas: {
        primary: "#DC2626",
        secondary: "#16A34A",
        tertiary: "#FBBF24",
    },
    halloween: {
        primary: "#F97316",
        secondary: "#9333EA",
        tertiary: "#1F2937",
    },
    newyear: {
        primary: "#FBBF24",
        secondary: "#94A3B8",
        tertiary: "#A855F7",
    },
    valentines: {
        primary: "#EC4899",
        secondary: "#F43F5E",
        tertiary: "#EF4444",
    },
};

export const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({
    intensity = "medium",
    holidayPreset = null,
}) => {
    const { currentTheme } = useTheme();
    const colorProgress = useSharedValue(0);
    const prevThemeRef = useRef(currentTheme.name);

    const activeHoliday = holidayPreset || getActiveHoliday();

    const sizeMultiplier = intensity === "subtle" ? 0.7 : intensity === "vibrant" ? 1.3 : 1;
    const opacityMultiplier = intensity === "subtle" ? 0.6 : intensity === "vibrant" ? 1.2 : 1;

    const getOrbColors = () => {
        if (activeHoliday) {
            const holidayPalette = HOLIDAY_COLORS[activeHoliday];
            return {
                primary: holidayPalette.primary,
                secondary: holidayPalette.secondary,
                tertiary: holidayPalette.tertiary,
            };
        }
        return {
            primary: currentTheme.colors.primary.primary,
            secondary: currentTheme.colors.secondary.primary,
            tertiary: currentTheme.colors.primary.secondary,
        };
    };

    const orbColors = getOrbColors();

    // Animate color transitions when theme changes
    useEffect(() => {
        if (prevThemeRef.current !== currentTheme.name) {
            colorProgress.value = 0;
            colorProgress.value = withTiming(1, {
                duration: 600,
                easing: Easing.bezier(0.4, 0, 0.2, 1),
            });
            prevThemeRef.current = currentTheme.name;
        }
    }, [currentTheme.name]);

    // 5 orb configurations
    const orbs: OrbConfig[] = React.useMemo(() => [
        // Orb 1 - Large primary (top-left)
        {
            size: 300 * sizeMultiplier,
            colors: [
                hexToRgba(orbColors.primary, 0.25 * opacityMultiplier),
                hexToRgba(orbColors.primary, 0.05 * opacityMultiplier)
            ] as const,
            initialX: -50,
            initialY: -80,
            animDuration: 8000,
            delay: 0,
            moveX: 40,
            moveY: 30,
        },
        // Orb 2 - Medium secondary (top-right)
        {
            size: 250 * sizeMultiplier,
            colors: [
                hexToRgba(orbColors.secondary, 0.2 * opacityMultiplier),
                hexToRgba(orbColors.secondary, 0.02 * opacityMultiplier)
            ] as const,
            initialX: width - 150,
            initialY: 100,
            animDuration: 10000,
            delay: 500,
            moveX: -30,
            moveY: 40,
        },
        // Orb 3 - Small tertiary (center)
        {
            size: 200 * sizeMultiplier,
            colors: [
                hexToRgba(orbColors.tertiary, 0.15 * opacityMultiplier),
                hexToRgba(orbColors.secondary, 0.02 * opacityMultiplier)
            ] as const,
            initialX: width / 2 - 100,
            initialY: height * 0.5,
            animDuration: 12000,
            delay: 1000,
            moveX: 25,
            moveY: -35,
        },
        // Orb 4 - NEW: Medium-small (bottom-left)
        {
            size: 180 * sizeMultiplier,
            colors: [
                hexToRgba(orbColors.tertiary, 0.18 * opacityMultiplier),
                hexToRgba(orbColors.primary, 0.03 * opacityMultiplier)
            ] as const,
            initialX: -30,
            initialY: height * 0.7,
            animDuration: 11000,
            delay: 700,
            moveX: 35,
            moveY: -25,
        },
        // Orb 5 - NEW: Small accent (top-right gap)
        {
            size: 150 * sizeMultiplier,
            colors: [
                hexToRgba(orbColors.secondary, 0.12 * opacityMultiplier),
                hexToRgba(orbColors.tertiary, 0.02 * opacityMultiplier)
            ] as const,
            initialX: width * 0.6,
            initialY: -40,
            animDuration: 9500,
            delay: 400,
            moveX: -20,
            moveY: 30,
        },
    ], [orbColors, sizeMultiplier, opacityMultiplier]);

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
                    key={`${currentTheme.name}-${activeHoliday || 'normal'}-${index}`}
                    {...orb}
                />
            ))}
        </View>
    );
};

export default AnimatedBackground;
