import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { submitGroupApplication, type GroupApplicationPayload, type PickedFile } from '@/api/applications';
import { ApiError } from '@/api/client';
import { fetchInvestGroup, sendPreJoinMessage, type InvestGroup } from '@/api/groups';
import { Button } from '@/components/ui/button';
import { CheckboxRow } from '@/components/ui/checkbox-row';
import { ChipSelect } from '@/components/ui/chip-select';
import { FilePickerField } from '@/components/ui/file-picker-field';
import { TextField } from '@/components/ui/text-field';
import colors from '@/constants/colors';
import { useAuth } from '@/contexts/auth-context';

type FormState = Omit<GroupApplicationPayload, 'group'>;

const MOTIVATION_MAX = 600;

function makeDefaults(fullName?: string, email?: string, phone?: string): FormState {
  return {
    name: fullName ?? '',
    email: email ?? '',
    phone_number: phone ?? '',
    location: '',
    id_number: '',
    occupation: 'employee',
    motivation: '',
    skills: '',
    has_experience: false,
    financial_ready: false,
    understands_commitment: false,
    commitment_confirmation: false,
    notes: '',
    consent_acknowledged: false,
  };
}

function SectionLabel({ children }: { children: string }) {
  return <Text className="font-label-sm uppercase tracking-widest text-label-sm text-primary">{children}</Text>;
}

