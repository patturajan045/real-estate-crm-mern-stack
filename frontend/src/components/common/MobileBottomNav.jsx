import React from 'react';
import { NavLink } from 'react-router-dom';

export default function MobileBottomNav({ onOpenQuickAction, onOpenNavMenu }) {
  return (
    <nav className="crm-bottom-nav d-flex d-md-none align-items-center justify-content-around" id="crmBottomNav">
      <NavLink
        to="/dashboard"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        title="Dashboard"
      >
        <i className="fas fa-home"></i>
        <span>Home</span>
      </NavLink>

      <NavLink
        to="/leads"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        title="Leads"
      >
        <i className="fas fa-user-tag"></i>
        <span>Leads</span>
      </NavLink>

      {/* Center Emphasized Quick Action Button */}
      <div className="bottom-nav-fab-wrapper">
        <button
          className="btn bottom-nav-fab"
          type="button"
          onClick={onOpenQuickAction}
          aria-label="Quick Actions"
          title="Quick Actions"
        >
          <i className="fas fa-plus"></i>
        </button>
      </div>

      <NavLink
        to="/bookings"
        className={({ isActive }) => `bottom-nav-item ${isActive ? 'active' : ''}`}
        title="Bookings"
      >
        <i className="fas fa-file-signature"></i>
        <span>Bookings</span>
      </NavLink>

      <button
        className="bottom-nav-item border-0 bg-transparent"
        id="bottomNavMenuBtn"
        type="button"
        onClick={onOpenNavMenu}
        title="All Navigation & Modules"
        aria-label="Menu"
      >
        <i className="fas fa-bars-staggered"></i>
        <span>Menu</span>
      </button>
    </nav>
  );
}
