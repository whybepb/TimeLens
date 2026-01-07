import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { BreathingCircle, IntentionSetter } from '../src/components';
import { useTheme } from '../src/contexts';

type BreathingPhase = 'inhale' | 'hold' | 'exhale' | 'hold2';

type ExerciseType = {
    name: string;
    displayName: string;
    pattern: number[]; // [inhale, hold, exhale, hold2] in seconds
    duration: number; // total minutes
    description: string;
    icon: string;
};

const EXERCISES: ExerciseType[] = [
    {
        name: 'box',
        displayName: 'Box Breathing',
        pattern: [4, 4, 4, 4],
        duration: 4,
        description: 'Equal breathing for balance',
        icon: '⬜',
    },
    {
        name: 'calm',
        displayName: 'Calm',
        pattern: [4, 7, 8, 0],
        duration: 5,
        description: 'Deep relaxation technique',
        icon: '🌙',
    },
    {
        name: 'energize',
        displayName: 'Energize',
        pattern: [4, 2, 4, 2],
        duration: 3,
        description: 'Quick energy boost',
        icon: '⚡',
    },
];

type SessionState = 'selection' | 'intention' | 'countdown' | 'breathing' | 'complete';

const BREATHING_SESSIONS_KEY = '@timelens_breathing_sessions';

