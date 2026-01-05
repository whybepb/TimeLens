import React from "react";
import { View, Text } from "react-native";
import { LucideIcon } from "lucide-react-native";
import { GlassCard } from "./GlassCard";

interface DataItemProps {
  icon: LucideIcon;
  iconColor: string;
  label: string;
  value: string;
  unit?: string;
}

interface DataCardProps {
  title: string;
  titleIcon: LucideIcon;
  titleIconColor: string;
  items: DataItemProps[];
}

export const DataCard: React.FC<DataCardProps> = ({
  title,
  titleIcon: TitleIcon,
  titleIconColor,
  items,
}) => {
  return (
    <GlassCard>
      <View className="flex-row items-center gap-2 mb-3">
        <TitleIcon size={18} color={titleIconColor} />
        <Text className="text-white/70 text-sm font-medium">{title}</Text>
      </View>
      <View className="gap-3">
        {items.map((item, index) => {
          const ItemIcon = item.icon;
          return (
            <View key={index} className="flex-row items-center justify-between">
              <View className="flex-row items-center gap-2">
                <ItemIcon size={16} color={item.iconColor} />
                <Text className="text-white/60 text-xs">{item.label}</Text>
              </View>
              <View className="flex-row items-baseline gap-1">
                <Text className="text-white font-semibold text-lg">{item.value}</Text>
                {item.unit && (
                  <Text className="text-white/40 text-xs">{item.unit}</Text>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </GlassCard>
  );
};

export default DataCard;
