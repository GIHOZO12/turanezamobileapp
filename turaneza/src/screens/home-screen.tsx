import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

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

const TRUST_ITEMS = [
  { icon: 'health-and-safety', label: 'Legally Escrowed' },
  { icon: 'verified', label: 'RDB Verified' },
  { icon: 'payments', label: 'Instant Dividends' },
] as const;

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  // The header floats (position: absolute) over the scroll content, so nothing reserves space
  // for it automatically. Measuring its real rendered height via onLayout — instead of hardcoding
  // a padding number on the ScrollView and hoping it stays in sync — means the two can never
  // drift apart again, no matter what gets added to the header later. 80 is just a first-paint
  // guess close to the real height, so there's no visible jump before onLayout fires.
  const [headerHeight, setHeaderHeight] = useState(80);
  const [featuredPlots, setFeaturedPlots] = useState<InvestGroup[]>([]);
  const [applications, setApplications] = useState<GroupApplication[]>([]);
  const [isLoadingPlots, setIsLoadingPlots] = useState(true);
  const [plotsError, setPlotsError] = useState<string | null>(null);

  useEffect(() => {
    fetchInvestGroups()
      .then((data) => setFeaturedPlots(data.results.slice(0, 2)))
      .catch((err) => setPlotsError(err instanceof ApiError ? err.message : 'Could not load featured plots.'))
      .finally(() => setIsLoadingPlots(false));
    // Best-effort, same reasoning as plots-screen.tsx — not worth failing the dashboard over.
    fetchMyApplications()
      .then((data) => setApplications(data.results))
      .catch(() => {});
  }, []);

  const applicationsByGroup = useMemo(() => indexApplicationsByGroup(applications), [applications]);

  return (
    <View className="flex-1 bg-background">
      {/* The mockup's header is fixed+blurred over the scrolling content. RN has no CSS
          backdrop-filter, so this is a plain translucent bar instead of a true blur — a
          deliberate simplification, not a limitation we hit by accident. */}
      <TopAppBar translucent onHeightChange={setHeaderHeight} />

      {/* paddingTop and paddingBottom both live in contentContainerStyle, not split between
          className and style — mixing the two for the same property is exactly what caused the
          header to overlap content earlier (a py-4/pt-28 conflict), so both go through one path now. */}
      <ScrollView
        contentContainerClassName="gap-xl px-margin-mobile"
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: BottomTabInset + 40 }}
        showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View className="gap-md pt-sm">
          <Text className="font-display-lg text-display-lg text-on-background">
            Invest in{'\n'}
            <Text className="text-primary">Rwanda&apos;s Future</Text>
          </Text>
          <Text className="font-body-lg text-body-lg text-on-surface-variant">
            Join communal investment groups to acquire prime real estate and plots across Rwanda. Secure your wealth
            through transparent, institutional-grade land ownership.
          </Text>
          {/* To this: */}
<View className="flex-row flex-wrap gap-md py-sm pt-xs">
  <Button label="Browse All Plots" onPress={() => router.push('/plots')} className="grow px-8 " />
  {/* Submit a Plot flow isn't built yet — no-op for now */}
  <Button label="Submit a Plot" variant="secondary" onPress={() => {}} className="grow px-8" />
</View>

          <View className="mt-sm flex-row gap-md">
            <View className="flex-1 gap-xs rounded-lg bg-surface-container-lowest p-md shadow-investment">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-primary-fixed">
                <MaterialIcons name="account-balance-wallet" size={18} color={colors.primary} />
              </View>
              <Text className="font-label-md text-label-md text-on-surface-variant">Total Invested</Text>
              <Text className="font-headline-md text-headline-md text-on-surface">RWF 4.2B+</Text>
              <Text className="font-label-sm text-label-sm text-secondary">↑ 12% this month</Text>
            </View>
            <View className="flex-1 gap-xs rounded-lg  bg-surface-container-lowest p-md shadow-investment">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-primary-fixed">
                <MaterialIcons name="groups" size={18} color={colors.primary} />
              </View>
              <Text className="font-label-md text-label-md text-on-surface-variant">Active Groups</Text>
              <Text className="font-headline-md text-headline-md text-on-surface">1,482</Text>
              <Text className="font-label-sm text-label-sm text-on-surface-variant">Across 30 districts</Text>
            </View>
          </View>
        </View>

        {/* Featured Plots */}
        <View className="gap-md">
          <View className="gap-1">
            <Text className="font-headline-lg text-headline-lg text-on-background">Featured Opportunities</Text>
            <Text className="font-body-md text-body-md text-on-surface-variant">
              Hand-picked prime plots currently open for co-investment.
            </Text>
          </View>
          <Pressable onPress={() => router.push('/plots')} className="flex-row items-center gap-2 self-start">
            <Text className="font-label-md text-label-md text-primary">View All</Text>
            <MaterialIcons name="arrow-forward" size={18} color={colors.primary} />
          </Pressable>

          {isLoadingPlots ? (
            <ActivityIndicator className="py-lg" color={colors.primary} />
          ) : plotsError ? (
            <Text className="rounded-lg bg-error-container px-md py-sm text-center font-label-md text-label-md text-on-error-container">
              {plotsError}
            </Text>
          ) : featuredPlots.length === 0 ? (
            <Text className="py-lg text-center font-body-md text-body-md text-on-surface-variant">
              No plots available yet.
            </Text>
          ) : (
            <View className="gap-gutter">
              {featuredPlots.map((group) => (
                <PlotListingCard
                  key={group.id}
                  group={group}
                  currentUserId={user?.id}
                  membershipStatus={computeMembershipStatus(group, user?.id, applicationsByGroup)}
                  onViewDetails={() => router.push({ pathname: '/group/[id]', params: { id: String(group.id) } })}
                  onJoin={() => router.push({ pathname: '/group/[id]/apply', params: { id: String(group.id) } })}
                />
              ))}
            </View>
          )}
        </View>

        {/* Trust banner */}
        <View className="gap-sm rounded-lg bg-primary  p-sm">
          <Text className="font-headline-lg text-headline-lg text-on-primary">Why Choose Turaneza?</Text>
          <Text className="mb-sm font-body-md text-body-md text-primary-fixed">
            We leverage blockchain technology for immutable land title tracking and provide institutional legal
            frameworks for every co-investment group
          </Text>
          <View className="flex-row flex-wrap gap-md">
            {TRUST_ITEMS.map((item) => (
              <View key={item.label} className="flex-row items-center gap-2">
                <MaterialIcons name={item.icon} size={18} color={colors['secondary-fixed']} />
                <Text className="font-label-md text-label-md text-on-primary">{item.label}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