export default function BreatheScreen() {
    const router = useRouter();
    const { currentTheme } = useTheme();

    const [sessionState, setSessionState] = useState<SessionState>('selection');
    const [selectedExercise, setSelectedExercise] = useState<ExerciseType | null>(null);
    const [intention, setIntention] = useState<string>('');
    const [currentPhaseIndex, setCurrentPhaseIndex] = useState(0);
    const [cycleCount, setCycleCount] = useState(0);
    const [elapsedTime, setElapsedTime] = useState(0);
    const [isPaused, setIsPaused] = useState(false);
    const [countdown, setCountdown] = useState(3);

    const phases: BreathingPhase[] = ['inhale', 'hold', 'exhale', 'hold2'];

    // Get current phase and duration
    const getCurrentPhase = (): BreathingPhase => {
        if (!selectedExercise) return 'inhale';
        return phases[currentPhaseIndex];
    };

    const getCurrentDuration = (): number => {
        if (!selectedExercise) return 4;
        return selectedExercise.pattern[currentPhaseIndex];
    };

    // Handle exercise selection
    const handleSelectExercise = (exercise: ExerciseType) => {
        setSelectedExercise(exercise);
        setSessionState('intention');
    };

    // Handle intention
    const handleSetIntention = (intentionText: string) => {
        setIntention(intentionText);
        setSessionState('countdown');
    };

    const handleSkipIntention = () => {
        setSessionState('countdown');
    };

    // Countdown before starting
    useEffect(() => {
        if (sessionState === 'countdown' && countdown > 0) {
            const timer = setTimeout(() => {
                setCountdown(countdown - 1);
            }, 1000);
            return () => clearTimeout(timer);
        } else if (sessionState === 'countdown' && countdown === 0) {
            setSessionState('breathing');
        }
    }, [sessionState, countdown]);

    // Track elapsed time
    useEffect(() => {
        if (sessionState === 'breathing' && !isPaused && selectedExercise) {
            const timer = setInterval(() => {
                setElapsedTime((prev) => prev + 1);
            }, 1000);

            // Check if session is complete
            const totalSeconds = selectedExercise.duration * 60;
            if (elapsedTime >= totalSeconds) {
                handleSessionComplete();
            }

            return () => clearInterval(timer);
        }
    }, [sessionState, isPaused, elapsedTime, selectedExercise]);

    // Handle phase completion
    const handlePhaseComplete = useCallback(() => {
        if (!selectedExercise) return;

        const nextPhaseIndex = (currentPhaseIndex + 1) % 4;
        setCurrentPhaseIndex(nextPhaseIndex);

        // Increment cycle count when completing a full cycle
        if (nextPhaseIndex === 0) {
            setCycleCount((prev) => prev + 1);
        }
    }, [currentPhaseIndex, selectedExercise]);

    // Handle session completion
    const handleSessionComplete = async () => {
        setSessionState('complete');

        // Save session to history
        try {
            const session = {
                exercise: selectedExercise?.name,
                intention,
                duration: elapsedTime,
                cycles: cycleCount,
                timestamp: new Date().toISOString(),
            };

            const existingSessions = await AsyncStorage.getItem(BREATHING_SESSIONS_KEY);
            const sessions = existingSessions ? JSON.parse(existingSessions) : [];
            sessions.push(session);
            await AsyncStorage.setItem(BREATHING_SESSIONS_KEY, JSON.stringify(sessions));
        } catch (error) {
            console.error('Failed to save breathing session:', error);
        }
    };

    // Handle pause/resume
    const togglePause = () => {
        setIsPaused(!isPaused);
    };

    // Handle exit
    const handleExit = () => {
        if (sessionState === 'breathing') {
            Alert.alert(
                'Exit Session?',
                'Are you sure you want to end this breathing session?',
                [
                    { text: 'Cancel', style: 'cancel' },
                    {
                        text: 'Exit',
                        style: 'destructive',
                        onPress: () => router.back(),
                    },
                ]
            );
        } else {
            router.back();
        }
    };

    // Render exercise selection
    const renderSelection = () => (
        <Animated.View entering={FadeIn} style={styles.selectionContainer}>
            <Text style={[styles.title, { color: currentTheme.colors.text.primary }]}>
                Choose Your Practice
            </Text>
            <ScrollView
                contentContainerStyle={styles.exercisesContainer}
                showsVerticalScrollIndicator={false}
            >
                {EXERCISES.map((exercise) => (
                    <TouchableOpacity
                        key={exercise.name}
                        style={[
                            styles.exerciseCard,
                            {
                                backgroundColor: currentTheme.colors.glass.light,
                                borderColor: currentTheme.colors.glass.border,
                            },
                        ]}
                        onPress={() => handleSelectExercise(exercise)}
                        activeOpacity={0.8}
                    >
                        <Text style={styles.exerciseIcon}>{exercise.icon}</Text>
                        <Text style={[styles.exerciseName, { color: currentTheme.colors.text.primary }]}>
                            {exercise.displayName}
                        </Text>
                        <Text style={[styles.exercisePattern, { color: currentTheme.colors.text.secondary }]}>
                            {exercise.pattern.filter((p) => p > 0).join('-')} pattern
                        </Text>
                        <Text style={[styles.exerciseDescription, { color: currentTheme.colors.text.tertiary }]}>
                            {exercise.description}
                        </Text>
                        <Text style={[styles.exerciseDuration, { color: currentTheme.colors.primary.primary }]}>
                            {exercise.duration} min
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>
        </Animated.View>
    );

    // Render countdown
    const renderCountdown = () => (
        <Animated.View entering={FadeIn} exiting={FadeOut} style={styles.countdownContainer}>
            <Text style={[styles.countdownText, { color: currentTheme.colors.text.primary }]}>
                {countdown > 0 ? countdown : 'Begin'}
            </Text>
        </Animated.View>
    );

    // Render breathing session
    const renderBreathing = () => {
        const remainingTime = selectedExercise ? selectedExercise.duration * 60 - elapsedTime : 0;
        const minutes = Math.floor(remainingTime / 60);
        const seconds = remainingTime % 60;

        return (
            <Animated.View entering={FadeIn} style={styles.breathingContainer}>
                {/* Progress indicator */}
                <View style={styles.progressContainer}>
                    <Text style={[styles.progressText, { color: currentTheme.colors.text.secondary }]}>
                        {minutes}:{seconds.toString().padStart(2, '0')} remaining
                    </Text>
                    <Text style={[styles.cycleText, { color: currentTheme.colors.text.tertiary }]}>
                        {cycleCount} cycles completed
                    </Text>
                </View>

                {/* Breathing circle */}
                <BreathingCircle
                    phase={getCurrentPhase()}
                    duration={getCurrentDuration()}
                    isActive={!isPaused}
                    onPhaseComplete={handlePhaseComplete}
                />

                {/* Controls */}
                <View style={styles.controlsContainer}>
                    <TouchableOpacity
                        style={[
                            styles.controlButton,
                            {
                                backgroundColor: currentTheme.colors.glass.light,
                                borderColor: currentTheme.colors.glass.border,
                            },
                        ]}
                        onPress={togglePause}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.controlButtonText, { color: currentTheme.colors.text.primary }]}>
                            {isPaused ? '▶️ Resume' : '⏸️ Pause'}
                        </Text>
                    </TouchableOpacity>
                </View>
            </Animated.View>
        );
    };

    // Render completion
    const renderComplete = () => (
        <Animated.View entering={FadeIn} style={styles.completeContainer}>
            <Text style={styles.completeIcon}>✨</Text>
            <Text style={[styles.completeTitle, { color: currentTheme.colors.text.primary }]}>
                Session Complete
            </Text>
            <Text style={[styles.completeSubtitle, { color: currentTheme.colors.text.secondary }]}>
                Great work! You completed {cycleCount} breathing cycles.
            </Text>

            {intention && (
                <View
                    style={[
                        styles.intentionCard,
                        {
                            backgroundColor: currentTheme.colors.glass.light,
                            borderColor: currentTheme.colors.glass.border,
                        },
                    ]}
                >
                    <Text style={[styles.intentionLabel, { color: currentTheme.colors.text.tertiary }]}>
                        Your Intention
                    </Text>
                    <Text style={[styles.intentionText, { color: currentTheme.colors.text.primary }]}>
                        {intention}
                    </Text>
                </View>
            )}

            <TouchableOpacity
                style={[
                    styles.doneButton,
                    { backgroundColor: currentTheme.colors.primary.primary },
                ]}
                onPress={() => router.back()}
                activeOpacity={0.8}
            >
                <Text style={[styles.doneButtonText, { color: currentTheme.colors.text.inverse }]}>
                    Done
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );

    return (
        <LinearGradient
            colors={[currentTheme.colors.gradients.background[0], currentTheme.colors.gradients.background[1]]}
            style={styles.container}
        >
            <SafeAreaView style={styles.safeArea}>
                {/* Header */}
                <View style={styles.header}>
                    <TouchableOpacity onPress={handleExit} style={styles.backButton}>
                        <Text style={[styles.backButtonText, { color: currentTheme.colors.text.primary }]}>
                            ← Back
                        </Text>
                    </TouchableOpacity>
                    {sessionState === 'breathing' && selectedExercise && (
                        <Text style={[styles.headerTitle, { color: currentTheme.colors.text.primary }]}>
                            {selectedExercise.displayName}
                        </Text>
                    )}
                </View>

                {/* Content */}
                <View style={styles.content}>
                    {sessionState === 'selection' && renderSelection()}
                    {sessionState === 'intention' && (
                        <IntentionSetter
                            onSetIntention={handleSetIntention}
                            onSkip={handleSkipIntention}
                        />
                    )}
                    {sessionState === 'countdown' && renderCountdown()}
                    {sessionState === 'breathing' && renderBreathing()}
                    {sessionState === 'complete' && renderComplete()}
                </View>
            </SafeAreaView>
        </LinearGradient>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    safeArea: {
        flex: 1,
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingVertical: 16,
    },
    backButton: {
        padding: 8,
    },
    backButtonText: {
        fontSize: 16,
        fontWeight: '500',
    },
    headerTitle: {
        flex: 1,
        fontSize: 18,
        fontWeight: '600',
        textAlign: 'center',
        marginRight: 60,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
    },
    // Selection
    selectionContainer: {
        flex: 1,
        width: '100%',
        paddingTop: 20,
    },
    title: {
        fontSize: 32,
        fontWeight: '700',
        marginBottom: 32,
        textAlign: 'center',
    },
    exercisesContainer: {
        gap: 16,
        paddingBottom: 40,
    },
    exerciseCard: {
        borderRadius: 20,
        borderWidth: 1,
        padding: 24,
        alignItems: 'center',
    },
    exerciseIcon: {
        fontSize: 48,
        marginBottom: 12,
    },
    exerciseName: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 4,
    },
    exercisePattern: {
        fontSize: 14,
        marginBottom: 8,
    },
    exerciseDescription: {
        fontSize: 14,
        marginBottom: 12,
        textAlign: 'center',
    },
    exerciseDuration: {
        fontSize: 16,
        fontWeight: '600',
    },
    // Countdown
    countdownContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
    countdownText: {
        fontSize: 96,
        fontWeight: '700',
    },
    // Breathing
    breathingContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingVertical: 40,
    },
    progressContainer: {
        alignItems: 'center',
        gap: 4,
    },
    progressText: {
        fontSize: 18,
        fontWeight: '500',
    },
    cycleText: {
        fontSize: 14,
    },
    controlsContainer: {
        gap: 16,
    },
    controlButton: {
        paddingHorizontal: 32,
        paddingVertical: 16,
        borderRadius: 16,
        borderWidth: 1,
    },
    controlButtonText: {
        fontSize: 18,
        fontWeight: '600',
    },
    // Complete
    completeContainer: {
        alignItems: 'center',
        gap: 20,
    },
    completeIcon: {
        fontSize: 80,
    },
    completeTitle: {
        fontSize: 32,
        fontWeight: '700',
    },
    completeSubtitle: {
        fontSize: 16,
        textAlign: 'center',
    },
    intentionCard: {
        borderRadius: 16,
        borderWidth: 1,
        padding: 20,
        marginTop: 12,
        alignItems: 'center',
    },
    intentionLabel: {
        fontSize: 12,
        marginBottom: 8,
        textTransform: 'uppercase',
        letterSpacing: 1,
    },
    intentionText: {
        fontSize: 20,
        fontWeight: '600',
    },
    doneButton: {
        paddingHorizontal: 48,
        paddingVertical: 16,
        borderRadius: 16,
        marginTop: 20,
    },
    doneButtonText: {
        fontSize: 18,
        fontWeight: '600',
    },
});
