import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/api/client';
import { fetchDashboard, type InvestmentPlanEntry } from '@/api/dashboard';
import colors from '@/constants/colors';

export default function ChatScreen() {
  const router = useRouter();
  const [groups, setGroups] = useState<InvestmentPlanEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboard()
      .then((data) => setGroups(data.investmentPlan))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not reach the server. Check your connection.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="px-margin-mobile py-4">
        <Text className="font-headline-lg text-headline-lg text-on-background">Chat</Text>
        <Text className="font-body-md text-body-md text-on-surface-variant">
          Discussion threads for groups you&apos;ve joined.
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator className="py-lg" color={colors.primary} />
      ) : error ? (
        <Text className="mx-margin-mobile rounded-lg bg-error-container px-md py-sm text-center font-label-md text-label-md text-on-error-container">
          {error}
        </Text>
      ) : groups.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-md px-margin-mobile">
          <MaterialIcons name="chat" size={40} color={colors.outline} />
          <Text className="text-center font-headline-md text-headline-md text-on-surface">No conversations yet</Text>
          <Text className="text-center font-body-md text-body-md text-on-surface-variant">
            Join an investment group to start chatting with other members.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerClassName="gap-sm px-margin-mobile pb-lg" showsVerticalScrollIndicator={false}>
          {groups.map((group) => (
            <Pressable
              key={group.groupId}
              onPress={() => router.push({ pathname: '/chat/[id]', params: { id: String(group.groupId) } })}
              className="flex-row items-center justify-between rounded-lg bg-surface-container-lowest p-md shadow-investment active:opacity-90">
              <View className="flex-row items-center gap-4">
                <View className="h-12 w-12 items-center justify-center rounded-full bg-primary">
                  <MaterialIcons name="groups" size={22} color={colors['on-primary']} />
                </View>
                <View>
                  <Text className="font-label-md text-label-md text-on-surface">{group.groupName}</Text>
                  <Text className="font-label-sm text-label-sm text-on-surface-variant">Tap to open group chat</Text>
                </View>
              </View>
              <MaterialIcons name="arrow-forward" size={18} color={colors.primary} />
            </Pressable>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
