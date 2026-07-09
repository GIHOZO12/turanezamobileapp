import { MaterialIcons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { fetchMyApplications, type GroupApplication } from '@/api/applications';
import { fetchGroupDocuments, fetchInvestGroup, type GroupDocument, type InvestGroup } from '@/api/groups';
import { ApiError } from '@/api/client';
import { Button } from '@/components/ui/button';
import colors from '@/constants/colors';
import { useAuth } from '@/contexts/auth-context';
import { cleanText, formatRwf } from '@/lib/format';
import { computeMembershipStatus, indexApplicationsByGroup } from '@/lib/membership';

const DOCUMENT_ICONS: Record<GroupDocument['document_type'], keyof typeof MaterialIcons.glyphMap> = {
  architectural: 'architecture',
  boq: 'inventory',
  legal: 'gavel',
  other: 'description',
};

export default function GroupDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id: string }>();
  const { user } = useAuth();
  const [group, setGroup] = useState<InvestGroup | null>(null);
  const [documents, setDocuments] = useState<GroupDocument[]>([]);
  const [applications, setApplications] = useState<GroupApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    setError(null);
    fetchInvestGroup(id)
      .then(setGroup)
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not reach the server. Check your connection.'))
      .finally(() => setIsLoading(false));

    // Documents are secondary — a non-member legitimately gets an empty list back (server-side
    // access control, see api/groups.ts), so this fails open rather than blocking the page.
    fetchGroupDocuments(id)
      .then((data) => setDocuments(data.results))
      .catch(() => setDocuments([]));

    // Same membership check as the plot list cards — this was missing here entirely before,
    // which is why "Join Group" kept showing up even for the group's own creator/members.
    fetchMyApplications()
      .then((data) => setApplications(data.results))
      .catch(() => {});
  }, [id]);

  const membershipStatus = group ? computeMembershipStatus(group, user?.id, indexApplicationsByGroup(applications)) : 'none';

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
      ) : error || !group ? (
        <Text className="mx-margin-mobile rounded-lg bg-error-container px-md py-sm text-center font-label-md text-label-md text-on-error-container">
          {error ?? 'Plot not found.'}
        </Text>
      ) : (
        <ScrollView
          className="flex-1"
          contentContainerClassName="gap-xl px-margin-mobile py-md pb-lg"
          showsVerticalScrollIndicator={false}>
          {/* Group header */}
          <View className="gap-md rounded-lg bg-surface-container-lowest p-md shadow-investment">
            <View className="flex-row flex-wrap items-center gap-2">
              <View className="rounded-full bg-secondary-container px-3 py-1">
                <Text className="font-label-sm uppercase tracking-wider text-label-sm text-on-secondary-container">
                  {group.status === 'active' ? 'Active Group' : group.status}
                </Text>
              </View>
              {group.plot_location ? (
                <View className="flex-row items-center gap-1">
                  <MaterialIcons name="location-on" size={16} color={colors['on-surface-variant']} />
                  <Text className="font-label-sm text-label-sm text-on-surface-variant">{group.plot_location}</Text>
                </View>
              ) : null}
            </View>
            <Text className="font-headline-lg text-headline-lg text-primary">{group.name}</Text>
            {group.description ? (
              <Text className="font-body-md text-body-md text-on-surface-variant">{cleanText(group.description)}</Text>
            ) : null}
          </View>

          {/* Plot Details — plot_size_sqm/land_registration_status were shown on the list card
              but missing here, and proposed_house_description (what's planned to be built on
              this plot) wasn't displayed anywhere in the app at all until now. */}
          <View className="gap-md rounded-lg bg-surface-container-lowest p-md shadow-investment">
            <Text className="font-headline-md text-headline-md text-on-surface">Plot Details</Text>
            <View className="flex-row gap-md">
              <View className="flex-1 gap-xs">
                <Text className="font-label-sm text-label-sm text-outline">Plot Size</Text>
                <Text className="font-label-md text-label-md text-on-surface">
                  {group.plot_size_sqm ? `${Number(group.plot_size_sqm).toLocaleString()} m²` : 'Not set'}
                </Text>
              </View>
              <View className="flex-1 gap-xs">
                <Text className="font-label-sm text-label-sm text-outline">Land Status</Text>
                <Text className="font-label-md text-label-md text-on-surface">
                  {group.land_registration_status_label || 'Not set'}
                </Text>
              </View>
            </View>
            {group.proposed_house_description ? (
              <View className="gap-xs">
                <Text className="font-label-sm text-label-sm text-outline">Proposed Development</Text>
                <Text className="font-body-md text-body-md text-on-surface-variant">
                  {cleanText(group.proposed_house_description)}
                </Text>
              </View>
            ) : null}
          </View>

        
          <View className="gap-1 rounded-lg bg-primary-container p-md shadow-investment">
            <Text className="font-label-md text-label-md text-on-primary-container/90">Total Group Fund</Text>
            <Text
              className="font-display-lg text-display-lg text-on-primary-container"
              numberOfLines={1}
              adjustsFontSizeToFit>
              {formatRwf(group.funding_progress.contributed)}
            </Text>
            <View className="mt-2 h-2 overflow-hidden rounded-full bg-white/20">
              <View
                className="h-full rounded-full bg-secondary-fixed"
                style={{ width: `${group.funding_progress.percent}%` }}
              />
            </View>
           
            <Text className="mt-1 font-label-sm text-label-sm text-on-primary-container">
              {group.funding_progress.percent}% of {formatRwf(group.funding_progress.required)} Target Goal
            </Text>
          </View>

          {/* Same membership logic as the plot list cards: showing "Join Group" to someone
              who's already the creator or an approved member made no sense — this was hardcoded
              unconditionally before, which is exactly why it kept appearing regardless of status. */}
          <View className="gap-sm rounded-lg bg-surface-container-lowest p-md shadow-investment">
            {membershipStatus === 'member' ? (
              <View className="flex-row items-center justify-center gap-2 self-center rounded-full bg-secondary-container px-4 py-2">
                <MaterialIcons name="check-circle" size={16} color={colors['on-secondary-container']} />
                <Text className="font-label-sm text-label-sm text-on-secondary-container">You&apos;re a member of this group</Text>
              </View>
            ) : (
              <>
                <Text className="text-center font-label-md text-label-md text-on-surface-variant">
                  {membershipStatus === 'pending'
                    ? 'Your application is being reviewed by our team.'
                    : 'Ready to co-invest in this plot? Send a request to join this group.'}
                </Text>
                <Button
                  label={membershipStatus === 'pending' ? 'Application Pending' : 'Request to Join'}
                  onPress={() => router.push({ pathname: '/group/[id]/apply', params: { id } })}
                  disabled={membershipStatus === 'pending'}
                />
              </>
            )}
          </View>

          <Pressable
            onPress={() => {}}
            className="flex-row items-center justify-between rounded-lg bg-surface-container-highest p-sm shadow-investment active:opacity-90">
            <View className="flex-row items-center gap-3">
              <View className="h-11 w-11 items-center justify-center rounded-full bg-primary">
                <MaterialIcons name="chat" size={20} color={colors['on-primary']} />
              </View>
              <View>
                <Text className="font-label-md text-label-md text-on-surface">Group Discussion</Text>
                <Text className="font-label-sm text-label-sm text-on-surface-variant">
                  Chat with {group.members_count} member{group.members_count === 1 ? '' : 's'}
                </Text>
              </View>
            </View>
            <MaterialIcons name="arrow-forward" size={18} color={colors.primary} />
          </Pressable>

          {/* Group Insights — real fields only; the mockup's "Days Left"/"Yield Est." aren't
              modeled on InvestGroup, so this shows what's actually available instead of faking them. */}
          <View className="gap-md rounded-lg bg-primary/5 p-md">
            <Text className="font-label-sm text-label-sm text-primary">Group Insights</Text>
            <View className="gap-md">
              <View className="flex-row gap-md">
                <View className="flex-1 gap-xs">
                  <Text className="text-[12px] text-on-surface-variant">Members</Text>
                  <Text className="font-headline-md text-headline-md text-on-surface">
                    {group.members_count} / {group.max_members}
                  </Text>
                </View>
                <View className="flex-1 gap-xs">
                  <Text className="text-[12px] text-on-surface-variant">Avg. Stake</Text>
                  <Text className="font-headline-md text-headline-md text-on-surface">{formatRwf(group.member_unit_share)}</Text>
                </View>
              </View>
              <View className="flex-row gap-md">
                <View className="flex-1 gap-xs">
                  <Text className="text-[12px] text-on-surface-variant">Min Investment</Text>
                  <Text className="font-headline-md text-headline-md text-on-surface">{formatRwf(group.min_investment)}</Text>
                </View>
                <View className="flex-1 gap-xs">
                  <Text className="text-[12px] text-on-surface-variant">Total Units</Text>
                  <Text className="font-headline-md text-headline-md text-secondary">{group.total_units}</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Documents */}
          <View className="gap-md rounded-lg bg-surface-container-lowest p-md shadow-investment">
            <Text className="font-headline-md text-headline-md text-on-surface">Documents</Text>
            {documents.length === 0 ? (
              <Text className="font-body-md text-body-md text-on-surface-variant">
                No documents shared for this group yet.
              </Text>
            ) : (
              documents.map((doc) => (
                // A subtle background tint separates each row instead of a border line.
                <View
                  key={doc.id}
                  className="flex-row items-center justify-between rounded-lg bg-surface-container-low p-3">
                  <View className="flex-1 flex-row items-center gap-3 pr-2">
                    <View className="h-10 w-10 items-center justify-center rounded bg-primary/10">
                      <MaterialIcons name={DOCUMENT_ICONS[doc.document_type]} size={20} color={colors.primary} />
                    </View>
                    <View className="flex-1">
                      <Text className="font-label-md text-label-md text-on-surface" numberOfLines={1}>
                        {doc.title || 'Untitled document'}
                      </Text>
                      <Text className="text-[12px] text-on-surface-variant">
                        {new Date(doc.uploaded_at).toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                  <MaterialIcons name="download" size={20} color={colors['outline-variant']} />
                </View>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
