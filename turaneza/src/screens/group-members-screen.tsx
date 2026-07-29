import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/api/client';
import { fetchGroupMembers, type GroupMembership } from '@/api/groups';
import colors from '@/constants/colors';
import { useAuth } from '@/contexts/auth-context';
import { getInitials } from '@/lib/format';

export default function GroupMembersScreen() {
  const router = useRouter();
  const { id, name } = useLocalSearchParams<{ id: string; name?: string }>();
  const { user } = useAuth();
  const [members, setMembers] = useState<GroupMembership[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchGroupMembers(id)
      .then((data) => setMembers(data.results.filter((m) => m.status === 'active' && m.user.id !== user?.id)))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not reach the server. Check your connection.'))
      .finally(() => setIsLoading(false));
  }, [id, user?.id]);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center gap-4 px-margin-mobile py-4">
        <Pressable
          hitSlop={8}
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-container-high">
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </Pressable>
        <Text className="flex-1 font-headline-md text-headline-md text-primary" numberOfLines={1}>
          {name ? `${name} Members` : 'Group Members'}
        </Text>
      </View>

      {isLoading ? (
        <ActivityIndicator className="py-lg" color={colors.primary} />
      ) : error ? (
        <Text className="mx-margin-mobile rounded-lg bg-error-container px-md py-sm text-center font-label-md text-label-md text-on-error-container">
          {error}
        </Text>
      ) : members.length === 0 ? (
        <View className="flex-1 items-center justify-center gap-md px-margin-mobile">
          <MaterialIcons name="people-outline" size={40} color={colors.outline} />
          <Text className="text-center font-body-md text-body-md text-on-surface-variant">
            No other active members yet.
          </Text>
        </View>
      ) : (
        <ScrollView contentContainerClassName="gap-sm px-margin-mobile pb-lg" showsVerticalScrollIndicator={false}>
          {members.map((membership) => (
            <Pressable
              key={membership.id}
              onPress={() =>
                router.push({
                  pathname: '/chat/[id]',
                  params: { id, recipient: String(membership.user.id), name: membership.user.full_name },
                })
              }
              className="flex-row items-center justify-between rounded-lg bg-surface-container-lowest p-md shadow-investment active:opacity-90">
              <View className="flex-row items-center gap-4">
                <View className="h-11 w-11 items-center justify-center rounded-full bg-primary">
                  <Text className="font-label-md text-label-md text-on-primary">{getInitials(membership.user.full_name)}</Text>
                </View>
                <View>
                  <Text className="font-label-md text-label-md text-on-surface">{membership.user.full_name}</Text>
                  <Text className="font-label-sm text-label-sm text-on-surface-variant">
                    {membership.role === 'admin' ? 'Group Admin' : 'Member'}
                  </Text>
                </View>
              </View>
              <MaterialIcons name="chat-bubble-outline" size={20} color={colors.primary} />
            </Pressable>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
