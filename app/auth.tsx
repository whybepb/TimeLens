/**
 * Auth Screen - Login and Sign Up
 * Glassmorphic design matching the app theme
 */

import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { Eye, EyeOff, Lock, Mail, Sparkles, User } from "lucide-react-native";
import React, { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    KeyboardAvoidingView,
    Platform,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { getAppwriteService } from "../src/services";

type AuthMode = "login" | "signup";

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
        <View className="flex-1 bg-charcoal-900">
            {/* Gradient background */}
            <LinearGradient
                colors={[
                    "rgba(164, 89, 255, 0.15)",
                    "rgba(26, 160, 255, 0.08)",
                    "transparent",
                ]}
                start={{ x: 0.5, y: 0 }}
                end={{ x: 0.5, y: 0.5 }}
                className="absolute top-0 left-0 right-0 h-96"
            />

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
                            <View className="items-center mb-10">
                                <View className="w-20 h-20 bg-violet-500/20 rounded-3xl items-center justify-center mb-4 border border-violet-500/30">
                                    <Sparkles size={40} color="#A459FF" />
                                </View>
                                <Text className="text-white text-3xl font-bold">TimeLens</Text>
                                <Text className="text-charcoal-400 text-base mt-2">
                                    {mode === "login" ? "Welcome back!" : "Create your account"}
                                </Text>
                            </View>

                            {/* Auth Form */}
                            <View className="bg-charcoal-800/60 rounded-3xl p-6 border border-charcoal-700">
                                {/* Name field (signup only) */}
                                {mode === "signup" && (
                                    <View className="mb-4">
                                        <Text className="text-charcoal-400 text-sm mb-2">Name</Text>
                                        <View className="flex-row items-center bg-charcoal-700/50 rounded-xl px-4 py-3 border border-charcoal-600">
                                            <User size={20} color="#888" />
                                            <TextInput
                                                value={name}
                                                onChangeText={setName}
                                                placeholder="Your name"
                                                placeholderTextColor="#666"
                                                className="flex-1 text-white ml-3 text-base"
                                                autoCapitalize="words"
                                            />
                                        </View>
                                    </View>
                                )}

                                {/* Email field */}
                                <View className="mb-4">
                                    <Text className="text-charcoal-400 text-sm mb-2">Email</Text>
                                    <View className="flex-row items-center bg-charcoal-700/50 rounded-xl px-4 py-3 border border-charcoal-600">
                                        <Mail size={20} color="#888" />
                                        <TextInput
                                            value={email}
                                            onChangeText={setEmail}
                                            placeholder="your@email.com"
                                            placeholderTextColor="#666"
                                            className="flex-1 text-white ml-3 text-base"
                                            keyboardType="email-address"
                                            autoCapitalize="none"
                                            autoCorrect={false}
                                        />
                                    </View>
                                </View>

                                {/* Password field */}
                                <View className="mb-6">
                                    <Text className="text-charcoal-400 text-sm mb-2">Password</Text>
                                    <View className="flex-row items-center bg-charcoal-700/50 rounded-xl px-4 py-3 border border-charcoal-600">
                                        <Lock size={20} color="#888" />
                                        <TextInput
                                            value={password}
                                            onChangeText={setPassword}
                                            placeholder="••••••••"
                                            placeholderTextColor="#666"
                                            className="flex-1 text-white ml-3 text-base"
                                            secureTextEntry={!showPassword}
                                            autoCapitalize="none"
                                        />
                                        <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                                            {showPassword ? (
                                                <EyeOff size={20} color="#888" />
                                            ) : (
                                                <Eye size={20} color="#888" />
                                            )}
                                        </TouchableOpacity>
                                    </View>
                                    {mode === "signup" && (
                                        <Text className="text-charcoal-500 text-xs mt-2">
                                            Must be at least 8 characters
                                        </Text>
                                    )}
                                </View>

                                {/* Submit button */}
                                <TouchableOpacity
                                    onPress={handleSubmit}
                                    disabled={isLoading}
                                    className="bg-violet-500 rounded-xl py-4 items-center"
                                    style={{ opacity: isLoading ? 0.7 : 1 }}
                                >
                                    {isLoading ? (
                                        <ActivityIndicator color="#fff" />
                                    ) : (
                                        <Text className="text-white font-semibold text-base">
                                            {mode === "login" ? "Sign In" : "Create Account"}
                                        </Text>
                                    )}
                                </TouchableOpacity>
                            </View>

                            {/* Toggle mode */}
                            <View className="flex-row justify-center mt-6">
                                <Text className="text-charcoal-400">
                                    {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                                </Text>
                                <TouchableOpacity onPress={toggleMode}>
                                    <Text className="text-violet-400 font-semibold">
                                        {mode === "login" ? "Sign Up" : "Sign In"}
                                    </Text>
                                </TouchableOpacity>
                            </View>

                            {/* Skip for now (dev option) */}
                            <TouchableOpacity
                                onPress={() => router.replace("/dashboard")}
                                className="mt-8 py-3 items-center"
                            >
                                <Text className="text-charcoal-500 text-sm">
                                    Skip for now (offline mode)
                                </Text>
                            </TouchableOpacity>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        </View>
    );
}
