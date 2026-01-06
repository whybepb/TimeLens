/**
 * WeeklyChart - Bar chart for 7-day trends
 * Pure React Native implementation (no external chart library)
 */

import React from "react";
import { Text, View } from "react-native";
import Animated, {
    useAnimatedStyle,
    useSharedValue,
    withDelay,
    withTiming,
} from "react-native-reanimated";

import { ChartDataPoint } from "../hooks/useChartData";

interface WeeklyChartProps {
    data: ChartDataPoint[];
    title: string;
    color: string;
    unit?: string;
    icon?: string;
}

interface AnimatedBarProps {
    value: number;
    maxValue: number;
    color: string;
    label: string;
    isToday: boolean;
    index: number;
    showValue?: boolean;
}

function AnimatedBar({
    value,
    maxValue,
    color,
    label,
    isToday,
    index,
    showValue = true,
}: AnimatedBarProps) {
    const heightAnim = useSharedValue(0);
    const normalizedHeight = maxValue > 0 ? (value / maxValue) * 100 : 0;

    React.useEffect(() => {
        heightAnim.value = withDelay(index * 80, withTiming(normalizedHeight, { duration: 600 }));
    }, [normalizedHeight, index]);

    const barStyle = useAnimatedStyle(() => ({
        height: `${heightAnim.value}%`,
    }));

    const formatValue = (val: number) => {
        if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
        return val.toString();
    };

    return (
        <View className="flex-1 items-center">
            {/* Value label */}
            {showValue && value > 0 && (
                <Text className="text-charcoal-400 text-xs mb-1">
                    {formatValue(value)}
                </Text>
            )}

            {/* Bar container */}
            <View className="flex-1 w-full max-w-[32px] justify-end">
                <Animated.View
                    style={[
                        barStyle,
                        {
                            backgroundColor: isToday ? color : `${color}80`,
                            minHeight: value > 0 ? 4 : 0,
                        },
                    ]}
                    className={`w-full rounded-t-md ${isToday ? 'shadow-lg' : ''}`}
                />
            </View>

            {/* Day label */}
            <Text
                className={`text-xs mt-2 ${isToday ? 'text-white font-semibold' : 'text-charcoal-500'
                    }`}
            >
                {label}
            </Text>
        </View>
    );
}

export function WeeklyChart({ data, title, color, unit = "", icon }: WeeklyChartProps) {
    // Calculate max value for scaling
    const maxValue = Math.max(...data.map((d) => d.value), 1);

    // Calculate average
    const nonZeroValues = data.filter((d) => d.value > 0);
    const average = nonZeroValues.length > 0
        ? Math.round(nonZeroValues.reduce((sum, d) => sum + d.value, 0) / nonZeroValues.length)
        : 0;

    const formatAverage = (val: number) => {
        if (val >= 1000) return `${(val / 1000).toFixed(1)}k`;
        return val.toString();
    };

    return (
        <View className="bg-charcoal-800/50 rounded-2xl p-4 border border-charcoal-700">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-4">
                <View className="flex-row items-center gap-2">
                    {icon && <Text className="text-lg">{icon}</Text>}
                    <Text className="text-white font-semibold">{title}</Text>
                </View>
                <View className="flex-row items-center gap-1">
                    <Text className="text-charcoal-400 text-xs">Avg:</Text>
                    <Text className="text-white text-sm font-medium">
                        {formatAverage(average)}{unit && ` ${unit}`}
                    </Text>
                </View>
            </View>

            {/* Chart */}
            <View className="flex-row h-32 gap-1">
                {data.map((point, index) => (
                    <AnimatedBar
                        key={point.date}
                        value={point.value}
                        maxValue={maxValue}
                        color={color}
                        label={point.label}
                        isToday={point.isToday}
                        index={index}
                        showValue={false}
                    />
                ))}
            </View>
        </View>
    );
}

export default WeeklyChart;
