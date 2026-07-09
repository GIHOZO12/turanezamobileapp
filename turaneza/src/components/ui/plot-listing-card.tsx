import { MaterialIcons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

import type { InvestGroup } from '@/api/groups';
import { Button } from '@/components/ui/button';
import colors from '@/constants/colors';
import { cleanText, formatRwf } from '@/lib/format';

/**
 * 'member' covers both the plot's creator and anyone with an approved application — both cases
 * mean "you're already in, go see the group" rather than "apply." 'pending' means an application
 * is in flight (submitted but not yet reviewed). 'none' is everyone else.
 */
export type PlotMembershipStatus = 'member' | 'pending' | 'none';

export function PlotListingCard({
  group,
  currentUserId,
  membershipStatus = 'none',
  onViewDetails,
  onJoin,
}: {
  group: InvestGroup;
  currentUserId?: number;
  membershipStatus?: PlotMembershipStatus;
  onViewDetails?: () => void;
  onJoin?: () => void;
}) {
  const isOwnPlot = currentUserId != null && group.created_by.id === currentUserId;
  const percent = group.funding_progress.percent;

  return (
    <View className="gap-md rounded-lg bg-surface-container-lowest p-5 shadow-investment">
      <View className="flex-row items-start justify-between">
        <Text className="font-label-sm uppercase tracking-widest text-label-sm text-primary">
          {group.plot_location || 'Location not set'}
        </Text>
        <View className="rounded-full bg-secondary-container px-3 py-1">
          <Text className="font-label-sm text-label-sm text-on-secondary-container">
            {isOwnPlot ? 'Your plot' : 'Open for members'}
          </Text>
        </View>
      </View>

      <Text className="font-headline-md text-headline-md text-on-surface">{group.name}</Text>
      {group.description ? (
        <Text className="font-body-md text-body-md text-on-surface-variant" numberOfLines={3}>
          {cleanText(group.description)}
        </Text>
      ) : null}

      <View className="gap-md">
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
        <View className="flex-row gap-md">
          <View className="flex-1 gap-xs">
            <Text className="font-label-sm text-label-sm text-outline">Construction Cost</Text>
            <Text className="font-label-md text-label-md text-on-surface">{formatRwf(group.building_cost)}</Text>
          </View>
          <View className="flex-1 gap-xs">
            <Text className="font-label-sm text-label-sm text-outline">Min Investment</Text>
            <Text className="font-label-md text-label-md text-on-surface">{formatRwf(group.min_investment)}</Text>
          </View>
        </View>
      </View>

      <View className="gap-2">
        <View className="flex-row items-end justify-between">
          <Text className="font-label-md text-label-sm text-on-surface">Contribution progress</Text>
          <Text className="font-label-sm text-label-sm text-on-surface-variant">{percent}%</Text>
        </View>
        <View className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
          <View className="h-full rounded-full bg-success" style={{ width: `${percent}%` }} />
        </View>
        {/* No adjustsFontSizeToFit: formatRwf already keeps this short, and multi-part
            interpolated Text + shrink-to-fit has a known clipping quirk on Android. */}
        <Text className="font-label-sm text-label-sm text-on-surface-variant">
          {formatRwf(group.funding_progress.contributed)} raised of {formatRwf(group.funding_progress.required)}{' '}
          required
        </Text>
      </View>

      <View className="gap-2">
        {membershipStatus === 'member' ? (
          <Button label="View Group" onPress={onViewDetails} />
        ) : (
          <>
            <Button
              label={membershipStatus === 'pending' ? 'Application Pending' : 'Request to Join'}
              onPress={onJoin}
              disabled={membershipStatus === 'pending'}
            />
            <Pressable onPress={onViewDetails} hitSlop={8} className="flex-row items-center justify-center gap-2 py-1">
              <Text className="font-label-md text-label-md text-primary">View Plot Details</Text>
              <MaterialIcons name="arrow-forward" size={16} color={colors.primary} />
            </Pressable>
          </>
        )}
      </View>
    </View>
  );
}
