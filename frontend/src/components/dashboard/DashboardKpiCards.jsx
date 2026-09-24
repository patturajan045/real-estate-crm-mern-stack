import React from 'react';
import { formatCurrency } from '../../utils/formatters';

export default function DashboardKpiCards({
  data,
  onScrollToFollowups,
  onNavigateLeads,
  onNavigateProperties,
  onNavigateBookings,
}) {
  const counts = data?.counts || {};
  const totalLeads = counts.totalLeads ?? data?.kpi?.totalLeads ?? 0;
  const todayFollowups = counts.todayFollowupsCount ?? 0;
  const overdueFollowups = counts.overdueFollowupsCount ?? 0;
  const totalPendingFollowups = todayFollowups + overdueFollowups;
  const availableUnits = counts.availableUnits ?? data?.kpi?.availableUnits ?? 0;
  const totalUnits = counts.totalUnits ?? data?.kpi?.totalUnits ?? 0;
  const totalRevenue = counts.totalRevenue ?? data?.kpi?.totalRevenue ?? 0;
  const totalBookings = counts.totalBookings ?? data?.kpi?.activeBookings ?? 0;

  return (
    <div className="row g-2 g-sm-3 mb-3 mb-sm-4 crm-swipe-row">
      {/* 1. Total Leads Card */}
      <div className="col-6 col-xl-3">
        <div
          className="stat-card h-100"
          onClick={onNavigateLeads}
          role="button"
          tabIndex={0}
          title="Total registered leads across all pipeline stages"
          onKeyDown={(e) => e.key === 'Enter' && onNavigateLeads()}
        >
          <div className="min-w-0 me-1 me-sm-2 flex-grow-1">
            <div className="stat-label">
              <span className="d-none d-sm-inline">Total </span>Leads
            </div>
            <h3 className="stat-value text-body" id="kpiTotalLeads">
              {totalLeads}
            </h3>
            <div className="d-flex align-items-center gap-1 mt-1">
              <span className="stat-trend up">
                <i className="fas fa-arrow-up me-1"></i>
                <span className="d-none d-sm-inline">Active Pipeline</span>
                <span className="d-sm-none">Pipeline</span>
              </span>
            </div>
          </div>
          <div className="stat-icon primary">
            <i className="fas fa-users"></i>
          </div>
        </div>
      </div>

      {/* 2. Urgent Follow-ups Card */}
      <div className="col-6 col-xl-3">
        <div
          className="stat-card h-100"
          onClick={onScrollToFollowups}
          role="button"
          tabIndex={0}
          title="Calls and meetings scheduled for today or overdue"
          onKeyDown={(e) => e.key === 'Enter' && onScrollToFollowups()}
        >
          <div className="min-w-0 me-1 me-sm-2 flex-grow-1">
            <div className="stat-label">
              <span className="d-none d-sm-inline">Urgent </span>Follow-ups
            </div>
            <h3 className="stat-value text-warning" id="kpiFollowupsCount">
              {totalPendingFollowups}
            </h3>
            <div className="d-flex align-items-center gap-1 mt-1">
              <span className="text-muted small text-truncate" style={{ fontSize: '0.72rem' }}>
                <span className="d-none d-sm-inline">{todayFollowups} today, {overdueFollowups} overdue</span>
                <span className="d-sm-none">{todayFollowups} today · {overdueFollowups} due</span>
              </span>
            </div>
          </div>
          <div className="stat-icon warning">
            <i className="fas fa-clock"></i>
          </div>
        </div>
      </div>

      {/* 3. Available Inventory Card */}
      <div className="col-6 col-xl-3">
        <div
          className="stat-card h-100"
          onClick={onNavigateProperties}
          role="button"
          tabIndex={0}
          title="Units currently open for buyer booking"
          onKeyDown={(e) => e.key === 'Enter' && onNavigateProperties()}
        >
          <div className="min-w-0 me-1 me-sm-2 flex-grow-1">
            <div className="stat-label">
              Available<span className="d-none d-sm-inline"> Units</span>
            </div>
            <h3 className="stat-value text-success" id="kpiAvailableUnits">
              {availableUnits}
            </h3>
            <div className="d-flex align-items-center gap-1 mt-1">
              <span className="text-muted small text-truncate" style={{ fontSize: '0.72rem' }}>
                <span className="d-none d-sm-inline">out of {totalUnits} total units</span>
                <span className="d-sm-none">of {totalUnits} units</span>
              </span>
            </div>
          </div>
          <div className="stat-icon success">
            <i className="fas fa-door-open"></i>
          </div>
        </div>
      </div>

      {/* 4. Confirmed Revenue Card */}
      <div className="col-6 col-xl-3">
        <div
          className="stat-card h-100"
          onClick={onNavigateBookings}
          role="button"
          tabIndex={0}
          title="Total agreement value of confirmed bookings"
          onKeyDown={(e) => e.key === 'Enter' && onNavigateBookings()}
        >
          <div className="min-w-0 me-1 me-sm-2 flex-grow-1">
            <div className="stat-label">
              <span className="d-none d-sm-inline">Confirmed </span>Revenue
            </div>
            <h3 className="stat-value text-info" id="kpiTotalRevenue">
              {formatCurrency(totalRevenue)}
            </h3>
            <div className="d-flex align-items-center gap-1 mt-1">
              <span className="text-muted small text-truncate" style={{ fontSize: '0.72rem' }}>
                {totalBookings} Bookings
              </span>
            </div>
          </div>
          <div className="stat-icon info">
            <i className="fas fa-hand-holding-usd"></i>
          </div>
        </div>
      </div>
    </div>
  );
}
