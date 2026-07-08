import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ApiError } from '@/api/client';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import colors from '@/constants/colors';
import { useAuth } from '@/contexts/auth-context';

export default function SignInScreen() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSignIn() {
    setError(null);
    setIsSubmitting(true);
    try {
      
      await login(email, password);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reach the server. Check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      {/* KeyboardAvoidingView pushes content up on iOS so the keyboard doesn't cover the
          focused input — Android handles this automatically via `windowSoftInputMode`. */}
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView
          contentContainerClassName="flex-grow justify-center gap-lg px-margin-mobile py-lg"
          keyboardShouldPersistTaps="handled">
          <View className="items-center gap-md">
            <View className="h-16 w-16 items-center justify-center rounded-md bg-primary shadow-investment">
              <MaterialIcons name="corporate-fare" size={32} color={colors['on-primary']} />
            </View>
            <Text className="font-brand text-2xl tracking-wide text-primary">TURANEZA</Text>
            <Text className="max-w-[320px] text-center font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
              Join the future of co-investment in Rwanda
            </Text>
          </View>

<View className="mt-lg gap-md rounded-lg bg-surface-container-lowest p-md shadow-investment">
            <View className="gap-xs">
              <Text className="font-label-md text-label-md text-on-surface-variant">Email Address</Text>
              <TextField
                icon="mail"
                placeholder="name@example.rw"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            <View className="gap-xs">
              <View className="flex-row items-center justify-between">
                <Text className="font-label-md text-label-md text-on-surface-variant">Password</Text>
                <Pressable onPress={() => router.push('/forgot-password')} hitSlop={8}>
                  <Text className="font-label-sm text-label-sm text-primary">Forgot password?</Text>
                </Pressable>
              </View>
              <TextField
                icon="lock"
                isPassword
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
              />
            </View>

            {error && (
              <Text className="rounded-lg bg-error-container px-md py-sm font-label-md text-label-md text-on-error-container">
                {error}
              </Text>
            )}

            <Button label="Sign In" onPress={handleSignIn} loading={isSubmitting} className="mt-base" />

            <View className="flex-row items-center gap-md">
              <View className="h-[1px] flex-1 bg-outline-variant" />
              <Text className="font-label-sm text-label-sm text-on-surface-variant">Or continue with</Text>
              <View className="h-[1px] flex-1 bg-outline-variant" />
            </View>

            {/* The mockup uses Google's multicolor "G" logo image — a single-color icon font
                can't reproduce that, so this is text-only for now; swap in a logo asset later. */}
            <Button label="Google" variant="secondary" onPress={() => {}} />

            <Pressable onPress={() => router.push('/sign-up')} className="flex-row flex-wrap justify-center">
              <Text className="font-body-md text-body-md text-on-surface-variant">Don&apos;t have an account? </Text>
              <Text className="font-label-md text-label-md text-primary">Sign up</Text>
            </Pressable>
          </View>

          
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
