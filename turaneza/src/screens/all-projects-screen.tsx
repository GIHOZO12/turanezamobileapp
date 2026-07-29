import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'expo-router';
import { ActivityIndicator, ScrollView, Text, View } from 'react-native';

import { ApiError } from '@/api/client';
import { fetchInvestGroups, type InvestGroup } from '@/api/groups';
import { fetchProjects, type Project } from '@/api/projects';
import { ProjectCard } from '@/components/ui/project-card';
import { TopAppBar } from '@/components/ui/top-app-bar';
import colors from '@/constants/colors';
import { BottomTabInset } from '@/constants/layout';

export default function AllProjectsScreen() {
  const router = useRouter();
  const [headerHeight, setHeaderHeight] = useState(80);
  const [projects, setProjects] = useState<Project[]>([]);
  const [groups, setGroups] = useState<InvestGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProjects()
      .then((data) => setProjects(data.results))
      .catch((err) => setError(err instanceof ApiError ? err.message : 'Could not reach the server. Check your connection.'))
      .finally(() => setIsLoading(false));

    // Best-effort, same reasoning as home-screen.tsx — investor counts are a nice-to-have on
    // each card, not worth failing the whole list over.
    fetchInvestGroups()
      .then((data) => setGroups(data.results))
      .catch(() => {});
  }, []);

  const membersCountByGroup = useMemo(() => new Map(groups.map((g) => [g.id, g.members_count])), [groups]);

  return (
    <View className="flex-1 bg-background">
      <TopAppBar onHeightChange={setHeaderHeight} />

      <ScrollView
        contentContainerClassName="gap-xl px-margin-mobile"
        contentContainerStyle={{ paddingTop: headerHeight, paddingBottom: BottomTabInset + 24 }}
        showsVerticalScrollIndicator={false}>
        <View className="gap-1">
          <Text className="font-headline-lg text-headline-lg text-on-background">All Projects</Text>
          <Text className="font-body-md text-body-md text-on-surface-variant">
            Every development currently listed across Turaneza's co-investment groups.
          </Text>
        </View>

        {isLoading ? (
          <ActivityIndicator className="py-lg" color={colors.primary} />
        ) : error ? (
          <Text className="rounded-lg bg-error-container px-md py-sm text-center font-label-md text-label-md text-on-error-container">
            {error}
          </Text>
        ) : projects.length === 0 ? (
          <Text className="py-lg text-center font-body-md text-body-md text-on-surface-variant">
            No projects available yet.
          </Text>
        ) : (
          <View className="gap-gutter">
            {projects.map((project) => (
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
      </ScrollView>
    </View>
  );
}
