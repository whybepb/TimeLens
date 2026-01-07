import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withTiming
} from 'react-native-reanimated';
import { useTheme } from '../contexts';

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'hold2';

type BreathingCircleProps = {
    phase: BreathingPhase;
    duration: number;
    isActive: boolean;
    onPhaseComplete?: () => void;
};

const PHASE_LABELS = {
    inhale: 'Breathe In',
    hold: 'Hold',
    exhale: 'Breathe Out',
    hold2: 'Hold',
};

export const BreathingCircle: React.FC<BreathingCircleProps> = ({
    phase,
    duration,
    isActive,
    onPhaseComplete,
}) => {
    const { currentTheme } = useTheme();
    const scale = useSharedValue(0.6);
    const opacity = useSharedValue(0.3);
    const rotation = useSharedValue(0);

    useEffect(() => {
        if (isActive) {
            // Trigger haptic feedback on phase change
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

            // Determine target scale based on phase
            const targetScale = phase === 'inhale' ? 1 : phase === 'exhale' ? 0.6 : 0.8;
            const targetOpacity = phase === 'inhale' ? 0.8 : phase === 'exhale' ? 0.3 : 0.5;

            // Animate scale and opacity
            scale.value = withTiming(targetScale, {
                duration: duration * 1000,
                easing: Easing.bezier(0.4, 0, 0.2, 1),
            });

            opacity.value = withTiming(targetOpacity, {
                duration: duration * 1000,
                easing: Easing.bezier(0.4, 0, 0.2, 1),
            });

            // Continuous rotation
            rotation.value = withRepeat(
                withTiming(360, {
                    duration: 20000,
                    easing: Easing.linear,
                }),
                -1,
                false
            );

            // Call completion callback after duration
            const timer = setTimeout(() => {
                onPhaseComplete?.();
            }, duration * 1000);

            return () => clearTimeout(timer);
        }
    }, [phase, duration, isActive]);

    const animatedStyle = useAnimatedStyle(() => {
        return {
            transform: [
                { scale: scale.value },
                { rotate: `${rotation.value}deg` },
            ],
            opacity: opacity.value,
        };
    });

    const getGradientColors = () => {
        switch (phase) {
            case 'inhale':
                return currentTheme.colors.gradients.primary;
            case 'exhale':
                return currentTheme.colors.gradients.secondary;
            default:
                return [currentTheme.colors.primary.primary, currentTheme.colors.secondary.primary];
        }
    };

    return (
        <View style={styles.container}>
            {/* Outer glow rings */}
            <Animated.View style={[styles.glowRing, animatedStyle]}>
                <LinearGradient
                    colors={[getGradientColors()[0], getGradientColors()[1], 'transparent']}
                    style={styles.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            </Animated.View>

            {/* Main circle */}
            <Animated.View style={[styles.circle, animatedStyle]}>
                <LinearGradient
                    colors={[getGradientColors()[0], getGradientColors()[1]]}
                    style={styles.gradient}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                />
            </Animated.View>

            {/* Phase label */}
            <View style={styles.labelContainer}>
                <Text
                    style={[
                        styles.phaseLabel,
                        { color: currentTheme.colors.text.primary },
                    ]}
                >
                    {PHASE_LABELS[phase]}
                </Text>
                <Text
                    style={[
                        styles.durationLabel,
                        { color: currentTheme.colors.text.secondary },
                    ]}
                >
                    {duration}s
                </Text>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        width: 320,
        height: 320,
    },
    circle: {
        width: 240,
        height: 240,
        borderRadius: 120,
        overflow: 'hidden',
    },
    glowRing: {
        position: 'absolute',
        width: 280,
        height: 280,
        borderRadius: 140,
        overflow: 'hidden',
    },
    gradient: {
        flex: 1,
        width: '100%',
        height: '100%',
    },
    labelContainer: {
        position: 'absolute',
        alignItems: 'center',
    },
    phaseLabel: {
        fontSize: 28,
        fontWeight: '600',
        letterSpacing: 0.5,
        marginBottom: 4,
    },
    durationLabel: {
        fontSize: 18,
        fontWeight: '400',
    },
});
