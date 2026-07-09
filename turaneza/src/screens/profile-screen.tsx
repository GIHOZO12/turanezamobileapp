import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';

import { fetchMe, type UserMe } from '@/api/auth';
import { TopAppBar } from '@/components/ui/top-app-bar';
import colors from '@/constants/colors';
import { BottomTabInset } from '@/constants/layout';
import { useAuth } from '@/contexts/auth-context';
import { getInitials } from '@/lib/format';

function SettingsRow({
  icon,
  title,
  subtitle,
  onPress,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  title: string;
  subtitle: string;
  onPress?: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center justify-between gap-md p-md active:bg-surface-container-high">
      <View className="flex-1 flex-row items-center gap-md">
        <View className="h-10 w-10 items-center justify-center rounded-full bg-surface-container">
          <MaterialIcons name={icon} size={20} color={colors.primary} />
        </View>
        <View className="flex-1">
          <Text className="font-label-md text-label-md text-on-surface">{title}</Text>
          <Text className="font-label-sm text-label-sm text-on-surface-variant">{subtitle}</Text>
        </View>
      </View>
      <MaterialIcons name="chevron-right" size={22} color={colors.outline} />
    </Pressable>
  );
}

export default function ProfileScreen() {
  const router = useRouter();
  const { user: authUser, signOut } = useAuth();
  const [user, setUser] = useState<UserMe | null>(null);
  const [headerHeight, setHeaderHeight] = useState(80);

  // Defining fetchUser doesn't run it — useEffect is what actually calls it once, when this
  // screen first mounts. The empty dependency array (`[]`) means "run once, not on every render."
  useEffect(() => {
    fetchMe()
      .then(setUser)
      .catch((error) => console.error('Error fetching user:', error));
  }, []);

  const displayUser = user ?? authUser;

  function handleLogOut() {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: signOut,
      },
    ]);
  }

  return (
    <View className="flex-1 bg-background">
      <TopAppBar onHeightChange={setHeaderHeight} />

      <ScrollView
        contentContainerClassName="gap-xl px-margin-mobile"
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: BottomTabInset + 24 }}
        showsVerticalScrollIndicator={false}>
        {/* Profile header */}
        <View className="items-center gap-md py-md">
          {/* No avatar/photo field on UserMe (checked users/serializers.py) — initials on a
              solid background is more honest than pointing every user at the same stock photo. */}
          <View className="h-24 w-24 items-center justify-center rounded-full bg-primary shadow-investment">
            <Text className="font-headline-lg text-headline-lg text-on-primary">
              {displayUser ? getInitials(displayUser.full_name) : '…'}
            </Text>
          </View>
          <Text className="font-headline-md text-headline-md text-on-surface">
            {displayUser?.full_name ?? 'Loading...'}
          </Text>
          {displayUser?.is_email_verified ? (
            <View className="flex-row items-center gap-1 rounded-full bg-secondary-container/30 px-3 py-1">
              <MaterialIcons name="verified" size={16} color={colors['on-secondary-container']} />
              <Text className="font-label-sm text-label-sm text-on-secondary-container">Verified</Text>
            </View>
          ) : null}
        </View>

        {/* Account Settings */}
        <View className="gap-sm">
          <Text className="px-2 font-label-md text-label-md text-on-surface-variant">ACCOUNT SETTINGS</Text>
          <View className="divide-y divide-outline-variant/30 overflow-hidden rounded-lg bg-surface-container-lowest shadow-investment p-3">
            {/* Editing profile fields isn't built yet — the backend supports it (PATCH /me/),
                this screen just doesn't have the form yet */}
            <SettingsRow
              icon="person"
              title="Account Info"
              subtitle="View your personal details"
              onPress={() => router.push('/account-info')}
            />
            <SettingsRow icon="security" title="Security" subtitle="Passwords, 2FA, & login methods" onPress={() => {}} />
          </View>
        </View>

        {/* Support */}
        <View className="gap-sm">
          <Text className="px-2 font-label-md text-label-md text-on-surface-variant">SUPPORT</Text>
          <View className="overflow-hidden rounded-lg bg-surface-container-lowest shadow-investment">
            <SettingsRow icon="help" title="Help Center" subtitle="Guides and answers to common questions" onPress={() => {}} />
          </View>
        </View>

        {/* Log Out — local-only (clears app state + stored JWT), doesn't call the real
            POST /logout/ endpoint yet: that's a mutation on an authenticated session, so it hits
            the same CSRF wall as everything else waiting on the backend's /token/ endpoint. */}
        <Pressable
          onPress={handleLogOut}
          className="flex-row items-center justify-center gap-2 rounded-full bg-error/10 py-4 active:bg-error/20">
          <MaterialIcons name="logout" size={20} color={colors.error} />
          <Text className="font-label-md text-label-md text-error">Log Out</Text>
        </Pressable>

        <Text className="text-center font-label-sm text-label-sm text-outline-variant">TURANEZA — Rwanda</Text>
      </ScrollView>
    </View>
  );
}
