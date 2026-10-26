import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';

import { fetchMyApplications, type GroupApplication } from '@/api/applications';
import { fetchInvestGroups, type InvestGroup } from '@/api/groups';
import { ApiError } from '@/api/client';
import { Button } from '@/components/ui/button';
import { PlotListingCard } from '@/components/ui/plot-listing-card';
import { TopAppBar } from '@/components/ui/top-app-bar';
import colors from '@/constants/colors';
import { BottomTabInset } from '@/constants/layout';
import { useAuth } from '@/contexts/auth-context';
import { computeMembershipStatus, indexApplicationsByGroup } from '@/lib/membership';

export default function PlotsScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [headerHeight, setHeaderHeight] = useState(80);
  const [search, setSearch] = useState('');
  const [groups, setGroups] = useState<InvestGroup[]>([]);
  const [applications, setApplications] = useState<GroupApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function load() {
    setError(null);
    return Promise.all([
      fetchInvestGroups().then((data) => setGroups(data.results)),
  
      fetchMyApplications()
        .then((data) => setApplications(data.results))
        .catch(() => {}),
    ]).catch((err) => setError(err instanceof ApiError ? err.message : 'Could not reach the server. Check your connection.'));
  }

  const applicationsByGroup = useMemo(() => indexApplicationsByGroup(applications), [applications]);

  useEffect(() => {
    setIsLoading(true);
    load().finally(() => setIsLoading(false));
  }, []);

  function handleRefresh() {
    setIsRefreshing(true);
    load().finally(() => setIsRefreshing(false));
  }


  const visibleGroups = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return groups;
    return groups.filter(
      (group) =>
        group.name.toLowerCase().includes(query) ||
        group.plot_location.toLowerCase().includes(query) ||
        group.description.toLowerCase().includes(query)
    );
  }, [groups, search]);

  return (
    <View className="flex-1 bg-background">
      <TopAppBar onHeightChange={setHeaderHeight} />

      <ScrollView
        contentContainerClassName="gap-md px-margin-mobile"
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: BottomTabInset + 24 }}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} tintColor={colors.primary} />}>
        <View className="flex-row items-start justify-between gap-md">
          <View className="flex-1 gap-1">
            <Text className="font-label-sm uppercase tracking-widest text-label-sm text-primary">Available Plots</Text>
            <Text className="font-headline-lg text-headline-lg text-on-background">
Approved Plots ready for developments. 


            </Text>
            <Text className="font-body-md text-body-md text-on-surface-variant">
              Every plot here has been verified by our team. Request to join one to help fund and build its house.
            </Text>
          </View>
        </View>

        <Button
          label="Register your plot"
          onPress={() => router.push('/submit-plot')}
          className=" flex-1 "
        />

        <View className="h-14 flex-row items-center gap-3 rounded-full border border-outline-variant bg-surface-container-lowest px-4 shadow-sm">
          <MaterialIcons name="search" size={20} color={search.length > 0 ? colors.primary : colors.outline} />
          <TextInput
            className="flex-1 font-body-md text-body-md text-on-surface"
            placeholder="Search plots by name or location..."
            placeholderTextColor={`${colors.outline}99`}
            value={search}
            onChangeText={setSearch}
          />
        </View>

        {isLoading ? (
          <ActivityIndicator className="py-lg" color={colors.primary} />
        ) : error ? (
          <Text className="rounded-lg bg-error-container px-md py-sm text-center font-label-md text-label-md text-on-error-container">
            {error}
          </Text>
        ) : (
          <View className="gap-gutter">
            {visibleGroups.length === 0 ? (
              <Text className="py-lg text-center font-body-md text-body-md text-on-surface-variant">
                No plots match your search.
              </Text>
            ) : (
              visibleGroups.map((group) => (
                <PlotListingCard
                  key={group.id}
                  group={group}
                  currentUserId={user?.id}
                  membershipStatus={computeMembershipStatus(group, user?.id, applicationsByGroup)}
                  onViewDetails={() => router.push({ pathname: '/group/[id]', params: { id: String(group.id) } })}
                  onJoin={() => router.push({ pathname: '/group/[id]/apply', params: { id: String(group.id) } })}
                />
              ))
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}
