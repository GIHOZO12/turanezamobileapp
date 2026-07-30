import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

import { fetchGroupApplication, submitCommitmentFeeProof, type GroupApplication, type PickedFile } from '@/api/applications';
import { ApiError } from '@/api/client';
import { fetchInvestGroup } from '@/api/groups';
import { Button } from '@/components/ui/button';
import { FilePickerField } from '@/components/ui/file-picker-field';
import colors from '@/constants/colors';
import { formatRwf } from '@/lib/format';

/**
 * A step card with a big centered icon badge, bold title, and prominent value — the "Dial MoMo" /
 * "Merchant Code" layout from the reference product's commitment-fee page.
 */
function PaymentStepCard({
  icon,
  iconColor,
  iconBg,
  title,
  value,
  valueColor,
  caption,
}: {
  icon: keyof typeof MaterialIcons.glyphMap;
  iconColor: string;
  iconBg: string;
  title: string;
  value: string;
  valueColor: string;
  caption: string;
}) {
  return (
    <View className="items-center gap-2 rounded-lg bg-surface-container-lowest p-lg shadow-investment">
      <View className="h-14 w-14 items-center justify-center rounded-full" style={{ backgroundColor: iconBg }}>
        <MaterialIcons name={icon} size={26} color={iconColor} />
      </View>
      <Text className="font-headline-md text-headline-md text-on-surface">{title}</Text>
      <Text className="font-headline-lg text-headline-lg" style={{ color: valueColor }}>
        {value}
      </Text>
      <Text className="text-center font-body-md text-body-md text-on-surface-variant">{caption}</Text>
    </View>
  );
}

export default function PayCommitmentFeeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [application, setApplication] = useState<GroupApplication | null>(null);
  const [groupName, setGroupName] = useState<string | null>(null);
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

        if (data.group != null) {
          fetchInvestGroup(data.group)
            .then((group) => setGroupName(group.name))
            .catch(() => {});
        }
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
        <Text className="font-headline-md text-headline-md text-primary">TURANEZA</Text>
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
          contentContainerClassName="gap-xl px-margin-mobile"
          contentContainerStyle={{ paddingBottom: insets.bottom + 40 }}
          showsVerticalScrollIndicator={false}>
          <View className="gap-sm pt-sm">
            <Text className="font-headline-editorial text-headline-editorial text-primary">Commitment Fee</Text>
            <Text className="font-body-editorial text-body-editorial text-on-surface-variant">
              To secure your investment slot{groupName ? ' in the ' : ''}
              {groupName ? <Text className="font-headline-editorial text-body-editorial text-on-surface">{groupName}</Text> : ''}
              , please complete the commitment fee payment below.
            </Text>
          </View>

          <PaymentStepCard
            icon="smartphone"
            iconColor={colors['on-primary']}
            iconBg={colors.primary}
            title="Dial MoMo"
            value="Dial *182*8*1*momo code#"
            valueColor={colors.primary}
            caption="Open your phone dialer and enter the shortcode."
          />

          <PaymentStepCard
            icon="storefront"
            iconColor={colors['on-secondary']}
            iconBg={colors.secondary}
            title="Momo Code"
            value={application.momo_payment_code}
            valueColor={colors.secondary}
            caption="Select 'Pay Merchant' and enter the code."
          />

          <View className="flex-row items-center gap-4 rounded-lg bg-surface-container-lowest p-lg shadow-investment">
            <View
              className="h-14 w-14 items-center justify-center rounded-full"
              style={{ backgroundColor: colors['tertiary-fixed'] }}>
              <MaterialIcons name="credit-card" size={26} color={colors.tertiary} />
            </View>
            <View className="flex-1 gap-1">
              <Text className="font-label-md text-label-md text-on-surface-variant">Total Amount</Text>
              <Text className="font-headline-lg text-headline-lg text-on-surface">
                {formatRwf(application.commitment_fee_amount_rwf)}
              </Text>
            </View>
            <View className="rounded-full bg-secondary-container px-3 py-1">
              <Text className="font-label-sm uppercase tracking-wider text-label-sm text-on-secondary-container">
                Fixed Fee
              </Text>
            </View>
          </View>

          <View className="gap-md rounded-lg bg-surface-container-lowest p-md shadow-investment">
            <Text className="font-headline-md text-headline-md text-on-surface">Upload Proof of Payment</Text>
            <FilePickerField
              value={proof}
              onChange={setProof}
              accept={['image/*']}
              uploadLabel="Upload Payment Screenshot"
              helperText="Screenshot of your Mobile Money confirmation."
            />
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
