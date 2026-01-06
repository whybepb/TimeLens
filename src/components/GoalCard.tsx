/**
 * GoalCard - Displays goal with progress ring and edit capability
 */

import { Check, Edit3 } from "lucide-react-native";
import React, { useState } from "react";
import { Modal, Text, TextInput, TouchableOpacity, View } from "react-native";
import Animated, {
    useAnimatedProps,
    useSharedValue,
    withTiming,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

import { GoalProgress, GoalType } from "../services";

interface GoalCardProps {
    goal: GoalProgress;
    onUpdateGoal?: (type: GoalType, target: number) => void;
    compact?: boolean;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export function GoalCard({ goal, onUpdateGoal, compact = false }: GoalCardProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [editValue, setEditValue] = useState(goal.target.toString());

    const progressAnim = useSharedValue(0);

    // Animate progress on mount
    React.useEffect(() => {
        progressAnim.value = withTiming(goal.percentage / 100, { duration: 800 });
    }, [goal.percentage]);

    const ringSize = compact ? 48 : 64;
    const strokeWidth = compact ? 4 : 6;
    const radius = (ringSize - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;

    const animatedProps = useAnimatedProps(() => ({
        strokeDashoffset: circumference * (1 - progressAnim.value),
    }));

    const handleSave = () => {
        const newTarget = parseInt(editValue, 10);
        if (!isNaN(newTarget) && newTarget > 0 && onUpdateGoal) {
            onUpdateGoal(goal.type, newTarget);
        }
        setIsEditing(false);
    };

    const formatValue = (value: number) => {
        if (value >= 1000) {
            return `${(value / 1000).toFixed(1)}k`;
        }
        return value.toString();
    };

    if (compact) {
        return (
            <TouchableOpacity
                onPress={() => {
                    setEditValue(goal.target.toString());
                    setIsEditing(true);
                }}
                className="flex-row items-center gap-3 bg-charcoal-800/50 rounded-xl p-3 border border-charcoal-700"
                activeOpacity={0.7}
            >
                {/* Mini progress ring */}
                <View className="items-center justify-center" style={{ width: ringSize, height: ringSize }}>
                    <Svg width={ringSize} height={ringSize}>
                        {/* Background circle */}
                        <Circle
                            cx={ringSize / 2}
                            cy={ringSize / 2}
                            r={radius}
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                        />
                        {/* Progress circle */}
                        <AnimatedCircle
                            cx={ringSize / 2}
                            cy={ringSize / 2}
                            r={radius}
                            stroke={goal.color}
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeDasharray={circumference}
                            animatedProps={animatedProps}
                            strokeLinecap="round"
                            rotation="-90"
                            origin={`${ringSize / 2}, ${ringSize / 2}`}
                        />
                    </Svg>
                    <Text className="absolute text-lg">{goal.icon}</Text>
                </View>

                {/* Goal info */}
                <View className="flex-1">
                    <Text className="text-white font-medium text-sm">{goal.label}</Text>
                    <Text className="text-charcoal-400 text-xs">
                        {formatValue(goal.current)} / {formatValue(goal.target)} {goal.unit}
                    </Text>
                </View>

                {/* Status */}
                {goal.isCompleted ? (
                    <View className="w-6 h-6 rounded-full bg-green-500/20 items-center justify-center">
                        <Check size={14} color="#00E676" />
                    </View>
                ) : (
                    <Text className="text-charcoal-500 text-xs">{Math.round(goal.percentage)}%</Text>
                )}

                {/* Edit Modal */}
                <Modal visible={isEditing} transparent animationType="fade">
                    <TouchableOpacity
                        className="flex-1 bg-black/60 items-center justify-center"
                        activeOpacity={1}
                        onPress={() => setIsEditing(false)}
                    >
                        <View className="bg-charcoal-800 rounded-2xl p-6 w-72 border border-charcoal-600">
                            <View className="flex-row items-center gap-2 mb-4">
                                <Text className="text-2xl">{goal.icon}</Text>
                                <Text className="text-white font-semibold text-lg">Edit {goal.label} Goal</Text>
                            </View>

                            <TextInput
                                value={editValue}
                                onChangeText={setEditValue}
                                keyboardType="numeric"
                                className="bg-charcoal-700 text-white text-xl font-medium px-4 py-3 rounded-xl mb-4 text-center"
                                placeholderTextColor="#666"
                            />

                            <View className="flex-row gap-3">
                                <TouchableOpacity
                                    onPress={() => setIsEditing(false)}
                                    className="flex-1 bg-charcoal-700 py-3 rounded-xl items-center"
                                >
                                    <Text className="text-charcoal-300 font-medium">Cancel</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    onPress={handleSave}
                                    className="flex-1 bg-electric-primary py-3 rounded-xl items-center"
                                >
                                    <Text className="text-white font-medium">Save</Text>
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                </Modal>
            </TouchableOpacity>
        );
    }

    // Full size card (existing implementation)
    return (
        <View className="bg-charcoal-800/50 rounded-2xl p-4 border border-charcoal-700">
            <View className="flex-row items-center justify-between mb-3">
                <View className="flex-row items-center gap-2">
                    <Text className="text-xl">{goal.icon}</Text>
                    <Text className="text-white font-semibold">{goal.label}</Text>
                </View>
                {onUpdateGoal && (
                    <TouchableOpacity
                        onPress={() => {
                            setEditValue(goal.target.toString());
                            setIsEditing(true);
                        }}
                        className="p-2"
                    >
                        <Edit3 size={16} color="#888" />
                    </TouchableOpacity>
                )}
            </View>

            {/* Large progress ring */}
            <View className="items-center mb-3">
                <View style={{ width: ringSize, height: ringSize }}>
                    <Svg width={ringSize} height={ringSize}>
                        <Circle
                            cx={ringSize / 2}
                            cy={ringSize / 2}
                            r={radius}
                            stroke="rgba(255,255,255,0.1)"
                            strokeWidth={strokeWidth}
                            fill="transparent"
                        />
                        <AnimatedCircle
                            cx={ringSize / 2}
                            cy={ringSize / 2}
                            r={radius}
                            stroke={goal.color}
                            strokeWidth={strokeWidth}
                            fill="transparent"
                            strokeDasharray={circumference}
                            animatedProps={animatedProps}
                            strokeLinecap="round"
                            rotation="-90"
                            origin={`${ringSize / 2}, ${ringSize / 2}`}
                        />
                    </Svg>
                    <View className="absolute inset-0 items-center justify-center">
                        <Text className="text-white font-bold text-xl">{Math.round(goal.percentage)}%</Text>
                    </View>
                </View>
            </View>

            <Text className="text-center text-charcoal-400 text-sm">
                {formatValue(goal.current)} / {formatValue(goal.target)} {goal.unit}
            </Text>
        </View>
    );
}

export default GoalCard;
