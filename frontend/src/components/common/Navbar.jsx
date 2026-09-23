import React from 'react';
import NotificationDropdown from './NotificationDropdown';

export default function Navbar({ navContext = 'Overview', onOpenProfileDrawer, onOpenMobileProfile }) {
  return (
    <>
      {/* Dedicated Mobile Top Navbar (<768px) */}
      <header className="crm-mobile-header d-flex d-md-none align-items-center justify-content-between px-3">
        <div className="d-flex align-items-center gap-2 min-w-0">
          <div className="sidebar-brand-icon d-inline-flex align-items-center justify-content-center">
            <i className="fas fa-city"></i>
          </div>
          <div className="min-w-0">
            <span className="fw-bold d-block text-truncate" style={{ fontSize: '0.98rem', letterSpacing: '-0.01em' }}>
              Real Estate CRM
            </span>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 flex-shrink-0">
          <NotificationDropdown isMobile={true} />
          <button
            className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center p-0 user-profile-icon-btn"
            id="mobileTopProfileBtn"
            type="button"
            onClick={onOpenMobileProfile}
            title="User Account & Profile"
            aria-label="User Account & Profile"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: 'var(--crm-radius-sm)',
              border: '1.5px solid var(--crm-border)',
            }}
          >
            <i className="fas fa-user-circle text-primary fs-5"></i>
          </button>
        </div>
      </header>

      {/* Desktop Header Bar (>=768px) */}
      <header className="crm-header d-none d-md-flex">
        <div className="d-flex align-items-center gap-2 gap-sm-3 min-w-0">
          <button
            className="btn btn-sm btn-sidebar-toggle d-lg-none flex-shrink-0"
            id="mobileSidebarToggleBtn"
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#sidebar"
            aria-controls="sidebar"
            aria-label="Toggle navigation"
            title="Toggle Navigation"
          >
            <i className="fas fa-bars"></i>
          </button>
          <div className="header-title-box min-w-0">
            <div className="d-flex align-items-center gap-2 text-muted small">
              <span className="text-primary fw-medium" id="headerNavContext">
                {navContext}
              </span>
            </div>
          </div>
        </div>

        <div className="d-flex align-items-center gap-2 gap-sm-2.5 flex-shrink-0">
          <NotificationDropdown isMobile={false} />
          <div id="userProfileContainer">
            <button
              className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center p-2 user-profile-icon-btn"
              id="headerProfileBtn"
              type="button"
              onClick={onOpenProfileDrawer}
              title="User Account & Profile Drawer"
              aria-label="User Account"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: 'var(--crm-radius-sm)',
                border: '1.5px solid var(--crm-border)',
              }}
            >
              <i className="fas fa-user-circle text-primary fs-5"></i>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
