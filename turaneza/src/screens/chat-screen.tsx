import { Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Placeholder — replaced once the Group Chat flow (stitch_turaneza_co_investment_platform/group_chat) is wired up.
export default function ChatScreen() {
  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background">
      <View className="items-center gap-base px-margin-mobile">
        <Text className="font-headline-md text-headline-md text-on-surface">Chat</Text>
        <Text className="text-center font-body-md text-body-md text-on-surface-variant">Coming soon.</Text>
      </View>
    </SafeAreaView>
  );
}
