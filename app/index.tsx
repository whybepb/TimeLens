import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";

const ONBOARDING_COMPLETE_KEY = "@timelens/onboarding_complete";

export default function Index() {
  const [isLoading, setIsLoading] = useState(true);
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  useEffect(() => {
    checkOnboardingStatus();
  }, []);

  const checkOnboardingStatus = async () => {
    try {
      // TODO: Check if onboarding has been completed
      // For now, always show onboarding
      // const completed = await AsyncStorage.getItem(ONBOARDING_COMPLETE_KEY);
      // setHasCompletedOnboarding(completed === "true");
      setHasCompletedOnboarding(false);
    } catch (error) {
      console.error("Error checking onboarding status:", error);
      setHasCompletedOnboarding(false);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <View className="flex-1 bg-charcoal-900 items-center justify-center">
        <ActivityIndicator size="large" color="#1AA0FF" />
      </View>
    );
  }

  // Redirect based on onboarding status
  if (hasCompletedOnboarding) {
    return <Redirect href="/dashboard" />;
  }

  return <Redirect href="/onboarding" />;
}
