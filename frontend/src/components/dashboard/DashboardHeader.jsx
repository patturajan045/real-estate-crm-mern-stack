import React from 'react';
import { useCms } from '../../context/CmsContext';

export default function DashboardHeader({
  onOpenQuickLead,
  onNavigateNewBooking,
  onRefresh,
  refreshing = false,
  onExportReport,
}) {
  const { t } = useCms();

  return (
    <div className="crm-page-header-centered mb-3 mb-sm-4">
      {/* Floating Modern Icon Badge */}
      <div className="page-icon-badge dashboard-badge">
        <i className="fas fa-chart-line"></i>
      </div>
      
      <h1 className="page-title-creative mb-1.5">
        <span className="d-none d-sm-inline">{t('dashboard_title', 'Sales & Inventory Dashboard')}</span>
        <span className="d-sm-none">Sales Dashboard</span>
      </h1>
      
      <p className="page-subtitle-creative mb-0 d-none d-sm-block">
        {t('dashboard_subtitle', 'Live business metrics, pipeline conversion stages, and daily follow-up actions')}
      </p>
      <p className="page-subtitle-creative mb-0 d-sm-none text-muted" style={{ fontSize: '0.78rem' }}>
        Live metrics, pipeline conversion & urgent client actions
      </p>

      {/* Decorative Divider */}
      <div className="page-header-divider my-2.5"></div>

      {/* Header Quick Action Pill Buttons (Responsive with tight gap and compact buttons on mobile) */}
      <div className="dashboard-header-actions d-flex justify-content-center flex-wrap gap-1.5 gap-sm-2 mt-2">
        <button
          type="button"
          className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1 shadow-sm px-2 px-sm-3"
          onClick={onOpenQuickLead}
          title="Add a prospective customer"
        >
          <i className="fas fa-user-plus small"></i>
          <span className="fw-medium d-none d-sm-inline">+ Add Lead</span>
          <span className="fw-medium d-sm-none">+ Lead</span>
        </button>

        <button
          type="button"
          className="btn btn-outline-primary btn-sm d-inline-flex align-items-center gap-1 px-2 px-sm-3"
          onClick={onNavigateNewBooking}
          title="Create a new property reservation agreement"
        >
          <i className="fas fa-file-signature small"></i>
          <span className="fw-medium d-none d-sm-inline">New Booking</span>
          <span className="fw-medium d-sm-none">Booking</span>
        </button>

        {onExportReport && (
          <button
            type="button"
            className="btn btn-outline-success btn-sm d-inline-flex align-items-center gap-1 px-2 px-sm-3"
            onClick={onExportReport}
            title="Download CSV report of CRM metrics"
          >
            <i className="fas fa-file-excel small"></i>
            <span className="fw-medium d-none d-sm-inline">Export Report</span>
            <span className="fw-medium d-sm-none">Export</span>
          </button>
        )}

        <button
          type="button"
          className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1 px-2 px-sm-3"
          onClick={onRefresh}
          disabled={refreshing}
          title="Refresh dashboard metrics from database"
        >
          <i className={`fas fa-sync-alt small ${refreshing ? 'fa-spin' : ''}`}></i>
          <span className="fw-medium d-none d-sm-inline">{refreshing ? 'Refreshing...' : 'Refresh'}</span>
          <span className="fw-medium d-sm-none">Sync</span>
        </button>
      </div>
    </div>
  );
}
