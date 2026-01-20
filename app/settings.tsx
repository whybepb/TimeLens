/**
 * Settings Screen - Account, Theme, Notifications & About
 * Premium glassmorphic design with animated elements
 */

import { BlurView } from "expo-blur";
import Constants from "expo-constants";
import { useRouter } from "expo-router";
import {
    Bell,
    ChevronRight,
    LogOut,
    Moon,
    Palette,
    Shield,
    Target,
    Trash2,
    User,
} from "lucide-react-native";
import React, { useState } from "react";
import {
    Alert,
    Platform,
    ScrollView,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import Animated, { FadeInDown } from "react-native-reanimated";
import { SafeAreaView } from "react-native-safe-area-context";

import { AnimatedBackground, BackButton } from "../src/components";
import { useAuth, useTheme } from "../src/contexts";
import { useNotifications } from "../src/hooks";

interface SettingsItemProps {
    icon: React.ElementType;
    iconColor: string;
    title: string;
    subtitle?: string;
    onPress?: () => void;
    rightElement?: React.ReactNode;
    showChevron?: boolean;
}

const SettingsItem: React.FC<SettingsItemProps> = ({
    icon: Icon,
    iconColor,
    title,
    subtitle,
    onPress,
    rightElement,
    showChevron = true,
}) => {
    const { currentTheme } = useTheme();

    return (
        <TouchableOpacity
            onPress={onPress}
            disabled={!onPress && !rightElement}
            activeOpacity={0.7}
            style={{
                flexDirection: "row",
                alignItems: "center",
                paddingVertical: 14,
                paddingHorizontal: 16,
            }}
        >
            <View
                style={{
                    width: 40,
                    height: 40,
                    borderRadius: 12,
                    backgroundColor: `${iconColor}20`,
                    alignItems: "center",
                    justifyContent: "center",
                    marginRight: 14,
                }}
            >
                <Icon size={20} color={iconColor} />
            </View>
            <View style={{ flex: 1 }}>
                <Text
                    style={{
                        color: currentTheme.colors.text.primary,
                        fontSize: 16,
                        fontWeight: "500",
                    }}
                >
                    {title}
                </Text>
                {subtitle && (
                    <Text
                        style={{
                            color: currentTheme.colors.text.tertiary,
                            fontSize: 13,
                            marginTop: 2,
                        }}
                    >
                        {subtitle}
                    </Text>
                )}
            </View>
            {rightElement}
            {showChevron && onPress && (
                <ChevronRight size={20} color={currentTheme.colors.text.muted} />
            )}
        </TouchableOpacity>
    );
};

interface SettingsSectionProps {
    title: string;
    children: React.ReactNode;
    delay?: number;
}

const SettingsSection: React.FC<SettingsSectionProps> = ({
    title,
    children,
    delay = 0,
}) => {
    const { currentTheme } = useTheme();

    return (
        <Animated.View
            entering={FadeInDown.delay(delay).duration(400)}
            style={{ marginBottom: 24 }}
        >
            <Text
                style={{
                    color: currentTheme.colors.text.tertiary,
                    fontSize: 13,
                    fontWeight: "600",
                    marginBottom: 8,
                    marginLeft: 4,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                }}
            >
                {title}
            </Text>
            <View
                style={{
                    borderRadius: 20,
                    overflow: "hidden",
                    borderWidth: 1,
                    borderColor: currentTheme.colors.glass.border,
                }}
            >
                {Platform.OS === "ios" ? (
                    <BlurView
                        intensity={20}
                        tint="dark"
                        style={{ overflow: "hidden" }}
                    >
                        {children}
                    </BlurView>
                ) : (
                    <View
                        style={{
                            backgroundColor: currentTheme.colors.glass.light,
                        }}
                    >
                        {children}
                    </View>
                )}
            </View>
        </Animated.View>
    );
};

export default function SettingsScreen() {
    const router = useRouter();
    const { user, isAuthenticated, logout } = useAuth();
    const { currentTheme, themeName, setTheme, availableThemes } = useTheme();
    const { settings, hasPermission, toggleNotifications, requestPermissions } =
        useNotifications();

    const [notificationsEnabled, setNotificationsEnabled] = useState(
        settings.enabled
    );

    const handleNotificationToggle = async (value: boolean) => {
        if (value && !hasPermission) {
            const granted = await requestPermissions();
            if (!granted) {
                Alert.alert(
                    "Permission Required",
                    "Please enable notifications in your device settings."
                );
                return;
            }
        }
        setNotificationsEnabled(value);
        await toggleNotifications(value);
    };

    const handleClearData = () => {
        Alert.alert(
            "Clear Local Data",
            "This will clear all locally stored data including goals, streaks, and settings. Cloud data will be preserved if logged in.",
            [
                { text: "Cancel", style: "cancel" },
                {
                    text: "Clear",
                    style: "destructive",
                    onPress: async () => {
                        const AsyncStorage = (
                            await import("@react-native-async-storage/async-storage")
                        ).default;
                        const keysToRemove = [
                            "@timelens/goals",
                            "@timelens/goals_last_sync",
                            "@timelens/streaks",
                            "@timelens/daily_logs",
                            "@timelens/focus_settings",
                            "@timelens/focus_stats",
                            "@timelens/focus_sessions",
                            "@timelens/persisted_data",
                        ];
                        await AsyncStorage.multiRemove(keysToRemove);
                        Alert.alert("Success", "Local data cleared successfully.");
                    },
                },
            ]
        );
    };

    const handleLogout = () => {
        Alert.alert("Log Out", "Are you sure you want to log out?", [
            { text: "Cancel", style: "cancel" },
            {
                text: "Log Out",
                style: "destructive",
                onPress: logout,
            },
        ]);
    };

    const appVersion = Constants.expoConfig?.version || "1.0.0";

    return (
        <View
            style={{ flex: 1, backgroundColor: currentTheme.colors.background.primary }}
        >
            <AnimatedBackground intensity="subtle" />

            <SafeAreaView style={{ flex: 1 }}>
                <ScrollView
                    style={{ flex: 1 }}
                    showsVerticalScrollIndicator={false}
                    contentContainerStyle={{ paddingBottom: 40, paddingHorizontal: 20 }}
                >
                    {/* Header */}
                    <Animated.View
                        entering={FadeInDown.duration(400)}
                        style={{
                            flexDirection: "row",
                            alignItems: "center",
                            justifyContent: "space-between",
                            paddingVertical: 16,
                        }}
                    >
                        <BackButton onPress={() => router.back()} />
                        <Text
                            style={{
                                color: currentTheme.colors.text.primary,
                                fontWeight: "700",
                                fontSize: 20,
                            }}
                        >
                            Settings
                        </Text>
                        <View style={{ width: 40 }} />
                    </Animated.View>

                    {/* Account Section */}
                    <SettingsSection title="Account" delay={100}>
                        <SettingsItem
                            icon={User}
                            iconColor="#A459FF"
                            title={user?.name || "Guest User"}
                            subtitle={user?.email || "Sign in to sync your data"}
                            showChevron={false}
                        />
                        {isAuthenticated && (
                            <SettingsItem
                                icon={LogOut}
                                iconColor="#FB7185"
                                title="Log Out"
                                onPress={handleLogout}
                                showChevron={false}
                            />
                        )}
                    </SettingsSection>

                    {/* Appearance Section */}
                    <SettingsSection title="Appearance" delay={200}>
                        <View style={{ padding: 16 }}>
                            <View
                                style={{
                                    flexDirection: "row",
                                    alignItems: "center",
                                    marginBottom: 16,
                                }}
                            >
                                <View
                                    style={{
                                        width: 40,
                                        height: 40,
                                        borderRadius: 12,
                                        backgroundColor: `#A459FF20`,
                                        alignItems: "center",
                                        justifyContent: "center",
                                        marginRight: 14,
                                    }}
                                >
                                    <Palette size={20} color="#A459FF" />
                                </View>
                                <Text
                                    style={{
                                        color: currentTheme.colors.text.primary,
                                        fontSize: 16,
                                        fontWeight: "500",
                                    }}
                                >
                                    Theme
                                </Text>
                            </View>
                            <ScrollView
                                horizontal
                                showsHorizontalScrollIndicator={false}
                                contentContainerStyle={{ gap: 10 }}
                            >
                                {Object.keys(availableThemes).map((themeKey) => {
                                    const theme = availableThemes[themeKey];
                                    const isActive = themeName === themeKey;
                                    return (
                                        <TouchableOpacity
                                            key={themeKey}
                                            onPress={() => setTheme(themeKey)}
                                            style={{
                                                flexDirection: "row",
                                                alignItems: "center",
                                                gap: 8,
                                                paddingHorizontal: 14,
                                                paddingVertical: 10,
                                                borderRadius: 16,
                                                backgroundColor: isActive
                                                    ? currentTheme.colors.primary.glow
                                                    : currentTheme.colors.glass.white,
                                                borderWidth: 1,
                                                borderColor: isActive
                                                    ? currentTheme.colors.primary.primary
                                                    : currentTheme.colors.glass.border,
                                            }}
                                            activeOpacity={0.7}
                                        >
                                            <View
                                                style={{
                                                    width: 18,
                                                    height: 18,
                                                    borderRadius: 9,
                                                    backgroundColor: theme.colors.primary.primary,
                                                }}
                                            />
                                            <Text
                                                style={{
                                                    color: isActive
                                                        ? currentTheme.colors.primary.primary
                                                        : currentTheme.colors.text.secondary,
                                                    fontSize: 14,
                                                    fontWeight: isActive ? "600" : "400",
                                                }}
                                            >
                                                {theme.displayName}
                                            </Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </ScrollView>
                        </View>
                    </SettingsSection>

                    {/* Notifications Section */}
                    <SettingsSection title="Notifications" delay={300}>
                        <SettingsItem
                            icon={Bell}
                            iconColor="#FBBF24"
                            title="Push Notifications"
                            subtitle={
                                hasPermission ? "Enabled" : "Permission required"
                            }
                            showChevron={false}
                            rightElement={
                                <Switch
                                    value={notificationsEnabled}
                                    onValueChange={handleNotificationToggle}
                                    trackColor={{
                                        false: currentTheme.colors.glass.light,
                                        true: currentTheme.colors.primary.glow,
                                    }}
                                    thumbColor={
                                        notificationsEnabled
                                            ? currentTheme.colors.primary.primary
                                            : currentTheme.colors.text.tertiary
                                    }
                                />
                            }
                        />
                    </SettingsSection>

                    {/* Quick Access Section */}
                    <SettingsSection title="Quick Access" delay={400}>
                        <SettingsItem
                            icon={Target}
                            iconColor="#22D3EE"
                            title="Goals & Stats"
                            subtitle="View your progress"
                            onPress={() => router.push("/stats")}
                        />
                        <SettingsItem
                            icon={Shield}
                            iconColor="#34D399"
                            title="Focus Mode"
                            subtitle="Start a focus session"
                            onPress={() => router.push("/focus")}
                        />
                    </SettingsSection>

                    {/* Data & Privacy Section */}
                    <SettingsSection title="Data & Privacy" delay={500}>
                        <SettingsItem
                            icon={Trash2}
                            iconColor="#FB7185"
                            title="Clear Local Data"
                            subtitle="Remove cached data"
                            onPress={handleClearData}
                            showChevron={false}
                        />
                    </SettingsSection>

                    {/* About Section */}
                    <SettingsSection title="About" delay={600}>
                        <SettingsItem
                            icon={Moon}
                            iconColor="#A459FF"
                            title="TimeLens"
                            subtitle={`Version ${appVersion}`}
                            showChevron={false}
                        />
                    </SettingsSection>
                </ScrollView>
            </SafeAreaView>
        </View>
    );
}
