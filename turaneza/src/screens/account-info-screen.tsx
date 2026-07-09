import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchMe, type UserMe } from '@/api/auth';
import { ApiError } from '@/api/client';
import colors from '@/constants/colors';
import { getInitials } from '@/lib/format';

function InfoRow({
  icon,
  label,
  value,
  valueColor,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  label: string;
  value: string;
  valueColor?: string;
}) {
  return (
    <View className="flex-row items-center gap-md py-sm">
      <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-container">
        <MaterialIcons name={icon} size={18} color={colors.primary} />
      </View>
      <View className="flex-1">
        <Text className="font-label-sm uppercase tracking-widest text-label-sm text-outline">{label}</Text>
        <Text
          className="font-label-md text-label-md text-on-surface"
          style={valueColor ? { color: valueColor } : undefined}
          numberOfLines={1}>
          {value}
        </Text>
      </View>
    </View>
  );
}

function StatusBadge({ label, positive }: { label: string; positive: boolean }) {
  return (
    <View
      className="flex-row items-center gap-1 rounded-full px-3 py-1"
      style={{ backgroundColor: positive ? `${colors.secondary}1A` : `${colors.error}1A` }}>
      <MaterialIcons
        name={positive ? 'check-circle' : 'cancel'}
        size={14}
        color={positive ? colors.secondary : colors.error}
      />
      <Text className="font-label-sm text-label-sm" style={{ color: positive ? colors.secondary : colors.error }}>
        {label}
      </Text>
    </View>
  );
}

const ROLE_LABELS: Record<string, string> = {
  member: 'Member',
  admin: 'Administrator',
  staff: 'Staff',
};

export default function AccountInfoScreen() {
  const router = useRouter();
  const [user, setUser] = useState<UserMe | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchMe()
      .then(setUser)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not reach the server. Check your connection.'))
      .finally(() => setIsLoading(false));
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-background" edges={['top']}>
      <View className="flex-row items-center gap-4 px-margin-mobile py-4">
        <Pressable
          hitSlop={8}
          onPress={() => router.back()}
          className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-container-high">
          <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
        </Pressable>
        <Text className="font-headline-md text-headline-md text-primary">Account Info</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator className="py-lg" color={colors.primary} />
      ) : error || !user ? (
        <Text className="mx-margin-mobile rounded-lg bg-error-container px-md py-sm text-center font-label-md text-label-md text-on-error-container">
          {error ?? 'Could not load your account.'}
        </Text>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-lg px-margin-mobile pb-lg"
          showsVerticalScrollIndicator={false}>
          <View className="items-center gap-sm py-md">
            <View className="h-24 w-24 items-center justify-center rounded-full bg-primary shadow-investment">
              <Text className="font-headline-lg text-headline-lg text-on-primary">{getInitials(user.full_name)}</Text>
            </View>
            <Text className="font-headline-md text-headline-md text-on-surface">{user.full_name}</Text>
            <View className="flex-row gap-2">
              <StatusBadge label={user.is_email_verified ? 'Email Verified' : 'Email Unverified'} positive={user.is_email_verified} />
              <StatusBadge label={user.deposit_paid ? 'Deposit Paid' : 'Deposit Pending'} positive={user.deposit_paid} />
            </View>
          </View>

          <View className="gap-1 divide-y divide-outline-variant/30 rounded-lg bg-surface-container-lowest p-md shadow-investment">
            <Text className="pb-1 font-label-sm uppercase tracking-widest text-label-sm text-primary">
              Contact Details
            </Text>
            <InfoRow icon="mail" label="Email" value={user.email} />
            <InfoRow icon="call" label="Phone" value={user.phone ? `${user.country_code}${user.phone}` : 'Not set'} />
          </View>

          <View className="gap-1 divide-y divide-outline-variant/30 rounded-lg bg-surface-container-lowest p-md shadow-investment">
            <Text className="pb-1 font-label-sm uppercase tracking-widest text-label-sm text-primary">
              Account Status
            </Text>
            <InfoRow icon="badge" label="Role" value={ROLE_LABELS[user.role] ?? user.role} />
            <InfoRow
              icon="verified-user"
              label="Verification Status"
              value={user.verification.charAt(0).toUpperCase() + user.verification.slice(1)}
              valueColor={user.verification === 'verified' ? colors.secondary : colors.outline}
            />
            <InfoRow icon="security" label="Two-Factor Authentication" value={user.twofa_enabled ? 'Enabled' : 'Disabled'} />
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
