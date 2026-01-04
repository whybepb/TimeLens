import { Text, View } from "react-native";
import { Activity, Zap } from "lucide-react-native";

export default function Index() {
  return (
    <View className="flex-1 justify-center items-center bg-charcoal-900 px-6">
      <View className="items-center mb-8">
        <View className="flex-row items-center gap-2 mb-4">
          <Activity size={40} color="#1AA0FF" />
          <Zap size={32} color="#A459FF" />
        </View>
        <Text className="text-4xl font-bold text-white mb-2">TimeLens</Text>
        <Text className="text-lg text-white/70 text-center">
          Productivity-Vitality Score
        </Text>
      </View>
      <Text className="text-white/50 text-center">
        Track your health & screen time to optimize your day
      </Text>
    </View>
  );
}
