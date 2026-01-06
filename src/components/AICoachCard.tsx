/**
 * AICoachCard - LLM-Powered Coaching Component
 * Displays personalized AI advice with action items
 */

import React, { useState } from "react";
import { View, Text, TouchableOpacity, ActivityIndicator, TextInput, Modal } from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { 
  Sparkles, 
  RefreshCw, 
  ChevronRight, 
  Lightbulb, 
  Zap,
  Settings,
  Wifi,
  WifiOff,
  X,
} from "lucide-react-native";
import Animated, { 
  FadeIn, 
  FadeOut,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  useSharedValue,
  withSequence,
} from "react-native-reanimated";

import { useLLMCoach } from "../hooks/useLLMCoach";
import { GlassCard } from "./GlassCard";

interface AICoachCardProps {
  onActionPress?: (action: string) => void;
}

export const AICoachCard: React.FC<AICoachCardProps> = ({ onActionPress }) => {
  const { 
    advice, 
    actionItems, 
    motivation, 
    isLoading, 
    isOnline, 
    isCached,
    refresh,
    setApiKey,
  } = useLLMCoach();

  const [showSettings, setShowSettings] = useState(false);
  const [apiKeyInput, setApiKeyInput] = useState("");
  const [selectedProvider, setSelectedProvider] = useState<"groq" | "openai">("groq");

  // Pulsing animation for AI indicator
  const pulseValue = useSharedValue(1);
  
  React.useEffect(() => {
    if (isOnline && !isLoading) {
      pulseValue.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
    }
  }, [isOnline, isLoading, pulseValue]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseValue.value }],
  }));

  const handleSaveApiKey = () => {
    if (apiKeyInput.trim()) {
      setApiKey(selectedProvider, apiKeyInput.trim());
      setApiKeyInput("");
      setShowSettings(false);
    }
  };

  return (
    <>
      <GlassCard className="mt-4">
        {/* Header */}
        <View className="flex-row items-center justify-between mb-3">
          <View className="flex-row items-center gap-2">
            <LinearGradient
              colors={["#A459FF", "#1AA0FF"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              className="w-8 h-8 rounded-lg items-center justify-center"
            >
              <Sparkles size={18} color="#FFFFFF" />
            </LinearGradient>
            <View>
              <Text className="text-white font-semibold text-sm">AI Coach</Text>
              <View className="flex-row items-center gap-1">
                {isOnline ? (
                  <>
                    <Animated.View style={pulseStyle}>
                      <View className="w-2 h-2 rounded-full bg-green-400" />
                    </Animated.View>
                    <Text className="text-green-400 text-xs">
                      {isCached ? "Cached" : "Live"}
                    </Text>
                  </>
                ) : (
                  <>
                    <View className="w-2 h-2 rounded-full bg-yellow-400" />
                    <Text className="text-yellow-400 text-xs">Offline</Text>
                  </>
                )}
              </View>
            </View>
          </View>

          <View className="flex-row items-center gap-2">
            {/* Settings Button */}
            <TouchableOpacity
              onPress={() => setShowSettings(true)}
              className="w-8 h-8 rounded-lg bg-white/10 items-center justify-center"
              activeOpacity={0.7}
            >
              <Settings size={16} color="#FFFFFF60" />
            </TouchableOpacity>

            {/* Refresh Button */}
            <TouchableOpacity
              onPress={refresh}
              disabled={isLoading}
              className="w-8 h-8 rounded-lg bg-white/10 items-center justify-center"
              activeOpacity={0.7}
            >
              {isLoading ? (
                <ActivityIndicator size="small" color="#A459FF" />
              ) : (
                <RefreshCw size={16} color="#A459FF" />
              )}
            </TouchableOpacity>
          </View>
        </View>

        {/* Main Advice */}
        <Animated.View 
          entering={FadeIn.duration(300)}
          key={advice}
        >
          <Text className="text-white text-base leading-6 mb-3">
            {advice}
          </Text>
        </Animated.View>

        {/* Action Items */}
        {actionItems.length > 0 && (
          <View className="mt-2 space-y-2">
            {actionItems.map((action, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => onActionPress?.(action)}
                className="flex-row items-center gap-3 bg-white/5 rounded-xl px-3 py-2.5"
                activeOpacity={0.7}
              >
                <View className="w-6 h-6 rounded-full bg-electric-500/20 items-center justify-center">
                  <Lightbulb size={14} color="#1AA0FF" />
                </View>
                <Text className="text-white/80 text-sm flex-1">{action}</Text>
                <ChevronRight size={16} color="#FFFFFF40" />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Motivation */}
        {motivation && (
          <View className="mt-4 flex-row items-center gap-2">
            <Zap size={14} color="#FFAB00" />
            <Text className="text-amber-400/80 text-sm italic">{motivation}</Text>
          </View>
        )}
      </GlassCard>

      {/* Settings Modal */}
      <Modal
        visible={showSettings}
        transparent
        animationType="fade"
        onRequestClose={() => setShowSettings(false)}
      >
        <View className="flex-1 bg-black/70 justify-center px-6">
          <View className="bg-charcoal-800 rounded-2xl p-6">
            {/* Modal Header */}
            <View className="flex-row items-center justify-between mb-6">
              <Text className="text-white text-lg font-bold">AI Coach Settings</Text>
              <TouchableOpacity onPress={() => setShowSettings(false)}>
                <X size={24} color="#FFFFFF60" />
              </TouchableOpacity>
            </View>

            {/* Status */}
            <View className="flex-row items-center gap-2 mb-4">
              {isOnline ? (
                <>
                  <Wifi size={18} color="#00E676" />
                  <Text className="text-green-400">Connected to AI</Text>
                </>
              ) : (
                <>
                  <WifiOff size={18} color="#FFAB00" />
                  <Text className="text-yellow-400">Using offline mode</Text>
                </>
              )}
            </View>

            {/* Provider Selection */}
            <Text className="text-white/60 text-sm mb-2">Select Provider:</Text>
            <View className="flex-row gap-3 mb-4">
              <TouchableOpacity
                onPress={() => setSelectedProvider("groq")}
                className={`flex-1 py-3 rounded-xl items-center ${
                  selectedProvider === "groq" 
                    ? "bg-violet-500/30 border border-violet-500" 
                    : "bg-white/10"
                }`}
              >
                <Text className={selectedProvider === "groq" ? "text-violet-400" : "text-white/60"}>
                  Groq (Free)
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setSelectedProvider("openai")}
                className={`flex-1 py-3 rounded-xl items-center ${
                  selectedProvider === "openai" 
                    ? "bg-green-500/30 border border-green-500" 
                    : "bg-white/10"
                }`}
              >
                <Text className={selectedProvider === "openai" ? "text-green-400" : "text-white/60"}>
                  OpenAI
                </Text>
              </TouchableOpacity>
            </View>

            {/* API Key Input */}
            <Text className="text-white/60 text-sm mb-2">
              {selectedProvider === "groq" 
                ? "Groq API Key (console.groq.com):" 
                : "OpenAI API Key:"}
            </Text>
            <TextInput
              value={apiKeyInput}
              onChangeText={setApiKeyInput}
              placeholder="Enter your API key..."
              placeholderTextColor="#FFFFFF40"
              secureTextEntry
              className="bg-white/10 rounded-xl px-4 py-3 text-white mb-4"
            />

            {/* Save Button */}
            <TouchableOpacity
              onPress={handleSaveApiKey}
              className="bg-violet-500 rounded-xl py-3 items-center"
              activeOpacity={0.8}
            >
              <Text className="text-white font-semibold">Save & Connect</Text>
            </TouchableOpacity>

            {/* Info */}
            <Text className="text-white/40 text-xs text-center mt-4">
              Get a free API key from console.groq.com{"\n"}
              Your key is stored locally on your device.
            </Text>
          </View>
        </View>
      </Modal>
    </>
  );
};

export default AICoachCard;
