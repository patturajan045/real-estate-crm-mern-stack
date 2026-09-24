import React from 'react';

export default function QuickActionsRow({
  onOpenQuickLead,
  onNavigateBookings,
  onNavigateProperties,
  onScrollToFollowups,
}) {
  return (
    <div className="row g-2 g-sm-3 mb-3 mb-sm-4">
      {/* 1. Quick Add Lead */}
      <div className="col-6 col-lg-3">
        <div
          className="quick-action-card"
          onClick={onOpenQuickLead}
          role="button"
          tabIndex={0}
          title="Add a prospective customer"
          onKeyDown={(e) => e.key === 'Enter' && onOpenQuickLead()}
        >
          <div className="quick-action-icon">
            <i className="fas fa-user-plus"></i>
          </div>
          <div className="min-w-0">
            <div className="fw-bold small text-truncate text-body">
              <span className="d-none d-sm-inline">+ Add Lead</span>
              <span className="d-sm-none">+ Lead</span>
            </div>
            <div className="text-muted text-truncate" style={{ fontSize: '0.72rem' }}>
              <span className="d-none d-sm-inline">New Prospect</span>
              <span className="d-sm-none">Prospect</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. New Booking */}
      <div className="col-6 col-lg-3">
        <div
          className="quick-action-card"
          onClick={onNavigateBookings}
          role="button"
          tabIndex={0}
          title="Reserve a property unit"
          onKeyDown={(e) => e.key === 'Enter' && onNavigateBookings()}
        >
          <div className="quick-action-icon text-success" style={{ backgroundColor: 'rgba(16, 185, 129, 0.12)' }}>
            <i className="fas fa-file-contract"></i>
          </div>
          <div className="min-w-0">
            <div className="fw-bold small text-truncate text-body">
              <span className="d-none d-sm-inline">+ New Booking</span>
              <span className="d-sm-none">+ Booking</span>
            </div>
            <div className="text-muted text-truncate" style={{ fontSize: '0.72rem' }}>
              <span className="d-none d-sm-inline">Unit Reservation</span>
              <span className="d-sm-none">Reserve</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Manage Properties */}
      <div className="col-6 col-lg-3">
        <div
          className="quick-action-card"
          onClick={onNavigateProperties}
          role="button"
          tabIndex={0}
          title="Manage projects and units"
          onKeyDown={(e) => e.key === 'Enter' && onNavigateProperties()}
        >
          <div className="quick-action-icon" style={{ backgroundColor: 'rgba(139, 92, 246, 0.12)', color: '#8b5cf6' }}>
            <i className="fas fa-building"></i>
          </div>
          <div className="min-w-0">
            <div className="fw-bold small text-truncate text-body">
              <span className="d-none d-sm-inline">+ Add Property</span>
              <span className="d-sm-none">+ Property</span>
            </div>
            <div className="text-muted text-truncate" style={{ fontSize: '0.72rem' }}>
              <span className="d-none d-sm-inline">Projects & Units</span>
              <span className="d-sm-none">Inventory</span>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Log Follow-up */}
      <div className="col-6 col-lg-3">
        <div
          className="quick-action-card"
          onClick={onScrollToFollowups}
          role="button"
          tabIndex={0}
          title="Log customer call or follow-up note"
          onKeyDown={(e) => e.key === 'Enter' && onScrollToFollowups()}
        >
          <div className="quick-action-icon text-warning" style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)' }}>
            <i className="fas fa-phone-alt"></i>
          </div>
          <div className="min-w-0">
            <div className="fw-bold small text-truncate text-body">
              <span className="d-none d-sm-inline">+ Log Follow-up</span>
              <span className="d-sm-none">+ Log Call</span>
            </div>
            <div className="text-muted text-truncate" style={{ fontSize: '0.72rem' }}>
              <span className="d-none d-sm-inline">Customer Calls</span>
              <span className="d-sm-none">Follow-up</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
