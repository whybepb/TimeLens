/**
 * ProgressRings - Multiple concentric progress rings
 * Shows multiple metrics at once (Steps, Sleep, Focus, etc.)
 */

import React from "react";
import { Text, View } from "react-native";
import Animated, {
    useAnimatedProps,
    useSharedValue,
    withDelay,
    withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

import { GoalProgress } from "../services";

interface ProgressRingsProps {
    goals: GoalProgress[];
    size?: number;
    strokeWidth?: number;
    showLegend?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface RingProps {
    progress: number;
    color: string;
    radius: number;
    strokeWidth: number;
    index: number;
    centerX: number;
    centerY: number;
}

function AnimatedRing({
    progress,
    color,
    radius,
    strokeWidth,
    index,
    centerX,
    centerY,
}: RingProps) {
    const progressAnim = useSharedValue(0);
    const circumference = 2 * Math.PI * radius;

    React.useEffect(() => {
        progressAnim.value = withDelay(
            index * 150,
            withTiming(progress / 100, { duration: 800 })
        );
    }, [progress, index]);

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference * (1 - progressAnim.value),
    }));

    return (
        <>
            {/* Background circle */}
            <Circle
                cx={centerX}
                cy={centerY}
                r={radius}
                stroke={`${color}20`}
                strokeWidth={strokeWidth}
                fill="transparent"
            />
            {/* Progress circle */}
            <AnimatedCircle
                cx={centerX}
                cy={centerY}
                r={radius}
                stroke={color}
                strokeWidth={strokeWidth}
                fill="transparent"
                strokeDasharray={circumference}
                animatedProps={animatedProps}
                strokeLinecap="round"
                rotation="-90"
                origin={`${centerX}, ${centerY}`}
            />
        </>
    );
}

export function ProgressRings({
    goals,
    size = 160,
    strokeWidth = 10,
    showLegend = true,
}: ProgressRingsProps) {
    // Only show up to 4 rings to avoid clutter
    const displayGoals = goals.slice(0, 4);
    const gap = 4;
    const centerX = size / 2;
    const centerY = size / 2;

    return (
        <View className="items-center">
            {/* Rings SVG */}
            <View style={{ width: size, height: size }}>
                <Svg width={size} height={size}>
                    {displayGoals.map((goal, index) => {
                        const radius = (size / 2) - (strokeWidth / 2) - (index * (strokeWidth + gap));
                        return (
                            <AnimatedRing
                                key={goal.type}
                                progress={goal.percentage}
                                color={goal.color}
                                radius={radius}
                                strokeWidth={strokeWidth}
                                index={index}
                                centerX={centerX}
                                centerY={centerY}
                            />
                        );
                    })}
                </Svg>

                {/* Center content */}
                <View className="absolute inset-0 items-center justify-center">
                    <Text className="text-white font-bold text-2xl">
                        {displayGoals.filter((g) => g.isCompleted).length}/{displayGoals.length}
                    </Text>
                    <Text className="text-charcoal-400 text-xs">goals met</Text>
                </View>
            </View>

            {/* Legend */}
            {showLegend && (
                <View className="flex-row flex-wrap justify-center gap-3 mt-4">
                    {displayGoals.map((goal) => (
                        <View key={goal.type} className="flex-row items-center gap-1.5">
                            <View
                                className="w-3 h-3 rounded-full"
                                style={{ backgroundColor: goal.color }}
                            />
                            <Text className="text-charcoal-400 text-xs">{goal.label}</Text>
                            {goal.isCompleted && (
                                <Text className="text-green-400 text-xs">✓</Text>
                            )}
                        </View>
                    ))}
                </View>
            )}
        </View>
    );
}

export default ProgressRings;
