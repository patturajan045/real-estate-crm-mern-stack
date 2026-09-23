import React from 'react';
import StatCard from '../common/StatCard';
import { formatCurrency } from '../../utils/formatters';

export default function DashboardKpiCards({ data, onScrollToFollowups, onNavigateLeads, onNavigateProperties, onNavigateBookings }) {
  const kpi = data?.kpi || {};

  return (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3 mb-4">
      <div className="col">
        <StatCard
          title="Total Leads"
          value={kpi.totalLeads ?? 0}
          icon="fa-user-tag"
          colorClass="text-primary"
          bgClass="bg-primary-subtle"
          subtitle={`${kpi.activeLeads ?? 0} active in pipeline`}
          badgeText="Pipeline"
          badgeType="primary"
          onClick={onNavigateLeads}
        />
      </div>

      <div className="col">
        <StatCard
          title="Available Units"
          value={kpi.availableUnits ?? 0}
          icon="fa-door-open"
          colorClass="text-success"
          bgClass="bg-success-subtle"
          subtitle={`Out of ${kpi.totalUnits ?? 0} total units`}
          badgeText="Inventory"
          badgeType="success"
          onClick={onNavigateProperties}
        />
      </div>

      <div className="col">
        <StatCard
          title="Active Bookings"
          value={kpi.activeBookings ?? 0}
          icon="fa-file-signature"
          colorClass="text-info"
          bgClass="bg-info-subtle"
          subtitle={formatCurrency(kpi.totalRevenue || 0)}
          badgeText="Agreements"
          badgeType="info"
          onClick={onNavigateBookings}
        />
      </div>

      <div className="col">
        <StatCard
          title="Pending Follow-ups"
          value={kpi.pendingFollowUps ?? 0}
          icon="fa-calendar-exclamation"
          colorClass={kpi.pendingFollowUps > 0 ? 'text-warning' : 'text-muted'}
          bgClass="bg-warning-subtle"
          subtitle="Requires staff attention"
          badgeText={kpi.pendingFollowUps > 0 ? 'Action Due' : 'All Clear'}
          badgeType={kpi.pendingFollowUps > 0 ? 'warning' : 'secondary'}
          onClick={onScrollToFollowups}
        />
      </div>
    </div>
  );
}
