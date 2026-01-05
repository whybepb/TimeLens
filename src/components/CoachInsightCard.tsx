import React from "react";
import { View, Text } from "react-native";
import { Sparkles, ArrowRight } from "lucide-react-native";
import { GlassCard } from "./GlassCard";

interface CoachInsightCardProps {
  insight: string;
  actionText?: string;
  onActionPress?: () => void;
}

export const CoachInsightCard: React.FC<CoachInsightCardProps> = ({
  insight,
  actionText,
  onActionPress,
}) => {
  return (
    <GlassCard fullWidth variant="light" className="mt-3">
      <View className="flex-row items-start gap-3">
        <View className="w-10 h-10 rounded-full bg-violet-500/20 items-center justify-center">
          <Sparkles size={20} color="#A459FF" />
        </View>
        <View className="flex-1">
          <Text className="text-white/70 text-xs font-medium mb-1">
            Coach Insight
          </Text>
          <Text className="text-white/90 text-sm leading-5">{insight}</Text>
          {actionText && (
            <View className="flex-row items-center gap-1 mt-2">
              <Text className="text-electric-400 text-xs font-medium">
                {actionText}
              </Text>
              <ArrowRight size={12} color="#1AA0FF" />
            </View>
          )}
        </View>
      </View>
    </GlassCard>
  );
};

export default CoachInsightCard;
