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

export default function SignUpScreen() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canSubmit = fullName.length > 0 && email.length > 0 && password.length > 0 && password === confirmPassword;

  async function handleSignUp() {
    setError(null);
    setIsSubmitting(true);
    try {
      // POST /api/v1/users/signup/ creates the account but does NOT log in yet — the backend
      // emails a 6-digit code and requires POST /verify/ before a session exists. That's a real
      // design decision on the backend's part (unverified emails can't log in), not something
      // we're choosing to add — so the sign-up flow has to be two screens, not one.
      await authApi.signup({ fullName, email, password });
      router.push({ pathname: '/verify-email', params: { email } });
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
          contentContainerClassName="flex-grow gap-lg px-margin-mobile py-lg"
          keyboardShouldPersistTaps="handled">
          <Pressable
            hitSlop={8}
            onPress={() => router.back()}
            className="h-10 w-10 items-center justify-center rounded-full active:bg-surface-container-high">
            <MaterialIcons name="arrow-back" size={24} color={colors['on-surface']} />
          </Pressable>

          <View className="items-center gap-md">
            <View className="h-16 w-16 items-center justify-center rounded-md bg-primary shadow-investment">
              <MaterialIcons name="corporate-fare" size={32} color={colors['on-primary']} />
            </View>
            <Text className="font-brand text-2xl tracking-wide text-primary">TURANEZA</Text>
            <Text className="max-w-[320px] text-center font-headline-lg-mobile text-headline-lg-mobile text-on-surface">
              Create your account
            </Text>
          </View>
<View className="gap-md rounded-lg bg-surface-container-lowest p-md shadow-investment">
            <View className="gap-xs">
              <Text className="font-label-md text-label-md text-on-surface-variant">Full Name</Text>
              <TextField icon="person" placeholder="Jean Mugisha" autoCapitalize="words" value={fullName} onChangeText={setFullName} />
            </View>

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
              <Text className="font-label-md text-label-md text-on-surface-variant">Password</Text>
              <TextField icon="lock" isPassword placeholder="••••••••" value={password} onChangeText={setPassword} />
            </View>

            <View className="gap-xs">
              <Text className="font-label-md text-label-md text-on-surface-variant">Confirm Password</Text>
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

            <Button
              label="Create Account"
              onPress={handleSignUp}
              loading={isSubmitting}
              disabled={!canSubmit}
              className="mt-base"
            />

            <View className="flex-row items-center gap-md">
              <View className="h-[1px] flex-1 bg-outline-variant" />
              <Text className="font-label-sm text-label-sm text-on-surface-variant">Or continue with</Text>
              <View className="h-[1px] flex-1 bg-outline-variant" />
            </View>

            <Button label="Google" variant="secondary" onPress={() => {}} />

            <Pressable onPress={() => router.back()} className="flex-row flex-wrap justify-center">
              <Text className="font-body-md text-body-md text-on-surface-variant">Already have an account? </Text>
              <Text className="font-label-md text-label-md text-primary">Sign in</Text>
            </Pressable>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