export default function GroupApplicationScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [group, setGroup] = useState<InvestGroup | null>(null);
  const [form, setForm] = useState<FormState>(() => makeDefaults(user?.full_name, user?.email, user?.phone));
  const [proofOfFunds, setProofOfFunds] = useState<PickedFile | null>(null);
  const [criminalRecord, setCriminalRecord] = useState<PickedFile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [clarityMessage, setClarityMessage] = useState('');
  const [isSendingClarity, setIsSendingClarity] = useState(false);
  const [clarityStatus, setClarityStatus] = useState<string | null>(null);

  useEffect(() => {
    fetchInvestGroup(id).then(setGroup).catch(() => {});
  }, [id]);

  function set<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  const canSubmit =
    form.name.length > 0 && form.phone_number.length > 0 && form.location.length > 0 && form.id_number.length > 0 && form.consent_acknowledged;

  async function handleSubmit() {
    setError(null);
    setIsSubmitting(true);
    try {
      const application = await submitGroupApplication(
        { ...form, group: Number(id) },
        { proofOfFunds: proofOfFunds ?? undefined, criminalRecord: criminalRecord ?? undefined }
      );
      // Mirrors the web app: after the application is created, the next step is paying the
      // commitment fee, not a static "thanks" screen — router.replace so the back button from
      // the payment screen doesn't return to this now-submitted form.
      router.replace({ pathname: '/applications/[id]/pay-commitment-fee', params: { id: String(application.id) } });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Could not reach the server. Check your connection.');
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleSendClarity() {
    if (!group || clarityMessage.trim().length === 0) return;
    setIsSendingClarity(true);
    setClarityStatus(null);
    try {
      await sendPreJoinMessage({ groupId: group.id, recipientId: group.created_by.id, body: clarityMessage.trim() });
      setClarityMessage('');
      setClarityStatus('Message sent.');
    } catch (err) {
      setClarityStatus(err instanceof ApiError ? err.message : 'Could not send your message.');
    } finally {
      setIsSendingClarity(false);
    }
  }

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
          {group ? `Join ${group.name}` : 'Request to Join'}
        </Text>
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} className="flex-1">
        <ScrollView contentContainerClassName="gap-xl px-margin-mobile pb-lg" keyboardShouldPersistTaps="handled">
          <View className="gap-md rounded-lg bg-surface-container-lowest p-md shadow-investment">
            <View className="gap-xs">
              <Text className="font-label-md text-label-md text-on-surface-variant">Full Name</Text>
              <TextField icon="person" value={form.name} onChangeText={(v) => set('name', v)} />
            </View>
            <View className="gap-xs">
              <Text className="font-label-md text-label-md text-on-surface-variant">Email</Text>
              <TextField
                icon="mail"
                keyboardType="email-address"
                autoCapitalize="none"
                value={form.email}
                onChangeText={(v) => set('email', v)}
              />
            </View>
            <View className="gap-xs">
              <Text className="font-label-md text-label-md text-on-surface-variant">Phone Number</Text>
              <TextField
                icon="call"
                keyboardType="phone-pad"
                value={form.phone_number}
                onChangeText={(v) => set('phone_number', v)}
              />
            </View>
            <View className="gap-xs">
              <Text className="font-label-md text-label-md text-on-surface-variant">Location / City</Text>
              <TextField
                icon="location-on"
                placeholder="Kigali, Rwanda"
                value={form.location}
                onChangeText={(v) => set('location', v)}
              />
            </View>
            <View className="gap-xs">
              <Text className="font-label-md text-label-md text-on-surface-variant">National ID / Passport</Text>
              <TextField icon="badge" value={form.id_number} onChangeText={(v) => set('id_number', v)} />
            </View>
            <View className="gap-xs">
              <Text className="font-label-md text-label-md text-on-surface-variant">Occupation</Text>
              <ChipSelect
                value={form.occupation}
                onChange={(v) => set('occupation', v)}
                options={[
                  { value: 'employee', label: 'Employee' },
                  { value: 'entrepreneur', label: 'Entrepreneur' },
                  { value: 'student', label: 'Student' },
                  { value: 'none', label: 'No Occupation' },
                  { value: 'other', label: 'Other' },
                ]}
              />
            </View>
          </View>

          <View className="gap-md rounded-lg bg-surface-container-lowest p-md shadow-investment">
            <View className="gap-xs my-md">
              <SectionLabel>Why this group?</SectionLabel>
              <TextField
                icon="lightbulb"
                multiline
                numberOfLines={3}
                maxLength={MOTIVATION_MAX}
                placeholder="Describe your investment focus, capital readiness, or the impact you want to achieve with the group."
                value={form.motivation}
                onChangeText={(v) => set('motivation', v)}
              />
              <Text className="text-[12px] text-on-surface-variant">
                {form.motivation.length}/{MOTIVATION_MAX} characters
              </Text>
            </View>
            
          </View>

          

         <View className="my-md gap-md rounded-lg bg-surface-container-lowest p-md shadow-investment">
  <CheckboxRow 
    label="I confirm the above information is accurate and grant Turaneza permission to contact me regarding onboarding, compliance, and investment opportunities." 
    value={form.consent_acknowledged} 
    onChange={(v) => set('consent_acknowledged', v)} 
  />
</View>


          {error && (
            <Text className="rounded-lg bg-error-container px-md py-sm font-label-md text-label-md text-on-error-container">
              {error}
            </Text>
          )}

          <View className="flex-row gap-md">

            <Button
              label="Submit Application"
              onPress={handleSubmit}
              loading={isSubmitting}
              disabled={!canSubmit}
              className="flex-1"
            />
          </View>

          {group ? (
            <View className="gap-md rounded-lg bg-surface-container-lowest p-md shadow-investment">
              <Text className="font-headline-md text-headline-md text-on-surface">Have a question first?</Text>
              <Text className="font-body-md text-body-md text-on-surface-variant">

              </Text>
              <TextField
                icon="chat"
                multiline
                numberOfLines={2}
                placeholder="Ask about timelines, terms, or anything else..."
                value={clarityMessage}
                onChangeText={setClarityMessage}
              />
              {clarityStatus && <Text className="font-label-sm text-label-sm text-secondary">{clarityStatus}</Text>}
              <Button
                label="Send Message"
                variant="secondary"
                onPress={handleSendClarity}
                loading={isSendingClarity}
                disabled={clarityMessage.trim().length === 0}
              />
            </View>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
