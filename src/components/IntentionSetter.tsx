import React, { useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated';
import { useTheme } from '../contexts';

type IntentionSetterProps = {
    onSetIntention: (intention: string) => void;
    onSkip: () => void;
};

const SUGGESTED_INTENTIONS = [
    { label: '🧘 Calm', value: 'calm' },
    { label: '🎯 Focus', value: 'focus' },
    { label: '⚡ Energy', value: 'energy' },
    { label: '😴 Sleep', value: 'sleep' },
];

export const IntentionSetter: React.FC<IntentionSetterProps> = ({
    onSetIntention,
    onSkip,
}) => {
    const { currentTheme } = useTheme();
    const [customIntention, setCustomIntention] = useState('');

    const handleSuggestion = (value: string) => {
        onSetIntention(value);
    };

    const handleCustom = () => {
        if (customIntention.trim()) {
            onSetIntention(customIntention.trim());
        }
    };

    return (
        <Animated.View
            entering={FadeIn.duration(400)}
            exiting={FadeOut.duration(300)}
            style={[
                styles.container,
                {
                    backgroundColor: currentTheme.colors.glass.light,
                    borderColor: currentTheme.colors.glass.border,
                },
            ]}
        >
            <Text
                style={[
                    styles.title,
                    { color: currentTheme.colors.text.primary },
                ]}
            >
                Set Your Intention
            </Text>
            <Text
                style={[
                    styles.subtitle,
                    { color: currentTheme.colors.text.secondary },
                ]}
            >
                What would you like to cultivate?
            </Text>

            {/* Suggested intentions */}
            <View style={styles.suggestionsContainer}>
                {SUGGESTED_INTENTIONS.map((intention) => (
                    <TouchableOpacity
                        key={intention.value}
                        style={[
                            styles.suggestionButton,
                            {
                                backgroundColor: currentTheme.colors.glass.white,
                                borderColor: currentTheme.colors.glass.border,
                            },
                        ]}
                        onPress={() => handleSuggestion(intention.value)}
                        activeOpacity={0.7}
                    >
                        <Text
                            style={[
                                styles.suggestionText,
                                { color: currentTheme.colors.text.primary },
                            ]}
                        >
                            {intention.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </View>

            {/* Custom intention input */}
            <View style={styles.customContainer}>
                <TextInput
                    style={[
                        styles.input,
                        {
                            backgroundColor: currentTheme.colors.glass.white,
                            borderColor: currentTheme.colors.glass.border,
                            color: currentTheme.colors.text.primary,
                        },
                    ]}
                    placeholder="Or type your own..."
                    placeholderTextColor={currentTheme.colors.text.muted}
                    value={customIntention}
                    onChangeText={setCustomIntention}
                    onSubmitEditing={handleCustom}
                    returnKeyType="done"
                />
                {customIntention.trim() && (
                    <TouchableOpacity
                        style={[
                            styles.setButton,
                            { backgroundColor: currentTheme.colors.primary.primary },
                        ]}
                        onPress={handleCustom}
                        activeOpacity={0.8}
                    >
                        <Text style={[styles.setButtonText, { color: currentTheme.colors.text.inverse }]}>
                            Set
                        </Text>
                    </TouchableOpacity>
                )}
            </View>

            {/* Skip button */}
            <TouchableOpacity
                style={styles.skipButton}
                onPress={onSkip}
                activeOpacity={0.6}
            >
                <Text
                    style={[
                        styles.skipText,
                        { color: currentTheme.colors.text.tertiary },
                    ]}
                >
                    Skip
                </Text>
            </TouchableOpacity>
        </Animated.View>
    );
};

const styles = StyleSheet.create({
    container: {
        borderRadius: 24,
        borderWidth: 1,
        padding: 24,
        width: '90%',
        maxWidth: 400,
    },
    title: {
        fontSize: 24,
        fontWeight: '600',
        marginBottom: 8,
        textAlign: 'center',
    },
    subtitle: {
        fontSize: 14,
        marginBottom: 24,
        textAlign: 'center',
    },
    suggestionsContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 12,
        marginBottom: 20,
        justifyContent: 'center',
    },
    suggestionButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 20,
        borderWidth: 1,
    },
    suggestionText: {
        fontSize: 16,
        fontWeight: '500',
    },
    customContainer: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 16,
    },
    input: {
        flex: 1,
        borderRadius: 12,
        borderWidth: 1,
        paddingHorizontal: 16,
        paddingVertical: 12,
        fontSize: 16,
    },
    setButton: {
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 12,
        justifyContent: 'center',
    },
    setButtonText: {
        fontSize: 16,
        fontWeight: '600',
    },
    skipButton: {
        alignSelf: 'center',
        paddingVertical: 8,
    },
    skipText: {
        fontSize: 14,
        fontWeight: '500',
    },
});
