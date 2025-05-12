// ... existing code ...
import { useDashboardSummary } from '@/hooks/useDashboardSummary';
import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();
  const companyId = user?.profile?.company_id || null;
  const { summary, loading, error } = useDashboardSummary(companyId);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>{error}</div>;

  return (
    <div>
      <DashboardGreeting user={user} />
      <DashboardTotalEmissions value={summary?.total_emissions} />
      <DashboardScopeBreakdownChart data={summary?.scope_breakdown} />
      <DashboardMonthlyTrendChart data={summary?.monthly_trends} />
      <DashboardCoverageCard value={summary?.coverage} />
      <DashboardUnmatchedAlert count={summary?.unmatched_entries} />
      <DashboardQuickActions />
      <DashboardActivityFeed activities={summary?.recent_activities} />
    </div>
  );
}
// ... existing code ...