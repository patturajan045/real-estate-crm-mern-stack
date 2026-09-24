import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Navbar from '../components/common/Navbar';
import MobileBottomNav from '../components/common/MobileBottomNav';
import ProfileDrawer from '../components/common/ProfileDrawer';
import MobileProfileModal from '../components/common/MobileProfileModal';
import MobileNavMenuModal from '../components/common/MobileNavMenuModal';
import MobileQuickActionModal from '../components/common/MobileQuickActionModal';
import GlobalSearchModal from '../components/common/GlobalSearchModal';

export default function MainLayout() {
  const [isCollapsed, setIsCollapsed] = useState(() => {
    return localStorage.getItem('crm_sidebar_collapsed') === 'true';
  });
  const [isProfileDrawerOpen, setIsProfileDrawerOpen] = useState(false);
  const [isMobileProfileOpen, setIsMobileProfileOpen] = useState(false);
  const [isMobileNavMenuOpen, setIsMobileNavMenuOpen] = useState(false);
  const [isMobileQuickActionOpen, setIsMobileQuickActionOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);

  const location = useLocation();

  const toggleSidebarCollapse = () => {
    setIsCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem('crm_sidebar_collapsed', next ? 'true' : 'false');
      return next;
    });
  };

  // Keyboard shortcut listener for Global Search (Cmd+K / Ctrl+K)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsSearchModalOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Compute navContext based on current route
  const getNavContext = () => {
    const path = location.pathname;
    if (path.startsWith('/leads')) return 'Leads Pipeline';
    if (path.startsWith('/bookings')) return 'Bookings & Agreements';
    if (path.startsWith('/properties')) return 'Properties & Inventory';
    if (path.startsWith('/users')) return 'Users & Team Management';
    if (path.startsWith('/settings')) return 'Platform CMS Settings';
    return 'Executive Overview';
  };

  // Close modals on route change
  useEffect(() => {
    setIsMobileProfileOpen(false);
    setIsMobileNavMenuOpen(false);
    setIsMobileQuickActionOpen(false);
    setIsSearchModalOpen(false);
  }, [location.pathname]);

  return (
    <div className={`crm-wrapper ${isCollapsed ? 'sidebar-collapsed' : ''}`}>
      <Sidebar isCollapsed={isCollapsed} onToggleCollapse={toggleSidebarCollapse} />

      <div className="crm-main">
        <Navbar
          navContext={getNavContext()}
          onOpenProfileDrawer={() => setIsProfileDrawerOpen(true)}
          onOpenMobileProfile={() => setIsMobileProfileOpen(true)}
          onOpenSearch={() => setIsSearchModalOpen(true)}
        />

        <main className="crm-content">
          <div className="crm-content-container">
            <Outlet />
          </div>
        </main>
      </div>

      <MobileBottomNav
        onOpenQuickAction={() => setIsMobileQuickActionOpen(true)}
        onOpenNavMenu={() => setIsMobileNavMenuOpen(true)}
      />

      <ProfileDrawer isOpen={isProfileDrawerOpen} onClose={() => setIsProfileDrawerOpen(false)} />

      <MobileProfileModal
        isOpen={isMobileProfileOpen}
        onClose={() => setIsMobileProfileOpen(false)}
        onOpenNavMenu={() => setIsMobileNavMenuOpen(true)}
      />

      <MobileNavMenuModal
        isOpen={isMobileNavMenuOpen}
        onClose={() => setIsMobileNavMenuOpen(false)}
      />

      <MobileQuickActionModal
        isOpen={isMobileQuickActionOpen}
        onClose={() => setIsMobileQuickActionOpen(false)}
      />

      <GlobalSearchModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
      />
    </div>
  );
}
