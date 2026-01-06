/**
 * CalendarHeatmap - GitHub-style contribution grid
 * Shows activity intensity for current month
 */

import React from "react";
import { Text, TouchableOpacity, View } from "react-native";

import { HeatmapDay } from "../hooks/useChartData";

interface CalendarHeatmapProps {
    data: HeatmapDay[];
    title?: string;
    onDayPress?: (day: HeatmapDay) => void;
}

// Color intensity levels (0-4)
const INTENSITY_COLORS = [
    "rgba(255, 255, 255, 0.05)", // 0 - no activity
    "rgba(0, 230, 118, 0.2)",     // 1 - low
    "rgba(0, 230, 118, 0.4)",     // 2 - medium-low
    "rgba(0, 230, 118, 0.6)",     // 3 - medium-high
    "rgba(0, 230, 118, 0.9)",     // 4 - high
];

const WEEKDAY_LABELS = ["S", "M", "T", "W", "T", "F", "S"];

export function CalendarHeatmap({ data, title, onDayPress }: CalendarHeatmapProps) {
    const today = new Date();
    const currentMonth = today.getMonth();
    const currentYear = today.getFullYear();
    const todayDate = today.getDate();

    // Get first day of month (0 = Sunday, 6 = Saturday)
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();

    // Get month name
    const monthName = today.toLocaleDateString("en-US", { month: "long", year: "numeric" });

    // Create grid data with padding for first week
    const gridData: (HeatmapDay | null)[] = [];

    // Add empty cells for days before first of month
    for (let i = 0; i < firstDayOfMonth; i++) {
        gridData.push(null);
    }

    // Add actual days
    data.forEach((day) => gridData.push(day));

    // Split into weeks
    const weeks: (HeatmapDay | null)[][] = [];
    for (let i = 0; i < gridData.length; i += 7) {
        weeks.push(gridData.slice(i, i + 7));
    }

    return (
        <View className="bg-charcoal-800/50 rounded-2xl p-4 border border-charcoal-700">
            {/* Header */}
            <View className="flex-row items-center justify-between mb-3">
                <Text className="text-white font-semibold">{title || monthName}</Text>
                <View className="flex-row items-center gap-1">
                    <Text className="text-charcoal-500 text-xs">Less</Text>
                    {INTENSITY_COLORS.map((color, i) => (
                        <View
                            key={i}
                            className="w-3 h-3 rounded-sm"
                            style={{ backgroundColor: color }}
                        />
                    ))}
                    <Text className="text-charcoal-500 text-xs">More</Text>
                </View>
            </View>

            {/* Weekday labels */}
            <View className="flex-row mb-1 px-1">
                {WEEKDAY_LABELS.map((label, i) => (
                    <View key={i} className="flex-1 items-center">
                        <Text className="text-charcoal-600 text-xs">{label}</Text>
                    </View>
                ))}
            </View>

            {/* Calendar grid */}
            <View className="gap-1">
                {weeks.map((week, weekIndex) => (
                    <View key={weekIndex} className="flex-row gap-1">
                        {week.map((day, dayIndex) => {
                            if (!day) {
                                return <View key={`empty-${dayIndex}`} className="flex-1 aspect-square" />;
                            }

                            const isToday = day.dayOfMonth === todayDate;
                            const isFuture = day.dayOfMonth > todayDate;

                            return (
                                <TouchableOpacity
                                    key={day.date}
                                    className={`flex-1 aspect-square rounded-md items-center justify-center ${isToday ? "border-2 border-electric-primary" : ""
                                        }`}
                                    style={{
                                        backgroundColor: isFuture
                                            ? "rgba(255, 255, 255, 0.02)"
                                            : INTENSITY_COLORS[day.intensity],
                                    }}
                                    onPress={() => onDayPress?.(day)}
                                    disabled={isFuture}
                                    activeOpacity={0.7}
                                >
                                    <Text
                                        className={`text-xs ${isToday
                                                ? "text-electric-primary font-bold"
                                                : isFuture
                                                    ? "text-charcoal-700"
                                                    : day.intensity > 2
                                                        ? "text-white font-medium"
                                                        : "text-charcoal-400"
                                            }`}
                                    >
                                        {day.dayOfMonth}
                                    </Text>
                                </TouchableOpacity>
                            );
                        })}
                        {/* Fill remaining cells in last week */}
                        {week.length < 7 &&
                            Array(7 - week.length)
                                .fill(null)
                                .map((_, i) => (
                                    <View key={`fill-${i}`} className="flex-1 aspect-square" />
                                ))
                        }
                    </View>
                ))}
            </View>
        </View>
    );
}

export default CalendarHeatmap;
