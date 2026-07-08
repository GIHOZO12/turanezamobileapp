import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import * as authApi from '@/api/auth';
import { ApiError } from '@/api/client';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import colors from '@/constants/colors';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSendResetLink() {
    setError(null);
    setIsSubmitting(true);
    try {
      // POST /api/v1/users/password-reset/ always returns 200 regardless of whether the email
      // exists, on purpose (so this can't be used to enumerate registered accounts) — the reset
      // link it emails points at a web URL (FRONTEND_BASE_URL/auth?mode=reset...), not something
      // this app can currently open, so "check your email" is genuinely the end of this flow here.
      await authApi.requestPasswordReset({ email });
      setIsSent(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reach the server. Check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <SafeAreaView className="flex-1 bg-background">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView
          contentContainerClassName="flex-grow justify-center gap-lg px-margin-mobile py-lg"
          keyboardShouldPersistTaps="handled">
          <Pressable
            hitSlop={8}
            onPress={() => router.back()}
            className="absolute left-margin-mobile top-lg h-10 w-10 items-center justify-center rounded-full active:bg-surface-container-high">
            <MaterialIcons name="arrow-back" size={24} color={colors['on-surface']} />
          </Pressable>

          {isSent ? (
            <View className="items-center gap-md">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-secondary-container">
                <MaterialIcons name="mark-email-read" size={32} color={colors['on-secondary-container']} />
              </View>
              <Text className="text-center font-headline-md text-headline-md text-on-surface">Check your email</Text>
              <Text className="max-w-[320px] text-center font-body-md text-body-md text-on-surface-variant">
                We sent a password reset link to {email || 'your email address'}. Follow the link to choose a new
                password.
              </Text>
              <Button label="Back to Sign In" onPress={() => router.back()} className="mt-base w-full" />
            </View>
          ) : (
            <>
              <View className="items-center gap-md">
                <View className="h-16 w-16 items-center justify-center rounded-md bg-primary shadow-investment">
                  <MaterialIcons name="lock-reset" size={32} color={colors['on-primary']} />
                </View>
                <Text className="text-center font-headline-md text-headline-md text-on-surface">
                  Reset your password
                </Text>
                <Text className="max-w-[320px] text-center font-body-md text-body-md text-on-surface-variant">
                  Enter the email tied to your account and we&apos;ll send you a link to reset your password.
                </Text>
              </View>

              <View className="gap-md rounded-lg border border-outline-variant/30 bg-surface-container-lowest p-md shadow-investment">
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

                {error && (
                  <Text className="rounded-lg bg-error-container px-md py-sm font-label-md text-label-md text-on-error-container">
                    {error}
                  </Text>
                )}

                <Button
                  label="Send Reset Link"
                  onPress={handleSendResetLink}
                  loading={isSubmitting}
                  disabled={email.length === 0}
                />

                <Pressable onPress={() => router.back()} className="flex-row flex-wrap justify-center">
                  <Text className="font-body-md text-body-md text-on-surface-variant">Remember your password? </Text>
                  <Text className="font-label-md text-label-md text-primary">Sign in</Text>
                </Pressable>
              </View>
            </>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
