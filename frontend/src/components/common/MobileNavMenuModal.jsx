import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { confirm } from '../../utils/alerts';

export default function MobileNavMenuModal({ isOpen, onClose }) {
  const { logout, hasRole } = useAuth();
  const { toggleTheme } = useTheme();
  const navigate = useNavigate();

  if (!isOpen) return null;

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
        className="modal fade modal-bottom-sheet show d-block"
        id="mobileNavMenuModal"
        tabIndex="-1"
        aria-labelledby="mobileNavMenuTitle"
        aria-modal="true"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-end m-0 w-100">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header border-bottom py-2.5 px-3 bg-light-subtle">
              <div className="d-flex align-items-center gap-2">
                <div
                  className="sidebar-brand-icon d-inline-flex align-items-center justify-content-center"
                  style={{ fontSize: '1.1rem' }}
                >
                  <i className="fas fa-th-large"></i>
                </div>
                <div>
                  <h5 className="modal-title fw-bold fs-6 mb-0" id="mobileNavMenuTitle">
                    Navigation Hub
                  </h5>
                  <div className="text-muted" style={{ fontSize: '0.7rem' }}>
                    Quick Module Access
                  </div>
                </div>
              </div>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
            </div>
            <div className="modal-body p-3">
              {/* Clean 2-Column App Launcher Grid */}
              <div className="row g-2 mb-3">
                {/* Dashboard */}
                <div className="col-6">
                  <NavLink
                    to="/dashboard"
                    className={({ isActive }) => `mobile-hub-tile ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    <div className="hub-tile-icon icon-primary">
                      <i className="fas fa-chart-line"></i>
                    </div>
                    <div className="hub-tile-name">Dashboard</div>
                    <div className="hub-tile-tag">Overview</div>
                  </NavLink>
                </div>

                {/* Leads */}
                <div className="col-6">
                  <NavLink
                    to="/leads"
                    className={({ isActive }) => `mobile-hub-tile ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    <div className="hub-tile-icon icon-purple">
                      <i className="fas fa-user-tag"></i>
                    </div>
                    <div className="hub-tile-name">Leads</div>
                    <div className="hub-tile-tag">Pipeline</div>
                  </NavLink>
                </div>

                {/* Bookings */}
                <div className="col-6">
                  <NavLink
                    to="/bookings"
                    className={({ isActive }) => `mobile-hub-tile ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    <div className="hub-tile-icon icon-emerald">
                      <i className="fas fa-file-signature"></i>
                    </div>
                    <div className="hub-tile-name">Bookings</div>
                    <div className="hub-tile-tag">Contracts</div>
                  </NavLink>
                </div>

                {/* Properties */}
                <div className="col-6">
                  <NavLink
                    to="/properties"
                    className={({ isActive }) => `mobile-hub-tile ${isActive ? 'active' : ''}`}
                    onClick={onClose}
                  >
                    <div className="hub-tile-icon icon-cyan">
                      <i className="fas fa-city"></i>
                    </div>
                    <div className="hub-tile-name">Properties</div>
                    <div className="hub-tile-tag">Inventory</div>
                  </NavLink>
                </div>

                {/* Users / Staff (Role Protected) */}
                {hasRole(['Super Admin', 'Admin']) && (
                  <div className="col-6">
                    <NavLink
                      to="/users"
                      className={({ isActive }) => `mobile-hub-tile ${isActive ? 'active' : ''}`}
                      onClick={onClose}
                    >
                      <div className="hub-tile-icon icon-amber">
                        <i className="fas fa-users-cog"></i>
                      </div>
                      <div className="hub-tile-name">Team</div>
                      <div className="hub-tile-tag">Staff & Roles</div>
                    </NavLink>
                  </div>
                )}

                {/* Platform Settings (Role Protected) */}
                {hasRole(['Super Admin']) && (
                  <div className="col-6">
                    <NavLink
                      to="/settings"
                      className={({ isActive }) => `mobile-hub-tile ${isActive ? 'active' : ''}`}
                      onClick={onClose}
                    >
                      <div className="hub-tile-icon icon-slate">
                        <i className="fas fa-sliders-h"></i>
                      </div>
                      <div className="hub-tile-name">Settings</div>
                      <div className="hub-tile-tag">CMS & Platform</div>
                    </NavLink>
                  </div>
                )}
              </div>

              {/* Bottom Actions Strip */}
              <div className="d-flex align-items-center justify-content-between p-2 px-2.5 rounded-3 border bg-light-subtle">
                <button
                  type="button"
                  className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center gap-1.5 py-1 px-2.5"
                  onClick={toggleTheme}
                  title="Switch Theme"
                >
                  <i className="fas fa-moon fs-6"></i>
                  <span className="small">Appearance</span>
                </button>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-danger d-inline-flex align-items-center gap-1.5 py-1 px-2.5"
                  onClick={handleLogout}
                  title="Log out"
                >
                  <i className="fas fa-sign-out-alt"></i>
                  <span className="small">Sign Out</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
    </>
  );
}
