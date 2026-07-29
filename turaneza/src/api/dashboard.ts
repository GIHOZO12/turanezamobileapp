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
  
  investmentPlan: InvestmentPlanEntry[];
};


export function fetchDashboard() {
  return apiFetch<DashboardOverview>('/api/v1/users/dashboard/');
}


export function extractRwfAmount(amounts: CurrencyAmount[]): number {
  const entry = amounts.find((a) => a.currency === 'RWF') ?? amounts[0];
  return entry ? Number(entry.amount) : 0;
}
