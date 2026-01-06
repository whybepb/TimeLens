/**
 * Auth Screen - Login and Sign Up
 * Premium glassmorphic design with animated background
 */

import { BlurView } from "expo-blur";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Eye, EyeOff, Lock, Mail, Sparkles, User } from "lucide-react-native";
import React, { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View
} from "react-native";
import Animated, {
    FadeIn,
    FadeInDown,
    useAnimatedStyle,
    useSharedValue,
    withSpring,
} from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { AnimatedBackground, GlassButton } from "../src/components";
import { getAppwriteService } from "../src/services";

type AuthMode = "login" | "signup";

interface AnimatedInputProps {
    value: string;
    onChangeText: (text: string) => void;
    placeholder: string;
    icon: React.ReactNode;
    secureTextEntry?: boolean;
    keyboardType?: "default" | "email-address";
    autoCapitalize?: "none" | "words";
    rightElement?: React.ReactNode;
}

const AnimatedInput: React.FC<AnimatedInputProps> = ({
    value,
    onChangeText,
    placeholder,
    icon,
    secureTextEntry,
    keyboardType = "default",
    autoCapitalize = "none",
    rightElement,
}) => {
    const [isFocused, setIsFocused] = useState(false);
    const scale = useSharedValue(1);
    const borderOpacity = useSharedValue(0.15);

    const handleFocus = () => {
        setIsFocused(true);
        scale.value = withSpring(1.02, { damping: 15, stiffness: 200 });
        borderOpacity.value = withSpring(0.4, { damping: 15 });
    };

    const handleBlur = () => {
        setIsFocused(false);
        scale.value = withSpring(1, { damping: 15, stiffness: 200 });
        borderOpacity.value = withSpring(0.15, { damping: 15 });
    };

    const animatedStyle = useAnimatedStyle(() => ({
        transform: [{ scale: scale.value }],
    }));

    return (
        <Animated.View style={animatedStyle}>
            <View
                style={{
                    flexDirection: "row",
                    alignItems: "center",
                    backgroundColor: isFocused ? "rgba(255, 255, 255, 0.1)" : "rgba(255, 255, 255, 0.05)",
                    borderRadius: 16,
                    paddingHorizontal: 16,
                    paddingVertical: 14,
                    borderWidth: 1,
                    borderColor: isFocused ? "rgba(164, 89, 255, 0.5)" : "rgba(255, 255, 255, 0.12)",
                }}
            >
                {icon}
                <TextInput
                    value={value}
                    onChangeText={onChangeText}
                    placeholder={placeholder}
                    placeholderTextColor="rgba(255, 255, 255, 0.35)"
                    style={{
                        flex: 1,
                        color: "#FFFFFF",
                        marginLeft: 12,
                        fontSize: 16,
                    }}
                    keyboardType={keyboardType}
                    autoCapitalize={autoCapitalize}
                    autoCorrect={false}
                    secureTextEntry={secureTextEntry}
                    onFocus={handleFocus}
                    onBlur={handleBlur}
                />
                {rightElement}
            </View>
        </Animated.View>
    );
};

