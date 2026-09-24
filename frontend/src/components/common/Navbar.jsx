import React from 'react';
import NotificationDropdown from './NotificationDropdown';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getInitials } from '../../utils/formatters';

export default function Navbar({
  navContext = 'Overview',
  onOpenProfileDrawer,
  onOpenMobileProfile,
  onOpenGlobalSearch,
}) {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <>
      {/* ======================================================== */}
      {/* 1. DEDICATED MOBILE TOP NAVBAR (< 768px)                */}
      {/* ======================================================== */}
      <header className="crm-mobile-header d-flex d-md-none align-items-center justify-content-between px-3 py-2 border-bottom shadow-sm">
        {/* Brand with City Icon */}
        <div className="d-flex align-items-center gap-2 min-w-0">
          <div
            className="rounded-3 d-inline-flex align-items-center justify-content-center text-white flex-shrink-0"
            style={{
              width: '32px',
              height: '32px',
              background: 'linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%)',
              boxShadow: '0 2px 6px rgba(37, 99, 235, 0.35)',
            }}
          >
            <i className="fas fa-city" style={{ fontSize: '0.9rem' }}></i>
          </div>
          <div className="min-w-0">
            <span className="fw-bold d-block text-truncate text-body" style={{ fontSize: '0.92rem', letterSpacing: '-0.02em' }}>
              EstateFlow
            </span>
            <span className="badge bg-success-subtle text-success p-0" style={{ fontSize: '0.62rem' }}>
              <i className="fas fa-circle me-1" style={{ fontSize: '5px' }}></i>Live
            </span>
          </div>
        </div>

        {/* Action Triggers: Search + Theme + Notifications + User Avatar */}
        <div className="d-flex align-items-center gap-1.5 flex-shrink-0">
          {/* Quick Search Trigger */}
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center p-0 rounded-2"
            onClick={onOpenGlobalSearch}
            title="Search anything (Cmd+K)"
            aria-label="Global Search"
            style={{ width: '34px', height: '34px' }}
          >
            <i className="fas fa-search small"></i>
          </button>

          {/* Theme Switcher Toggle */}
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center p-0 rounded-2"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            aria-label="Toggle Theme"
            style={{ width: '34px', height: '34px' }}
          >
            <i className={isDark ? 'fas fa-sun text-warning small' : 'fas fa-moon text-primary small'}></i>
          </button>

          {/* Notification Bell */}
          <NotificationDropdown isMobile={true} />

          {/* Mobile Profile Trigger */}
          <button
            className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center p-0 rounded-circle flex-shrink-0"
            id="mobileTopProfileBtn"
            type="button"
            onClick={onOpenMobileProfile}
            title="User Account & Profile"
            aria-label="User Account & Profile"
            style={{
              width: '34px',
              height: '34px',
              border: '2px solid var(--crm-primary)',
              backgroundColor: 'var(--crm-primary-subtle)',
              color: 'var(--crm-primary)',
              fontWeight: 700,
              fontSize: '0.75rem',
            }}
          >
            {getInitials(user?.name || 'User')}
          </button>
        </div>
      </header>

      {/* ======================================================== */}
      {/* 2. ADVANCED DESKTOP HEADER BAR (>= 768px)               */}
      {/* ======================================================== */}
      <header className="crm-header d-none d-md-flex align-items-center justify-content-between px-3 px-lg-4 border-bottom">
        {/* Left: Sidebar Toggle + Nav Context Pill */}
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
            <span
              className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1.5 d-inline-flex align-items-center gap-1.5 fw-semibold"
              style={{ fontSize: '0.8rem', borderRadius: '0.5rem' }}
            >
              <span
                className="rounded-circle bg-success"
                style={{ width: '6px', height: '6px', display: 'inline-block' }}
              ></span>
              <span className="text-truncate">{navContext}</span>
            </span>
          </div>
        </div>

        {/* Center: Command Palette / Global Search Trigger */}
        <div className="d-none d-md-block flex-grow-1 mx-3" style={{ maxWidth: '420px' }}>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary w-100 d-flex align-items-center justify-content-between px-3 py-1.5 rounded-3 text-muted text-start"
            onClick={onOpenGlobalSearch}
            style={{
              backgroundColor: 'var(--crm-input-bg)',
              borderColor: 'var(--crm-border)',
              fontSize: '0.82rem',
              boxShadow: 'none',
            }}
          >
            <span className="d-flex align-items-center gap-2">
              <i className="fas fa-search text-primary small"></i>
              <span className="text-truncate">Search leads, units, bookings, pages...</span>
            </span>
            <kbd className="badge bg-body text-muted border py-0.5 px-1.5 small font-monospace">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Controls + Theme Switcher + Notifications + Profile */}
        <div className="d-flex align-items-center gap-2 flex-shrink-0">
          {/* Quick Theme Switcher Button */}
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center p-0 rounded-2"
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            aria-label="Toggle Theme"
            style={{
              width: '38px',
              height: '38px',
              border: '1.5px solid var(--crm-border)',
            }}
          >
            <i className={isDark ? 'fas fa-sun text-warning' : 'fas fa-moon text-primary'}></i>
          </button>

          {/* Live Notifications Bell Dropdown */}
          <NotificationDropdown isMobile={false} />

          {/* User Account Capsule */}
          <div id="userProfileContainer">
            <button
              className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-2 py-1 px-2.5 rounded-3 user-profile-icon-btn"
              id="headerProfileBtn"
              type="button"
              onClick={onOpenProfileDrawer}
              title="User Account & Profile Drawer"
              aria-label="User Account"
              style={{
                border: '1.5px solid var(--crm-border)',
                height: '38px',
              }}
            >
              <div
                className="rounded-circle d-flex align-items-center justify-content-center text-white fw-bold small flex-shrink-0"
                style={{
                  width: '26px',
                  height: '26px',
                  background: 'linear-gradient(135deg, #2563eb, #8b5cf6)',
                  fontSize: '0.72rem',
                }}
              >
                {getInitials(user?.name || 'User')}
              </div>
              <div className="d-none d-xl-block text-start min-w-0" style={{ lineHeight: '1.15' }}>
                <div className="fw-semibold text-body text-truncate small" style={{ maxWidth: '100px' }}>
                  {user?.name || 'Administrator'}
                </div>
                <div className="text-muted text-truncate" style={{ fontSize: '0.65rem' }}>
                  {user?.role || 'User'}
                </div>
              </div>
              <i className="fas fa-chevron-down text-muted small ms-0.5" style={{ fontSize: '0.65rem' }}></i>
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
