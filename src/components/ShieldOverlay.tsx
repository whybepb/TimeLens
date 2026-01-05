import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
} from "react-native";
import { BlurView } from "expo-blur";
import { SafeAreaView } from "react-native-safe-area-context";
import { Shield, ArrowLeft, Play, Timer } from "lucide-react-native";
import Animated, {
  useSharedValue,
  useAnimatedProps,
  withTiming,
  withSpring,
  FadeIn,
  FadeOut,
  interpolate,
  Easing,
  useAnimatedStyle,
} from "react-native-reanimated";
import Svg, { Circle } from "react-native-svg";

const COUNTDOWN_DURATION = 10; // seconds

interface ShieldOverlayProps {
  visible: boolean;
  appName?: string;
  onProceed: () => void;
  onBackToFocus: () => void;
}

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

export const ShieldOverlay: React.FC<ShieldOverlayProps> = ({
  visible,
  appName = "this app",
  onProceed,
  onBackToFocus,
}) => {
  const [countdown, setCountdown] = useState(COUNTDOWN_DURATION);
  const [showButtons, setShowButtons] = useState(false);

  const progress = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const buttonOpacity = useSharedValue(0);

  // Reset state when overlay becomes visible
  useEffect(() => {
    if (visible) {
      setCountdown(COUNTDOWN_DURATION);
      setShowButtons(false);
      progress.value = 0;
      buttonOpacity.value = 0;

      // Animate progress ring
      progress.value = withTiming(1, {
        duration: COUNTDOWN_DURATION * 1000,
        easing: Easing.linear,
      });

      // Pulse animation for the shield
      const pulseInterval = setInterval(() => {
        pulseScale.value = withSpring(1.1, { damping: 2 }, () => {
          pulseScale.value = withSpring(1, { damping: 5 });
        });
      }, 2000);

      return () => clearInterval(pulseInterval);
    }
  }, [visible, progress, pulseScale, buttonOpacity]);

  // Countdown timer
  useEffect(() => {
    if (!visible) return;

    if (countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowButtons(true);
      buttonOpacity.value = withTiming(1, { duration: 400 });
    }
  }, [visible, countdown, buttonOpacity]);

  const circleRadius = 80;
  const circleCircumference = 2 * Math.PI * circleRadius;

  const animatedProps = useAnimatedProps(() => {
    const strokeDashoffset = interpolate(
      progress.value,
      [0, 1],
      [circleCircumference, 0]
    );
    return {
      strokeDashoffset,
    };
  });

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
  }));

  const buttonContainerStyle = useAnimatedStyle(() => ({
    opacity: buttonOpacity.value,
    transform: [
      {
        translateY: interpolate(buttonOpacity.value, [0, 1], [20, 0]),
      },
    ],
  }));

  const handleProceed = useCallback(() => {
    console.log("[ShieldOverlay] User chose to proceed to:", appName);
    onProceed();
  }, [appName, onProceed]);

  const handleBackToFocus = useCallback(() => {
    console.log("[ShieldOverlay] User chose to return to focus");
    onBackToFocus();
  }, [onBackToFocus]);

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      animationType="fade"
      transparent
      statusBarTranslucent
    >
      <BlurView intensity={90} tint="dark" style={StyleSheet.absoluteFill}>
        <SafeAreaView style={styles.container}>
          <Animated.View
            entering={FadeIn.duration(400)}
            exiting={FadeOut.duration(300)}
            style={styles.content}
          >
            {/* Shield Icon with Pulse */}
            <Animated.View style={[styles.shieldContainer, pulseStyle]}>
              <View style={styles.shieldGlow} />
              <Shield size={48} color="#A459FF" />
            </Animated.View>

            {/* Countdown Ring */}
            <View style={styles.timerContainer}>
              <Svg width={200} height={200} style={styles.progressRing}>
                {/* Background circle */}
                <Circle
                  cx={100}
                  cy={100}
                  r={circleRadius}
                  stroke="rgba(255, 255, 255, 0.1)"
                  strokeWidth={6}
                  fill="transparent"
                />
                {/* Progress circle */}
                <AnimatedCircle
                  cx={100}
                  cy={100}
                  r={circleRadius}
                  stroke="#A459FF"
                  strokeWidth={6}
                  fill="transparent"
                  strokeLinecap="round"
                  strokeDasharray={circleCircumference}
                  animatedProps={animatedProps}
                  transform="rotate(-90, 100, 100)"
                />
              </Svg>

              {/* Countdown number */}
              <View style={styles.countdownCenter}>
                {!showButtons ? (
                  <>
                    <Text style={styles.countdownNumber}>{countdown}</Text>
                    <Text style={styles.countdownLabel}>seconds</Text>
                  </>
                ) : (
                  <Timer size={32} color="#00E676" />
                )}
              </View>
            </View>

            {/* Message */}
            <View style={styles.messageContainer}>
              <Text style={styles.title}>Taking a breath...</Text>
              <Text style={styles.message}>
                Is <Text style={styles.appNameHighlight}>{appName}</Text> worth
                your peak energy?
              </Text>
            </View>

            {/* Mindfulness prompt */}
            {!showButtons && (
              <Animated.View
                entering={FadeIn.delay(500).duration(400)}
                style={styles.promptContainer}
              >
                <Text style={styles.promptText}>
                  💭 Consider what you wanted to accomplish today
                </Text>
              </Animated.View>
            )}

            {/* Buttons - appear after countdown */}
            {showButtons && (
              <Animated.View style={[styles.buttonContainer, buttonContainerStyle]}>
                {/* Back to Focus - Primary action */}
                <TouchableOpacity
                  style={styles.primaryButton}
                  onPress={handleBackToFocus}
                  activeOpacity={0.8}
                >
                  <ArrowLeft size={20} color="#0D0D0F" />
                  <Text style={styles.primaryButtonText}>Back to Focus</Text>
                </TouchableOpacity>

                {/* Proceed anyway - Secondary action */}
                <TouchableOpacity
                  style={styles.secondaryButton}
                  onPress={handleProceed}
                  activeOpacity={0.7}
                >
                  <Play size={16} color="rgba(255,255,255,0.6)" />
                  <Text style={styles.secondaryButtonText}>Proceed anyway</Text>
                </TouchableOpacity>
              </Animated.View>
            )}

            {/* Energy cost indicator */}
            <View style={styles.energyCostContainer}>
              <View style={styles.energyCostBadge}>
                <Text style={styles.energyCostText}>
                  ⚡ Estimated PVC impact: -5 points
                </Text>
              </View>
            </View>
          </Animated.View>
        </SafeAreaView>
      </BlurView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
    paddingHorizontal: 32,
  },
  shieldContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: "rgba(164, 89, 255, 0.15)",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 24,
  },
  shieldGlow: {
    position: "absolute",
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: "rgba(164, 89, 255, 0.1)",
  },
  timerContainer: {
    width: 200,
    height: 200,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 32,
  },
  progressRing: {
    position: "absolute",
  },
  countdownCenter: {
    justifyContent: "center",
    alignItems: "center",
  },
  countdownNumber: {
    fontSize: 64,
    fontWeight: "700",
    color: "#FFFFFF",
  },
  countdownLabel: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.5)",
    marginTop: -4,
  },
  messageContainer: {
    alignItems: "center",
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: "#FFFFFF",
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.7)",
    textAlign: "center",
    lineHeight: 24,
  },
  appNameHighlight: {
    color: "#1AA0FF",
    fontWeight: "600",
  },
  promptContainer: {
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 20,
    marginBottom: 32,
  },
  promptText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
    textAlign: "center",
  },
  buttonContainer: {
    width: "100%",
    gap: 12,
  },
  primaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    backgroundColor: "#00E676",
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 16,
    width: "100%",
  },
  primaryButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0D0D0F",
  },
  secondaryButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    backgroundColor: "rgba(255, 255, 255, 0.08)",
    borderWidth: 1,
    borderColor: "rgba(255, 255, 255, 0.15)",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 16,
    width: "100%",
  },
  secondaryButtonText: {
    fontSize: 14,
    color: "rgba(255, 255, 255, 0.6)",
  },
  energyCostContainer: {
    marginTop: 32,
  },
  energyCostBadge: {
    backgroundColor: "rgba(255, 82, 82, 0.15)",
    borderRadius: 20,
    paddingVertical: 8,
    paddingHorizontal: 16,
  },
  energyCostText: {
    fontSize: 12,
    color: "#FF5252",
  },
});

export default ShieldOverlay;
