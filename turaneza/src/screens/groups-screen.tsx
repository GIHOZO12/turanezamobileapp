import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, View } from 'react-native';

import { ApiError } from '@/api/client';
import { extractRwfAmount, fetchDashboard, type DashboardOverview } from '@/api/dashboard';
import { fetchInvestGroups, type InvestGroup } from '@/api/groups';
import { Button } from '@/components/ui/button';
import { TopAppBar } from '@/components/ui/top-app-bar';
import colors from '@/constants/colors';
import { BottomTabInset } from '@/constants/layout';
import { formatRwf } from '@/lib/format';

export default function GroupsScreen() {
  const router = useRouter();
  const [headerHeight, setHeaderHeight] = useState(80);
  const [dashboard, setDashboard] = useState<DashboardOverview | null>(null);
  const [groups, setGroups] = useState<InvestGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setError(null);
    return Promise.all([fetchDashboard().then(setDashboard), fetchInvestGroups().then((data) => setGroups(data.results))]).catch(
      (err) => setError(err instanceof ApiError ? err.message : 'Could not reach the server. Check your connection.')
    );
  }

  useEffect(() => {
    setIsLoading(true);
    load().finally(() => setIsLoading(false));
  }, []);

  function handleRefresh() {
    setIsRefreshing(true);
    load().finally(() => setIsRefreshing(false));
  }

  // investmentPlan only carries the group's id + installment progress, not its location/
  // description/funding_progress — those come from the full group list, joined here by id.
  const groupsById = useMemo(() => new Map(groups.map((g) => [g.id, g])), [groups]);

  return (
    <View className="flex-1 bg-background">
      <TopAppBar onHeightChange={setHeaderHeight} />

      <ScrollView
        contentContainerClassName="gap-lg px-margin-mobile"
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: BottomTabInset + 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}>
        <View className="gap-1">
          <Text className="font-headline-lg text-headline-lg text-on-background">My Investment Groups</Text>
          <Text className="font-body-md text-body-md text-on-surface-variant">
            Manage your co-investments and track progress across Rwanda&apos;s premium real estate.
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator className="py-lg" color={colors.primary} />
        ) : error ? (
          <Text className="rounded-lg bg-error-container px-md py-sm text-center font-label-md text-label-md text-on-error-container">
            {error}
          </Text>
        ) : (
          <>
            <View className="flex-row gap-md">
              <View className="flex-1 items-center gap-xs rounded-lg bg-primary-container p-md">
                <Text className="font-label-md text-label-md text-on-primary-container/90">Total Invested</Text>
                <Text className="font-headline-md text-headline-md text-on-primary-container">
                  {formatRwf(extractRwfAmount(dashboard?.summary.totalInvested ?? []))}
                </Text>
              </View>
              <View className="flex-1 gap-xs rounded-lg bg-surface-container-lowest p-md shadow-investment">
                <Text className="font-label-md text-label-md text-on-surface-variant">Active Groups</Text>
                <Text className="font-headline-md text-headline-md text-on-surface">
                  {dashboard?.summary.activeGroups ?? 0}
                </Text>
              </View>
            </View>

            {!dashboard || dashboard.investmentPlan.length === 0 ? (
              <View className="items-center gap-md rounded-lg bg-surface-container-lowest p-lg shadow-investment">
                <MaterialIcons name="groups" size={32} color={colors.outline} />
                <Text className="text-center font-headline-md text-headline-md text-on-surface">
                  You haven&apos;t joined any groups yet
                </Text>
                <Text className="text-center font-body-md text-body-md text-on-surface-variant">
                  Browse available plots and request to join a group to start co-investing.
                </Text>
                <Button label="Browse Plots" onPress={() => router.push('/plots')} className="w-full" />
              </View>
            ) : (
              <View className="gap-gutter">
                {dashboard.investmentPlan.map((plan) => {
                  const group = groupsById.get(plan.groupId);
                  const installmentPercent = Math.round((plan.installmentsPaid / plan.installmentsTarget) * 100);
                  return (
                    <View key={plan.groupId} className="gap-md rounded-lg bg-surface-container-lowest p-5 shadow-investment">
                      <View className="flex-row items-start justify-between">
                        <Text className="flex-1 pr-2 font-headline-md text-headline-md text-on-surface">
                          {plan.groupName}
                        </Text>
                        <View className="flex-row items-center gap-1">
                          <MaterialIcons name="pending-actions" size={16} color={colors.primary} />
                          <Text className="font-label-sm text-label-sm text-primary">{plan.groupCode}</Text>
                        </View>
                      </View>
                      {group?.plot_location ? (
                        <View className="flex-row items-center gap-1">
                          <MaterialIcons name="location-on" size={16} color={colors['on-surface-variant']} />
                          <Text className="font-label-md text-label-md text-on-surface-variant">
                            {group.plot_location}
                          </Text>
                        </View>
                      ) : null}
                      {group?.description ? (
                        <Text className="font-body-md text-body-md text-on-surface-variant" numberOfLines={2}>
                          {group.description}
                        </Text>
                      ) : null}

                      <View className="gap-2">
                        <View className="flex-row items-end justify-between">
                          <Text className="font-label-md text-label-sm text-on-surface">
                            Your installments: {plan.installmentsPaid} / {plan.installmentsTarget}
                          </Text>
                          <Text className="font-label-sm text-label-sm text-on-surface-variant">
                            Share: {formatRwf(plan.memberShare)}
                          </Text>
                        </View>
                        <View className="h-2 w-full overflow-hidden rounded-full bg-surface-container-highest">
                          <View className="h-full rounded-full bg-secondary" style={{ width: `${installmentPercent}%` }} />
                        </View>
                      </View>

                      <Button
                        label="View Details"
                        onPress={() => router.push({ pathname: '/group/[id]', params: { id: String(plan.groupId) } })}
                        className="w-full"
                      />
                    </View>
                  );
                })}
              </View>
            )}
          </>
        )}
      </ScrollView>
    </View>
  );
}
