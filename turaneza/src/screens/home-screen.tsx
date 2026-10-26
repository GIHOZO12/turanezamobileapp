import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect, useMemo, useState } from 'react';
import { ActivityIndicator, Pressable, ScrollView, Text, View } from 'react-native';

import { ApiError } from '@/api/client';
import { extractRwfAmount, fetchDashboard, type DashboardOverview } from '@/api/dashboard';
import { fetchInvestGroups, type InvestGroup } from '@/api/groups';
import { fetchProjects, type Project } from '@/api/projects';
import { Button } from '@/components/ui/button';
import { ProjectCard } from '@/components/ui/project-card';
import { TopAppBar } from '@/components/ui/top-app-bar';
import colors from '@/constants/colors';
import { BottomTabInset } from '@/constants/layout';
import { formatRwf } from '@/lib/format';

const TRUST_ITEMS = [
  { icon: 'health-and-safety', label: 'Legally Escrowed' },
  { icon: 'verified', label: 'RDB Verified' },
  { icon: 'payments', label: 'Instant Dividends' },
] as const;

export default function HomeScreen() {
  const router = useRouter();

  const [headerHeight, setHeaderHeight] = useState(80);
  const [featuredProjects, setFeaturedProjects] = useState<Project[]>([]);
  const [groups, setGroups] = useState<InvestGroup[]>([]);
  const [dashboard, setDashboard] = useState<DashboardOverview | null>(null);
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);
  const [projectsError, setProjectsError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects()
      .then((data) => setFeaturedProjects(data.results.slice(0, 3)))
      .catch((err) => setProjectsError(err instanceof ApiError ? err.message : 'Could not load featured projects.'))
      .finally(() => setIsLoadingProjects(false));

    fetchInvestGroups()
      .then((data) => setGroups(data.results))
      .catch(() => {});

    // Best-effort — the hero stats just fall back to a loading dash rather than blocking the
    // rest of the page over this one call.
    fetchDashboard()
      .then(setDashboard)
      .catch(() => {});
  }, []);

  const membersCountByGroup = useMemo(() => new Map(groups.map((g) => [g.id, g.members_count])), [groups]);

  return (
    <View className="flex-1 bg-background">
      <TopAppBar translucent onHeightChange={setHeaderHeight} />

      <ScrollView
        contentContainerClassName="gap-xl px-margin-mobile"
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: BottomTabInset + 40 }}
        showsVerticalScrollIndicator={false}>
        <View className="gap-md pt-sm">
          <Text className="font-display-lg text-display-lg text-on-background">

            <Text className="text-primary">Co-invest in modern multi-family and community Housing
</Text>
          </Text>
          <Text className="font-body-lg text-body-lg text-on-surface-variant">
Register your plot on TURANEZA. We’ll help you find co-investors to build vertically, with each participant owning an apartment.


          </Text>
          <View className="flex-row gap-md py-sm pt-xs">
            <Button label="Browse All Plots" onPress={() => router.push('/plots')} className="flex-1" />
            <Button
              label="Submit a Plot"
              variant="primary"
              onPress={() => router.push('/submit-plot')}
              className="flex-1"
            />
          </View>

          <View className="mt-md flex-row gap-md">
            <View className="flex-1 gap-sm rounded-lg bg-surface-container-lowest p-md shadow-investment">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-primary-fixed">
                <MaterialIcons name="account-balance-wallet" size={18} color={colors.primary} />
              </View>
              <Text className="font-label-md text-label-md text-on-surface-variant">Total Invested</Text>
              <Text className="font-headline-md text-headline-md text-on-surface">
                {formatRwf(extractRwfAmount(dashboard?.summary.totalInvested ?? []))}
              </Text>
            </View>
            <View className="flex-1 gap-sm rounded-lg bg-surface-container-lowest p-md shadow-investment">
              <View className="h-9 w-9 items-center justify-center rounded-full bg-primary-fixed">
                <MaterialIcons name="groups" size={18} color={colors.primary} />
              </View>
              <Text className="font-label-md text-label-md text-on-surface-variant">Active Groups</Text>
              <Text className="font-headline-md text-headline-md text-on-surface">
                {dashboard?.summary.activeGroups ?? 0}
              </Text>
            </View>
          </View>
        </View>

    
        <View className="gap-md">
          <View className="gap-1">
            <Text className="font-headline-lg text-headline-lg text-on-background">Featured Projects</Text>
            <Text className="font-body-md text-body-md text-on-surface-variant">
Explore Current Developments.


            </Text>
          </View>
          <Pressable onPress={() => router.push('/projects')} className="flex-row items-center gap-2 self-start">
            <Text className="font-label-md text-label-md text-primary">View All</Text>
            <MaterialIcons name="arrow-forward" size={18} color={colors.primary} />
          </Pressable>

          {isLoadingProjects ? (
            <ActivityIndicator className="py-lg" color={colors.primary} />
          ) : projectsError ? (
            <Text className="rounded-lg bg-error-container px-md py-sm text-center font-label-md text-label-md text-on-error-container">
              {projectsError}
            </Text>
          ) : featuredProjects.length === 0 ? (
            <Text className="py-lg text-center font-body-md text-body-md text-on-surface-variant">
              No projects available yet.
            </Text>
          ) : (
            <View className="gap-gutter">
              {featuredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  investorsCount={project.group != null ? membersCountByGroup.get(project.group) : undefined}
                  onViewDetails={() =>
                    project.group != null &&
                    router.push({ pathname: '/group/[id]', params: { id: String(project.group) } })
                  }
                />
              ))}
            </View>
          )}
        </View>

        <View className=" p-lg items-center gap-md rounded-lg bg-primary ">
          <Text className="text-center font-headline-lg text-headline-lg text-on-primary">Why Choose Turaneza?</Text>
          <Text className="text-center font-body-md text-body-md text-primary-fixed">
TURANEZA App, developed by Urban Evolution Group Ltd, connects landowners with people who want to live in the same location. They form groups and pool their resources to build housing with several apartments, where members can own or rent a unit.
Urban Evolution Group Ltd manages the whole building process from designing the homes to handing them over.
 Investors form a committee to assure smooth collaboration, accountability and transparency of use of funds. 
This approach makes housing more affordable, uses land efficiently, and helps build sustainable communities in the city.


          </Text>
          {/* <View className="w-full flex-row gap-md">
            {TRUST_ITEMS.map((item) => (
              <View key={item.label} className="flex-1 items-center gap-2 rounded-lg bg-on-primary/10 px-2 py-3">
                <MaterialIcons name={item.icon} size={20} color={colors['secondary-fixed']} />
                <Text className="text-center font-label-md text-label-md text-on-primary">{item.label}</Text>
              </View>
            ))}
          </View> */}
        </View>
      </ScrollView>
    </View>
  );
}
