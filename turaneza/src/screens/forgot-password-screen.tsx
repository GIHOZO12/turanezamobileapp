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
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [step, setStep] = useState<'request' | 'confirm' | 'done'>('request');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  async function handleRequestCode() {
    setError(null);
    setIsSubmitting(true);
    try {
      await authApi.requestPasswordReset({ email });
      setStep('confirm');
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
      await authApi.requestPasswordReset({ email });
      setResendMessage('A new code was sent to your email.');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reach the server. Check your connection.');
    } finally {
      setIsResending(false);
    }
  }

  async function handleConfirm() {
    setError(null);
    setIsSubmitting(true);
    try {
      await authApi.confirmPasswordReset({ email, code, password, confirmPassword });
      setStep('done');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reach the server. Check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  }

  const canRequest = email.length > 0;
  const canConfirm = code.length === 6 && password.length > 0 && password === confirmPassword;

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

          {step === 'done' ? (
            <View className="items-center gap-md">
              <View className="h-16 w-16 items-center justify-center rounded-full bg-secondary-container">
                <MaterialIcons name="check-circle" size={32} color={colors['on-secondary-container']} />
              </View>
              <Text className="text-center font-headline-md text-headline-md text-on-surface">Password updated</Text>
              <Text className="max-w-[320px] text-center font-body-md text-body-md text-on-surface-variant">
                Your password has been reset. You can now sign in with your new password.
              </Text>
              <Button label="Back to Sign In" onPress={() => router.back()} className="mt-base w-full" />
            </View>
          ) : step === 'confirm' ? (
            <>
              <View className="items-center gap-md">
                <View className="h-16 w-16 items-center justify-center rounded-full bg-primary-fixed">
                  <MaterialIcons name="mark-email-unread" size={32} color={colors.primary} />
                </View>
                <Text className="text-center font-headline-md text-headline-md text-on-surface">
                  Enter your reset code
                </Text>
                <Text className="max-w-[320px] text-center font-body-md text-body-md text-on-surface-variant">
                  Enter the 6-digit code we sent to {email} and choose a new password. It expires in 10 minutes.
                </Text>
              </View>

              <View className="gap-md rounded-lg bg-surface-container-lowest p-md shadow-investment">
                <View className="gap-xs">
                  <Text className="font-label-md text-label-md text-on-surface-variant">Reset Code</Text>
                  <TextField
                    icon="pin"
                    placeholder="123456"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={code}
                    onChangeText={setCode}
                  />
                </View>

                <View className="gap-xs">
                  <Text className="font-label-md text-label-md text-on-surface-variant">New Password</Text>
                  <TextField icon="lock" isPassword placeholder="••••••••" value={password} onChangeText={setPassword} />
                </View>

                <View className="gap-xs">
                  <Text className="font-label-md text-label-md text-on-surface-variant">Confirm New Password</Text>
                  <TextField
                    icon="lock"
                    isPassword
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
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

                <Button label="Reset Password" onPress={handleConfirm} loading={isSubmitting} disabled={!canConfirm} />

                <Pressable onPress={handleResend} disabled={isResending} className="items-center">
                  <Text className="font-label-md text-label-md text-primary">
                    {isResending ? 'Resending…' : "Didn't get a code? Resend"}
                  </Text>
                </Pressable>
              </View>
            </>
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
                  Enter the email tied to your account and we&apos;ll send you a code to reset your password.
                </Text>
              </View>

              <View className="gap-md rounded-lg bg-surface-container-lowest p-md shadow-investment">
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
                  label="Send Reset Code"
                  onPress={handleRequestCode}
                  loading={isSubmitting}
                  disabled={!canRequest}
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
