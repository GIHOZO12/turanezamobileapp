import { useEffect, useState } from 'react';
import { Image, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchMe } from '@/api/auth';
import type { UserMe } from '@/api/auth';

const PLACEHOLDER_AVATAR =
  'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMlMGlEBwL9IGTxlUz_llOTuOYM2U4xZGEKtJrr0dY1iY3WWdpGEwGwhg&s=10';

// Placeholder — replaced by the real Profile Settings screen (stitch_turaneza_co_investment_platform/profile_settings).
export default function ProfileScreen() {
  const [user, setUser] = useState<UserMe | null>(null);

  // Defining fetchUser doesn't run it — useEffect is what actually calls it once, when this
  // screen first mounts. The empty dependency array (`[]`) means "run once, not on every render."
  useEffect(() => {
    fetchMe()
      .then(setUser)
      .catch((error) => console.error('Error fetching user:', error));
  }, []);

  return (
    <SafeAreaView className="flex-1 items-center justify-center bg-background">
      <View className="items-center gap-base px-margin-mobile">
        <Text className="font-headline-md text-headline-md text-on-surface">Profile</Text>
        {/* UserMe has no avatar/photo field yet (checked users/serializers.py) — every user
            gets this same placeholder until the backend adds one. */}
        <Image source={{ uri: PLACEHOLDER_AVATAR }} className="h-20 w-20 rounded-full" resizeMode="cover" />
        <Text className="font-headline-md text-headline-md text-on-surface">
          {user ? user.full_name : 'Loading...'}
        </Text>
      </View>
    </SafeAreaView>
  );
}
