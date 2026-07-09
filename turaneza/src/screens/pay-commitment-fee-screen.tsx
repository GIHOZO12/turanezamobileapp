import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchGroupApplication, submitCommitmentFeeProof, type GroupApplication, type PickedFile } from '@/api/applications';
import { ApiError } from '@/api/client';
import { Button } from '@/components/ui/button';
import { FilePickerField } from '@/components/ui/file-picker-field';
import colors from '@/constants/colors';
import { formatRwf } from '@/lib/format';

const STEPS = [
  'Dial *182*8*1# or open your Mobile Money app.',
  'Enter the merchant code below when prompted.',
  'Enter the exact commitment fee amount and confirm.',
  'Take a screenshot of the confirmation and upload it here.',
];

function PaymentDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <View className="flex-row items-center justify-between rounded-lg bg-on-primary-container/10 px-md py-sm">
      <Text className="font-label-md text-label-md text-on-primary-container/80">{label}</Text>
      <Text className="font-headline-md text-headline-md text-on-primary-container">{value}</Text>
    </View>
  );
}

export default function PayCommitmentFeeScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [application, setApplication] = useState<GroupApplication | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [proof, setProof] = useState<PickedFile | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    fetchGroupApplication(id)
      .then((data) => {
        setApplication(data);
        if (data.commitment_fee_proof) setIsSubmitted(true);
      })
      .catch((err) => setLoadError(err instanceof ApiError ? err.message : 'Could not reach the server. Check your connection.'))
      .finally(() => setIsLoading(false));
  }, [id]);

  async function handleSubmit() {
    if (!proof) return;
    setSubmitError(null);
    setIsSubmitting(true);
    try {
      const updated = await submitCommitmentFeeProof(Number(id), proof);
      setApplication(updated);
      setIsSubmitted(true);
    } catch (err) {
      setSubmitError(err instanceof ApiError ? err.message : 'Could not reach the server. Check your connection.');
    } finally {
      setIsSubmitting(false);
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
        <Text className="font-headline-md text-headline-md text-primary">Pay Commitment Fee</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator className="py-lg" color={colors.primary} />
      ) : loadError || !application ? (
        <Text className="mx-margin-mobile rounded-lg bg-error-container px-md py-sm text-center font-label-md text-label-md text-on-error-container">
          {loadError ?? 'Application not found.'}
        </Text>
      ) : isSubmitted ? (
        <View className="flex-1 items-center justify-center gap-md px-margin-mobile">
          <View className="h-16 w-16 items-center justify-center rounded-full bg-secondary-container">
            <MaterialIcons name="check-circle" size={32} color={colors['on-secondary-container']} />
          </View>
          <Text className="text-center font-headline-md text-headline-md text-on-surface">Payment proof submitted</Text>
          <Text className="max-w-[320px] text-center font-body-md text-body-md text-on-surface-variant">
            Our team will confirm your payment and review your application. You&apos;ll be notified once it&apos;s
            approved.
          </Text>
          <Button label="Done" onPress={() => router.replace('/plots')} className="mt-base w-full" />
        </View>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-xl px-margin-mobile pb-lg"
          showsVerticalScrollIndicator={false}>
          <View className="gap-md rounded-lg bg-primary p-md shadow-investment">
            <Text className="font-headline-md text-headline-md text-on-primary">Commitment Fee Payment</Text>
            <PaymentDetailRow label="Merchant Code" value={application.momo_payment_code} />
            <PaymentDetailRow label="Amount" value={formatRwf(application.commitment_fee_amount_rwf)} />
          </View>

          <View className="gap-md rounded-lg bg-surface-container-lowest p-md shadow-investment">
            <Text className="font-headline-md text-headline-md text-on-surface">How to Pay</Text>
            <View className="gap-sm">
              {STEPS.map((step, index) => (
                <View key={step} className="flex-row items-start gap-3">
                  <View className="mt-[1px] h-6 w-6 items-center justify-center rounded-full bg-primary/10">
                    <Text className="font-label-sm text-label-sm text-primary">{index + 1}</Text>
                  </View>
                  <Text className="flex-1 font-body-md text-body-md text-on-surface-variant">{step}</Text>
                </View>
              ))}
            </View>
          </View>

          <View className="gap-md rounded-lg bg-surface-container-lowest p-md shadow-investment">
            <Text className="font-headline-md text-headline-md text-on-surface">Upload Proof of Payment</Text>
            <FilePickerField value={proof} onChange={setProof} helperText="Screenshot of your Mobile Money confirmation." />
          </View>

          {submitError && (
            <Text className="rounded-lg bg-error-container px-md py-sm font-label-md text-label-md text-on-error-container">
              {submitError}
            </Text>
          )}

          <Button
            label="Submit Payment Proof"
            onPress={handleSubmit}
            loading={isSubmitting}
            disabled={!proof}
            className="w-full"
          />
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
