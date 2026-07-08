import type { GroupApplication } from '@/api/applications';
import type { InvestGroup } from '@/api/groups';
import type { PlotMembershipStatus } from '@/components/ui/plot-listing-card';

/** Latest application per group, keyed by group id — "latest" matters if someone reapplied. */
export function indexApplicationsByGroup(applications: GroupApplication[]): Map<number, GroupApplication> {
  const map = new Map<number, GroupApplication>();
  for (const application of applications) {
    if (application.group == null) continue;
    const existing = map.get(application.group);
    if (!existing || new Date(application.created_at) > new Date(existing.created_at)) {
      map.set(application.group, application);
    }
  }
  return map;
}

export function computeMembershipStatus(
  group: InvestGroup,
  currentUserId: number | undefined,
  applicationsByGroup: Map<number, GroupApplication>
): PlotMembershipStatus {
  if (currentUserId != null && group.created_by.id === currentUserId) return 'member';
  const application = applicationsByGroup.get(group.id);
  if (!application) return 'none';
  if (application.status === 'approved') return 'member';
  if (application.status === 'pending' || application.status === 'review') return 'pending';
  return 'none';
}
