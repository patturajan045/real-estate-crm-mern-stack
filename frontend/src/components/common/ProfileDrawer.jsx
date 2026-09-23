import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getInitials, getRoleBadgeClass } from '../../utils/formatters';
import { confirm } from '../../utils/alerts';

export default function ProfileDrawer({ isOpen, onClose }) {
  const { user, logout, hasRole } = useAuth();
  const { theme, toggleTheme, isDark } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    onClose();
    const confirmed = await confirm('Log Out?', 'Are you sure you want to log out of Real Estate CRM?', 'Yes, Log out');
    if (confirmed) {
      await logout();
      navigate('/login');
    }
  };

  return (
    <>
      <div
        className={`offcanvas offcanvas-end crm-profile-drawer ${isOpen ? 'show' : ''}`}
        tabIndex="-1"
        id="profileDrawer"
        aria-labelledby="profileDrawerLabel"
        style={{ visibility: isOpen ? 'visible' : 'hidden' }}
      >
        <div className="offcanvas-header border-bottom py-3 px-3 px-sm-4">
          <h5 className="offcanvas-title fw-bold fs-6 d-flex align-items-center gap-2" id="profileDrawerLabel">
            <i className="fas fa-user-circle text-primary"></i> <span>User Account & Profile</span>
          </h5>
          <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
        </div>

        <div className="offcanvas-body p-3 p-sm-4 d-flex flex-column justify-content-between">
          <div>
            {/* User Identity Section */}
            <div className="text-center pb-3 border-bottom mb-3">
              <div
                className="profile-drawer-avatar bg-primary text-white shadow-sm mx-auto mb-2 d-flex align-items-center justify-content-center"
                id="drawerUserAvatar"
                style={{ width: '64px', height: '64px', borderRadius: '50%', fontSize: '1.5rem', fontWeight: 'bold' }}
              >
                {getInitials(user?.name)}
              </div>
              <h5 className="fw-bold mb-0.5 text-truncate" id="drawerUserName">
                {user?.name || 'User Name'}
              </h5>
              <div className="text-secondary small text-truncate mb-2" id="drawerUserEmail">
                {user?.email || 'user@crm.com'}
              </div>
              <div>
                <span className={`badge-crm ${getRoleBadgeClass(user?.role)}`} id="drawerUserRole">
                  {user?.role || 'Sales'}
                </span>
              </div>
            </div>

            {/* Account Navigation Shortcuts */}
            <div className="mb-3">
              <div
                className="text-muted fw-semibold text-uppercase small mb-2"
                style={{ fontSize: '0.7rem', letterSpacing: '0.05em' }}
              >
                Workspaces & Navigation
              </div>
              <div className="d-flex flex-column gap-1">
                <NavLink to="/dashboard" className="profile-drawer-link" onClick={onClose}>
                  <i className="fas fa-chart-line text-primary"></i> <span>Sales Dashboard</span>
                </NavLink>
                <NavLink to="/leads" className="profile-drawer-link" onClick={onClose}>
                  <i className="fas fa-user-tag" style={{ color: '#8b5cf6' }}></i> <span>Leads Pipeline</span>
                </NavLink>
                <NavLink to="/bookings" className="profile-drawer-link" onClick={onClose}>
                  <i className="fas fa-file-contract text-success"></i> <span>Bookings & Agreements</span>
                </NavLink>
                <NavLink to="/properties" className="profile-drawer-link" onClick={onClose}>
                  <i className="fas fa-city text-info"></i> <span>Properties & Inventory</span>
                </NavLink>
                {hasRole(['Super Admin', 'Admin']) && (
                  <NavLink to="/users" className="profile-drawer-link" onClick={onClose}>
                    <i className="fas fa-users-cog text-warning"></i> <span>Team & Users</span>
                  </NavLink>
                )}
                {hasRole(['Super Admin']) && (
                  <NavLink to="/settings" className="profile-drawer-link" onClick={onClose}>
                    <i className="fas fa-sliders-h text-secondary"></i> <span>Platform Settings</span>
                  </NavLink>
                )}
              </div>
            </div>

            {/* Appearance Theme Switcher */}
            <div className="p-3 rounded border mb-3" style={{ backgroundColor: 'var(--crm-surface)' }}>
              <div className="d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <i className="fas fa-adjust text-primary"></i>
                  <div>
                    <div className="fw-semibold small">Dark Mode Theme</div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                      Toggle light / dark appearance
                    </div>
                  </div>
                </div>
                <button
                  className="btn btn-sm btn-outline-secondary theme-toggle-btn px-2.5 py-1"
                  type="button"
                  onClick={toggleTheme}
                  title="Toggle Theme"
                >
                  <i className={`fas ${isDark ? 'fa-sun text-warning' : 'fa-moon text-secondary'} me-1`}></i>
                  <span className="theme-label small">{isDark ? 'Dark' : 'Light'}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Safe Bottom Logout */}
          <div className="pt-3 border-top mt-auto">
            <button
              className="btn btn-outline-danger w-100 d-flex align-items-center justify-content-center gap-2 py-2"
              onClick={handleLogout}
            >
              <i className="fas fa-sign-out-alt"></i> <span>Sign Out of Account</span>
            </button>
          </div>
        </div>
      </div>
      {isOpen && <div className="offcanvas-backdrop fade show" onClick={onClose}></div>}
    </>
  );
}
