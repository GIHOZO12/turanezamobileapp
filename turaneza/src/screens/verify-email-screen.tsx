import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import * as authApi from '@/api/auth';
import { ApiError } from '@/api/client';
import { Button } from '@/components/ui/button';
import { TextField } from '@/components/ui/text-field';
import colors from '@/constants/colors';
import { useAuth } from '@/contexts/auth-context';

export default function VerifyEmailScreen() {
  const router = useRouter();
  const { completeSession } = useAuth();
  const { email } = useLocalSearchParams<{ email: string }>();
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  async function handleVerify() {
    setError(null);
    setIsSubmitting(true);
    try {
   
      await authApi.verifyEmail({ email, code });
      if ((await completeSession(email)) === 'needs-sign-in') {
        router.replace('/sign-in');
      }
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reach the server. Check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleResend() {
    setError(null);
    setResendMessage(null);
    setIsResending(true);
    try {
      await authApi.resendVerificationCode({ email });
      setResendMessage('A new code was sent to your email.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reach the server. Check your connection.');
    } finally {
      setIsResending(false);
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

          <View className="items-center gap-md">
            <View className="h-16 w-16 items-center justify-center rounded-full bg-primary-fixed">
              <MaterialIcons name="mark-email-unread" size={32} color={colors.primary} />
            </View>
            <Text className="text-center font-headline-md text-headline-md text-on-surface">Verify your email</Text>
            <Text className="max-w-[320px] text-center font-body-md text-body-md text-on-surface-variant">
              Enter the 6-digit code we sent to {email}.
            </Text>
          </View>

          <View className="gap-md rounded-lg bg-surface-container-lowest p-md shadow-investment">
            <View className="gap-xs">
              <Text className="font-label-md text-label-md text-on-surface-variant">Verification Code</Text>
              <TextField
                icon="pin"
                placeholder="123456"
                keyboardType="number-pad"
                maxLength={6}
                value={code}
                onChangeText={setCode}
              />
            </View>

            {error && (
              <Text className="rounded-lg bg-error-container px-md py-sm font-label-md text-label-md text-on-error-container">
                {error}
              </Text>
            )}
            {resendMessage && (
              <Text className="rounded-lg bg-secondary-container px-md py-sm font-label-md text-label-md text-on-secondary-container">
                {resendMessage}
              </Text>
            )}

            <Button label="Verify" onPress={handleVerify} loading={isSubmitting} disabled={code.length !== 6} />

            <Pressable onPress={handleResend} disabled={isResending} className="items-center">
              <Text className="font-label-md text-label-md text-primary">
                {isResending ? 'Resending…' : "Didn't get a code? Resend"}
              </Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