export default function AuthScreen() {
    const router = useRouter();
    const [mode, setMode] = useState<AuthMode>("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const appwrite = getAppwriteService();

    const handleSubmit = async () => {
        // Validation
        if (!email.trim() || !password.trim()) {
            Alert.alert("Error", "Please fill in all fields");
            return;
        }

        if (mode === "signup" && !name.trim()) {
            Alert.alert("Error", "Please enter your name");
            return;
        }

        if (password.length < 8) {
            Alert.alert("Error", "Password must be at least 8 characters");
            return;
        }

        setIsLoading(true);

        try {
            if (mode === "login") {
                const user = await appwrite.login(email.trim(), password);
                if (user) {
                    console.log("[Auth] Login successful:", user.email);
                    router.replace("/dashboard");
                } else {
                    Alert.alert("Login Failed", "Invalid email or password");
                }
            } else {
                const user = await appwrite.createAccount(email.trim(), password, name.trim());
                if (user) {
                    console.log("[Auth] Signup successful:", user.email);
                    router.replace("/onboarding");
                } else {
                    Alert.alert("Signup Failed", "Could not create account. Email may already be in use.");
                }
            }
        } catch (error: any) {
            console.error("[Auth] Error:", error);
            Alert.alert("Error", error.message || "Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    const toggleMode = () => {
        setMode(mode === "login" ? "signup" : "login");
        setPassword("");
    };

    return (
        <View className="flex-1 bg-charcoal-950">
            {/* Animated gradient orbs background */}
            <AnimatedBackground preset="violet" intensity="vibrant" />

            <SafeAreaView className="flex-1">
                <KeyboardAvoidingView
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                    className="flex-1"
                >
                    <ScrollView
                        className="flex-1"
                        contentContainerStyle={{ flexGrow: 1, justifyContent: "center" }}
                        keyboardShouldPersistTaps="handled"
                    >
                        <View className="px-6 py-8">
                            {/* Logo / Header */}
                            <Animated.View
                                entering={FadeInDown.duration(500)}
                                className="items-center mb-10"
                            >
                                <View
                                    style={{
                                        width: 80,
                                        height: 80,
                                        borderRadius: 28,
                                        overflow: "hidden",
                                        marginBottom: 20,
                                    }}
                                >
                                    {Platform.OS === "ios" && (
                                        <BlurView
                                            intensity={40}
                                            tint="dark"
                                            style={{
                                                position: "absolute",
                                                top: 0,
                                                left: 0,
                                                right: 0,
                                                bottom: 0,
                                            }}
                                        />
                                    )}
                                    <LinearGradient
                                        colors={["rgba(164, 89, 255, 0.3)", "rgba(26, 160, 255, 0.2)"]}
                                        start={{ x: 0, y: 0 }}
                                        end={{ x: 1, y: 1 }}
                                        style={{
                                            flex: 1,
                                            alignItems: "center",
                                            justifyContent: "center",
                                            borderWidth: 1,
                                            borderColor: "rgba(255, 255, 255, 0.2)",
                                            borderRadius: 28,
                                        }}
                                    >
                                        <Sparkles size={36} color="#A459FF" />
                                    </LinearGradient>
                                </View>
                                <Text className="text-white text-3xl font-bold tracking-tight">
                                    TimeLens
                                </Text>
                                <Text className="text-white/50 text-base mt-2">
                                    {mode === "login" ? "Welcome back!" : "Create your account"}
                                </Text>
                            </Animated.View>

                            {/* Auth Form */}
                            <Animated.View
                                entering={FadeInDown.delay(100).duration(500)}
                                style={{
                                    borderRadius: 28,
                                    overflow: "hidden",
                                    borderWidth: 1,
                                    borderColor: "rgba(255, 255, 255, 0.1)",
                                }}
                            >
                                {Platform.OS === "ios" && (
                                    <BlurView
                                        intensity={30}
                                        tint="dark"
                                        style={{
                                            position: "absolute",
                                            top: 0,
                                            left: 0,
                                            right: 0,
                                            bottom: 0,
                                        }}
                                    />
                                )}
                                <View
                                    style={{
                                        backgroundColor: Platform.OS === "android" ? "rgba(255, 255, 255, 0.08)" : "transparent",
                                        padding: 24,
                                    }}
                                >
                                    {/* Name field (signup only) */}
                                    {mode === "signup" && (
                                        <Animated.View entering={FadeIn.duration(300)} className="mb-4">
                                            <Text className="text-white/60 text-sm mb-2 font-medium">Name</Text>
                                            <AnimatedInput
                                                value={name}
                                                onChangeText={setName}
                                                placeholder="Your name"
                                                icon={<User size={20} color="rgba(255, 255, 255, 0.4)" />}
                                                autoCapitalize="words"
                                            />
                                        </Animated.View>
                                    )}

                                    {/* Email field */}
                                    <View className="mb-4">
                                        <Text className="text-white/60 text-sm mb-2 font-medium">Email</Text>
                                        <AnimatedInput
                                            value={email}
                                            onChangeText={setEmail}
                                            placeholder="your@email.com"
                                            icon={<Mail size={20} color="rgba(255, 255, 255, 0.4)" />}
                                            keyboardType="email-address"
                                        />
                                    </View>

                                    {/* Password field */}
                                    <View className="mb-6">
                                        <Text className="text-white/60 text-sm mb-2 font-medium">Password</Text>
                                        <AnimatedInput
                                            value={password}
                                            onChangeText={setPassword}
                                            placeholder="••••••••"
                                            icon={<Lock size={20} color="rgba(255, 255, 255, 0.4)" />}
                                            secureTextEntry={!showPassword}
                                            rightElement={
                                                <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                                    {showPassword ? (
                                                        <EyeOff size={20} color="rgba(255, 255, 255, 0.4)" />
                                                    ) : (
                                                        <Eye size={20} color="rgba(255, 255, 255, 0.4)" />
                                                    )}
                                                </TouchableOpacity>
                                            }
                                        />
                                        {mode === "signup" && (
                                            <Text className="text-white/30 text-xs mt-2">
                                                Must be at least 8 characters
                                            </Text>
                                        )}
                                    </View>

                                    {/* Submit button */}
                                    <GlassButton
                                        title={mode === "login" ? "Sign In" : "Create Account"}
                                        onPress={handleSubmit}
                                        variant="gradient"
                                        gradientColors={["#A459FF", "#7021CC"]}
                                        loading={isLoading}
                                        fullWidth
                                        size="lg"
                                    />
                                </View>
                            </Animated.View>

                            {/* Toggle mode */}
                            <Animated.View
                                entering={FadeInDown.delay(200).duration(400)}
                                className="flex-row justify-center mt-8"
                            >
                                <Text className="text-white/40">
                                    {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                                </Text>
                                <TouchableOpacity onPress={toggleMode}>
                                    <Text className="text-violet-400 font-semibold">
                                        {mode === "login" ? "Sign Up" : "Sign In"}
                                    </Text>
                                </TouchableOpacity>
                            </Animated.View>

                            {/* Skip for now (dev option) */}
                            <Animated.View entering={FadeInDown.delay(300).duration(400)}>
                                <TouchableOpacity
                                    onPress={() => router.replace("/dashboard")}
                                    className="mt-6 py-3 items-center"
                                >
                                    <Text className="text-white/30 text-sm">
                                        Continue without account
                                    </Text>
                                </TouchableOpacity>
                            </Animated.View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}
