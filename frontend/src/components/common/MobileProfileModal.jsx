import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { getInitials, getRoleBadgeClass } from '../../utils/formatters';
import { confirm } from '../../utils/alerts';

export default function MobileProfileModal({ isOpen, onClose, onOpenNavMenu }) {
  const { user, logout } = useAuth();
  const { toggleTheme, isDark } = useTheme();
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
        id="mobileProfileModal"
        tabIndex="-1"
        aria-labelledby="mobileProfileTitle"
        aria-modal="true"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-end m-0 w-100">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header border-bottom py-3 px-3 px-sm-4 bg-light-subtle">
              <div className="d-flex align-items-center gap-2">
                <i className="fas fa-user-circle text-primary fs-5"></i>
                <h5 className="modal-title fw-bold fs-6 mb-0" id="mobileProfileTitle">
                  Account & Profile
                </h5>
              </div>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
            </div>
            <div className="modal-body pt-3 pb-4 px-3 px-sm-4">
              {/* User Info Card */}
              <div className="d-flex align-items-center gap-3 p-3 border rounded-3 mb-3 bg-light-subtle">
                <div
                  className="crm-avatar crm-avatar-lg bg-primary text-white shadow-sm d-flex align-items-center justify-content-center"
                  id="mobileSheetAvatar"
                  style={{ width: '48px', height: '48px', borderRadius: '50%', fontWeight: 'bold' }}
                >
                  {getInitials(user?.name)}
                </div>
                <div className="min-w-0">
                  <div className="fw-bold text-body text-truncate" id="mobileSheetName">
                    {user?.name || 'User'}
                  </div>
                  <div className="text-muted small text-truncate" id="mobileSheetEmail">
                    {user?.email || 'user@crm.com'}
                  </div>
                  <div className="mt-1">
                    <span className={`badge-crm ${getRoleBadgeClass(user?.role)}`} id="mobileSheetRole">
                      {user?.role || 'Sales'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Theme Toggle Row */}
              <div className="p-3 border rounded-3 d-flex align-items-center justify-content-between mb-3 bg-light-subtle">
                <div className="d-flex align-items-center gap-2.5">
                  <i className="fas fa-adjust text-primary fs-5 pe-2"></i>
                  <div>
                    <div className="small fw-semibold text-body">Appearance Theme</div>
                    <div className="text-muted" style={{ fontSize: '0.72rem' }}>
                      Switch between dark & light mode
                    </div>
                  </div>
                </div>
                <button
                  className="btn btn-sm btn-outline-secondary theme-toggle-btn py-1.5 px-3 d-flex align-items-center gap-1.5"
                  type="button"
                  onClick={toggleTheme}
                >
                  <i className={`fas ${isDark ? 'fa-sun text-warning' : 'fa-moon text-secondary'}`}></i>
                  <span className="small theme-label">{isDark ? 'Dark Mode' : 'Light Mode'}</span>
                </button>
              </div>

              {/* Quick Navigation to Full Menu Link */}
              <div className="p-2.5 px-3 border rounded-3 mb-3 bg-light-subtle d-flex align-items-center justify-content-between">
                <div className="d-flex align-items-center gap-2">
                  <i className="fas fa-th-large text-primary"></i>
                  <span className="small fw-medium">All Navigation Modules</span>
                </div>
                <button
                  className="btn btn-sm btn-outline-primary py-1 px-2.5"
                  onClick={() => {
                    onClose();
                    onOpenNavMenu();
                  }}
                >
                  View Menu
                </button>
              </div>

              {/* Secure Logout Action */}
              <div className="pt-3 border-top">
                <button
                  className="btn btn-outline-danger w-100 py-2.5 d-flex align-items-center justify-content-center gap-2 fw-semibold rounded-3"
                  onClick={handleLogout}
                >
                  <i className="fas fa-sign-out-alt"></i>
                  <span>Log Out</span>
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
