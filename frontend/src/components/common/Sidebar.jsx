import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCms } from '../../context/CmsContext';
import { getInitials, getRoleBadgeClass } from '../../utils/formatters';
import { confirm } from '../../utils/alerts';

export default function Sidebar({ isCollapsed, onToggleCollapse }) {
  const { user, logout, hasRole } = useAuth();
  const { t } = useCms();
  const navigate = useNavigate();

  const handleLogout = async () => {
    const confirmed = await confirm('Log Out?', 'Are you sure you want to log out of Real Estate CRM?', 'Yes, Log out');
    if (confirmed) {
      await logout();
      navigate('/login');
    }
  };

  const handleBrandClick = (e) => {
    if (isCollapsed && window.innerWidth >= 992) {
      e.preventDefault();
      onToggleCollapse();
    }
  };

  return (
    <aside
      className="crm-sidebar offcanvas-lg offcanvas-start"
      tabIndex="-1"
      id="sidebar"
      aria-labelledby="sidebarBrandTitle"
    >
      <div className="sidebar-brand">
        <div className="sidebar-brand-identity d-flex align-items-center gap-2.5 min-w-0">
          <NavLink
            to="/dashboard"
            className="sidebar-brand-logo-wrapper position-relative text-decoration-none"
            id="sidebarBrandLogoLink"
            onClick={handleBrandClick}
            title={isCollapsed ? 'Click brand icon to expand sidebar' : 'EstateFlow CRM Overview'}
            aria-label="EstateFlow CRM Overview"
          >
            <div className="sidebar-brand-icon d-inline-flex align-items-center justify-content-center">
              <i className="fas fa-city"></i>
            </div>
            <span className="sidebar-brand-status-dot" title="Platform Active"></span>
            <span className="sidebar-expand-arrow-hint" aria-hidden="true">
              <i className="fas fa-chevron-right"></i>
            </span>
          </NavLink>
          <div className="brand-text-block min-w-0">
            <div className="d-flex align-items-center gap-1.5 line-height-1">
              <span className="brand-title fw-bold text-truncate" id="sidebarBrandTitle">
                {t('nav_brand_name', 'Real Estate CRM')}
              </span>
            </div>
            <div className="brand-subtitle text-truncate">
              {t('nav_brand_subtitle', 'Find Your Dream Property')}
            </div>
          </div>
        </div>

        {/* Desktop Collapse/Expand Button */}
        <button
          type="button"
          className="btn-sidebar-toggle btn-sidebar-collapse d-none d-lg-inline-flex"
          id="sidebarToggleBtn"
          onClick={onToggleCollapse}
          title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          <i
            className={`fas ${isCollapsed ? 'fa-chevron-right' : 'fa-chevron-left'}`}
            id="sidebarCollapseIcon"
          ></i>
        </button>

        {/* Mobile Close Button */}
        <button
          type="button"
          className="btn-sidebar-close d-lg-none"
          data-bs-dismiss="offcanvas"
          data-bs-target="#sidebar"
          aria-label="Close sidebar navigation"
          title="Close menu"
        >
          <i className="fas fa-xmark"></i>
        </button>
      </div>

      <ul className="sidebar-menu">
        <li className="menu-header">{t('nav_menu_overview', 'Overview')}</li>
        <li className="nav-item">
          <NavLink
            to="/dashboard"
            className={({ isActive }) => `nav-link-crm ${isActive ? 'active' : ''}`}
            id="navDashboard"
            title="Dashboard"
          >
            <i className="fas fa-chart-line"></i>
            <span>{t('nav_menu_dashboard', 'Dashboard')}</span>
          </NavLink>
        </li>

        <li className="menu-header">{t('nav_menu_pipeline', 'Sales Pipeline')}</li>
        <li className="nav-item">
          <NavLink
            to="/leads"
            className={({ isActive }) => `nav-link-crm ${isActive ? 'active' : ''}`}
            id="navLeads"
            title="Leads Pipeline"
          >
            <i className="fas fa-user-tag"></i>
            <span>{t('nav_menu_leads', 'Leads')}</span>
          </NavLink>
        </li>
        <li className="nav-item">
          <NavLink
            to="/bookings"
            className={({ isActive }) => `nav-link-crm ${isActive ? 'active' : ''}`}
            id="navBookings"
            title="Bookings & Agreements"
          >
            <i className="fas fa-file-signature"></i>
            <span>{t('nav_menu_bookings', 'Bookings')}</span>
          </NavLink>
        </li>

        <li className="menu-header">{t('nav_menu_inventory', 'Inventory')}</li>
        <li className="nav-item">
          <NavLink
            to="/properties"
            className={({ isActive }) => `nav-link-crm ${isActive ? 'active' : ''}`}
            id="navProperties"
            title="Properties & Units"
          >
            <i className="fas fa-city"></i>
            <span>{t('nav_menu_properties', 'Properties & Units')}</span>
          </NavLink>
        </li>

        {hasRole(['Super Admin', 'Admin']) && (
          <>
            <li className="menu-header">{t('nav_menu_admin', 'Administration')}</li>
            <li className="nav-item">
              <NavLink
                to="/users"
                className={({ isActive }) => `nav-link-crm ${isActive ? 'active' : ''}`}
                id="navUsers"
                title="Users & Team"
              >
                <i className="fas fa-users-cog"></i>
                <span>{t('nav_menu_users', 'Users & Team')}</span>
              </NavLink>
            </li>
          </>
        )}

        {hasRole(['Super Admin']) && (
          <li className="nav-item">
            <NavLink
              to="/settings"
              className={({ isActive }) => `nav-link-crm ${isActive ? 'active' : ''}`}
              id="navSettings"
              title="Platform Settings"
            >
              <i className="fas fa-sliders-h"></i>
              <span>{t('nav_menu_settings', 'Platform Settings')}</span>
            </NavLink>
          </li>
        )}
      </ul>

      {/* Sidebar User Profile Footer */}
      <div className="sidebar-footer">
        <div className="user-profile-badge">
          <div className="user-avatar position-relative" id="navUserAvatar">
            {getInitials(user?.name)}
            <span className="user-online-status-dot position-absolute" title="Online"></span>
          </div>
          <div className="overflow-hidden me-auto user-info-block">
            <div className="fw-semibold text-break user-name-full" id="navUserName" title={user?.name || 'User'}>
              {user?.name || 'User'}
            </div>
            <div className="mt-0.5">
              <span className={`badge-crm ${getRoleBadgeClass(user?.role)} micro-badge`} id="navUserRole">
                {user?.role || 'Employee'}
              </span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary border-0 p-1 flex-shrink-0 d-none d-lg-inline-flex btn-logout-desktop"
            title="Log out"
            onClick={handleLogout}
          >
            <i className="fas fa-sign-out-alt text-danger"></i>
          </button>
        </div>
      </div>
    </aside>
  );
}
