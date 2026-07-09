import { apiFetch } from '@/api/client';

type CurrencyAmount = { currency: string; amount: string };

export type InvestmentPlanEntry = {
  groupId: number;
  groupName: string;
  groupCode: string;
  buildingCost: string;
  totalUnits: number;
  memberShare: string;
  installmentsPaid: number;
  installmentsTarget: number;
};

export type DashboardOverview = {
  investor: {
    id: number;
    fullName: string;
    email: string;
    role: string;
    roleLabel: string;
    memberSince: string;
    emailVerified: boolean;
  };
  membership: {
    headline: string;
    message: string;
    deposit: { requiredAmountRwf: string; paid: boolean; totals: CurrencyAmount[] };
  };
  summary: {
    totalInvested: CurrencyAmount[];
    activeGroups: number;
    totalReturns: CurrencyAmount[];
    properties: { participating: number; available: number };
  };
  /** Real per-group installment progress for groups I'm an active member of — this is what
   * "My Investment Groups" is actually built from, not a raw memberships list (which only
   * returns the group's numeric id, not its name/location/etc). */
  investmentPlan: InvestmentPlanEntry[];
};

/** GET /api/v1/users/dashboard/ (DashboardOverviewView) — IsAuthenticated. */
export function fetchDashboard() {
  return apiFetch<DashboardOverview>('/api/v1/users/dashboard/');
}

/** Pulls the RWF entry out of a {currency, amount}[] list — every amount in this backend is RWF
 * in practice (Project.Currency only defines RWF), but the shape is a list, so this is defensive
 * rather than just indexing [0]. */
export function extractRwfAmount(amounts: CurrencyAmount[]): number {
  const entry = amounts.find((a) => a.currency === 'RWF') ?? amounts[0];
  return entry ? Number(entry.amount) : 0;
}
