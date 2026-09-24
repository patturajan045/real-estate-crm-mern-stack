import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import leadService from '../../services/leadService';
import unitService from '../../services/unitService';
import bookingService from '../../services/bookingService';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all'); // 'all', 'pages', 'leads', 'units', 'bookings'
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Pre-cached recent browse data when opening category tabs without query
  const [recentLeads, setRecentLeads] = useState([]);
  const [recentUnits, setRecentUnits] = useState([]);
  const [recentBookings, setRecentBookings] = useState([]);
  const [loadingCategory, setLoadingCategory] = useState(false);

  const inputRef = useRef(null);
  const resultsContainerRef = useRef(null);
  const navigate = useNavigate();

  // Distinct launcher pages with vibrant gradient icons and responsive wording
  const QUICK_PAGES = useMemo(() => [
    {
      id: 'page-dash',
      title: 'Dashboard',
      category: 'Page',
      icon: 'fa-chart-pie',
      gradient: 'linear-gradient(135deg, #2563eb 0%, #38bdf8 100%)',
      desc: 'Pipeline Funnel & KPIs',
      path: '/',
      badge: 'Metrics',
    },
    {
      id: 'page-leads',
      title: 'Leads CRM',
      category: 'Page',
      icon: 'fa-users',
      gradient: 'linear-gradient(135deg, #7c3aed 0%, #a855f7 100%)',
      desc: 'Prospects & Call Logs',
      path: '/leads',
      badge: 'Sales',
    },
    {
      id: 'page-prop',
      title: 'Inventory',
      category: 'Page',
      icon: 'fa-building',
      gradient: 'linear-gradient(135deg, #059669 0%, #34d399 100%)',
      desc: 'Units, Towers & Projects',
      path: '/properties',
      badge: 'Stock',
    },
    {
      id: 'page-book',
      title: 'Bookings',
      category: 'Page',
      icon: 'fa-file-signature',
      gradient: 'linear-gradient(135deg, #d97706 0%, #fbbf24 100%)',
      desc: 'Agreements & Receipts',
      path: '/bookings',
      badge: 'Deals',
    },
    {
      id: 'page-users',
      title: 'Team & Roles',
      category: 'Page',
      icon: 'fa-user-gear',
      gradient: 'linear-gradient(135deg, #0284c7 0%, #06b6d4 100%)',
      desc: 'Staff & Permissions',
      path: '/users',
      badge: 'Admin',
    },
    {
      id: 'page-set',
      title: 'Settings CMS',
      category: 'Page',
      icon: 'fa-sliders',
      gradient: 'linear-gradient(135deg, #475569 0%, #94a3b8 100%)',
      desc: 'Dynamic Site Content',
      path: '/settings',
      badge: 'Config',
    },
  ], []);

  // Fast CRM action shortcuts
  const FAST_ACTIONS = useMemo(() => [
    { label: '+ Add Lead', icon: 'fa-user-plus', path: '/leads?action=create' },
    { label: '+ New Booking', icon: 'fa-file-signature', path: '/bookings?action=create' },
    { label: 'Available Units', icon: 'fa-door-open', path: '/properties' },
    { label: 'Pipeline Funnel', icon: 'fa-chart-simple', path: '/' },
  ], []);

  // Category filter tabs
  const FILTER_TABS = [
    { id: 'all', label: 'All', icon: 'fa-sparkles' },
    { id: 'pages', label: 'Pages', icon: 'fa-compass' },
    { id: 'leads', label: 'Leads', icon: 'fa-users' },
    { id: 'units', label: 'Units', icon: 'fa-building' },
    { id: 'bookings', label: 'Bookings', icon: 'fa-file-contract' },
  ];

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 60);
      setQuery('');
      setActiveTab('all');
      setResults([]);
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Load preview items for selected empty tab
  useEffect(() => {
    if (!isOpen || query.trim()) return;

    if (activeTab === 'leads' && recentLeads.length === 0) {
      setLoadingCategory(true);
      leadService.getLeads()
        .then((res) => {
          const list = (res?.data || []).slice(0, 6).map((l) => ({
            id: `lead-${l._id}`,
            title: l.customerName,
            category: 'Lead',
            icon: 'fa-user-tag',
            desc: `${l.stage} · ${l.phoneNumber || l.email || 'No phone'}`,
            extra: l.stage,
            path: `/leads?search=${encodeURIComponent(l.customerName)}`,
          }));
          setRecentLeads(list);
        })
        .catch(() => {})
        .finally(() => setLoadingCategory(false));
    } else if (activeTab === 'units' && recentUnits.length === 0) {
      setLoadingCategory(true);
      unitService.getUnits()
        .then((res) => {
          const list = (res?.data || []).slice(0, 6).map((u) => ({
            id: `unit-${u._id}`,
            title: `Unit ${u.unitNumber} (${u.unitType})`,
            category: 'Unit',
            icon: 'fa-door-open',
            desc: `${u.status} · ${u.project?.name || 'Project'} · Floor ${u.floor ?? '-'}`,
            extra: u.status,
            path: `/properties?search=${encodeURIComponent(u.unitNumber)}`,
          }));
          setRecentUnits(list);
        })
        .catch(() => {})
        .finally(() => setLoadingCategory(false));
    } else if (activeTab === 'bookings' && recentBookings.length === 0) {
      setLoadingCategory(true);
      bookingService.getBookings()
        .then((res) => {
          const list = (res?.data || []).slice(0, 6).map((b) => ({
            id: `booking-${b._id}`,
            title: b.bookingNumber ? `Booking #${b.bookingNumber}` : `Booking (${b.lead?.customerName || 'Lead'})`,
            category: 'Booking',
            icon: 'fa-file-invoice',
            desc: `${b.status} · Unit ${b.unit?.unitNumber || '-'} · ${b.lead?.customerName || 'Client'}`,
            extra: b.status,
            path: `/bookings`,
          }));
          setRecentBookings(list);
        })
        .catch(() => {})
        .finally(() => setLoadingCategory(false));
    }
  }, [activeTab, isOpen, query, recentLeads.length, recentUnits.length, recentBookings.length]);

  // Debounced search across API and Pages
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setSelectedIndex(0);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const q = query.trim().toLowerCase();

        // 1. Pages Match
        const matchedPages = QUICK_PAGES.filter(
          (p) =>
            p.title.toLowerCase().includes(q) ||
            p.desc.toLowerCase().includes(q) ||
            p.badge.toLowerCase().includes(q)
        ).map((p) => ({
          id: p.id,
          title: p.title,
          category: 'Page',
          icon: p.icon,
          gradient: p.gradient,
          desc: p.desc,
          extra: p.badge,
          path: p.path,
        }));

        // 2. Fetch matched Leads, Units & Bookings in parallel
        const [leadRes, unitRes, bookingRes] = await Promise.all([
          leadService.getLeads({ search: q }).catch(() => ({ status: 'error', data: [] })),
          unitService.getUnits().catch(() => ({ status: 'error', data: [] })),
          bookingService.getBookings().catch(() => ({ status: 'error', data: [] })),
        ]);

        const leadMatches = (leadRes?.data || [])
          .filter(
            (l) =>
              l.customerName?.toLowerCase().includes(q) ||
              l.phoneNumber?.includes(q) ||
              l.email?.toLowerCase().includes(q) ||
              l.stage?.toLowerCase().includes(q)
          )
          .slice(0, 5)
          .map((l) => ({
            id: `lead-${l._id}`,
            title: l.customerName,
            category: 'Lead',
            icon: 'fa-user-tag',
            desc: `${l.stage} · ${l.phoneNumber || l.email || 'Contact'}`,
            extra: l.stage,
            path: `/leads?search=${encodeURIComponent(l.customerName)}`,
          }));

        const unitMatches = (unitRes?.data || [])
          .filter(
            (u) =>
              u.unitNumber?.toLowerCase().includes(q) ||
              u.unitType?.toLowerCase().includes(q) ||
              u.status?.toLowerCase().includes(q) ||
              u.project?.name?.toLowerCase().includes(q) ||
              u.building?.name?.toLowerCase().includes(q)
          )
          .slice(0, 5)
          .map((u) => ({
            id: `unit-${u._id}`,
            title: `Unit ${u.unitNumber} (${u.unitType})`,
            category: 'Unit',
            icon: 'fa-door-open',
            desc: `${u.status} · ${u.project?.name || 'Project'} · Floor ${u.floor ?? '-'}`,
            extra: u.status,
            path: `/properties?search=${encodeURIComponent(u.unitNumber)}`,
          }));

        const bookingMatches = (bookingRes?.data || [])
          .filter(
            (b) =>
              b.bookingNumber?.toLowerCase().includes(q) ||
              b.lead?.customerName?.toLowerCase().includes(q) ||
              b.unit?.unitNumber?.toLowerCase().includes(q) ||
              b.status?.toLowerCase().includes(q)
          )
          .slice(0, 5)
          .map((b) => ({
            id: `booking-${b._id}`,
            title: b.bookingNumber ? `Booking #${b.bookingNumber}` : `Booking for ${b.lead?.customerName || 'Unit'}`,
            category: 'Booking',
            icon: 'fa-file-invoice',
            desc: `${b.status} · Unit ${b.unit?.unitNumber || '-'} · ${b.lead?.customerName || 'Client'}`,
            extra: b.status,
            path: `/bookings`,
          }));

        const combined = [...matchedPages, ...leadMatches, ...unitMatches, ...bookingMatches];
        setResults(combined);
        setSelectedIndex(0);
      } catch {
        // Fallback gracefully
      } finally {
        setSearching(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [query, QUICK_PAGES]);

  if (!isOpen) return null;

  // Filter items based on activeTab
  const visibleResults = results.filter((item) => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pages') return item.category === 'Page';
    if (activeTab === 'leads') return item.category === 'Lead';
    if (activeTab === 'units') return item.category === 'Unit';
    if (activeTab === 'bookings') return item.category === 'Booking';
    return true;
  });

  const handleSelect = (item) => {
    navigate(item.path);
    onClose();
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      onClose();
      return;
    }

    if (query.trim() !== '') {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < visibleResults.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter' && visibleResults[selectedIndex]) {
        e.preventDefault();
        handleSelect(visibleResults[selectedIndex]);
      }
    }
  };

  const getCategoryBadgeClass = (category) => {
    switch (category) {
      case 'Lead':
        return 'bg-purple-subtle text-purple border-purple-subtle';
      case 'Unit':
        return 'bg-success-subtle text-success border-success-subtle';
      case 'Booking':
        return 'bg-warning-subtle text-warning-emphasis border-warning-subtle';
      default:
        return 'bg-primary-subtle text-primary border-primary-subtle';
    }
  };

  const getStatusPillClass = (status) => {
    switch (status?.toLowerCase()) {
      case 'available':
      case 'won':
      case 'confirmed':
        return 'badge bg-success-subtle text-success border border-success-subtle';
      case 'booked':
      case 'hot':
      case 'urgent':
        return 'badge bg-danger-subtle text-danger border border-danger-subtle';
      case 'warm':
      case 'draft':
      case 'pending':
        return 'badge bg-warning-subtle text-warning-emphasis border border-warning-subtle';
      default:
        return 'badge bg-secondary-subtle text-secondary border border-secondary-subtle';
    }
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.72)', backdropFilter: 'blur(8px)', zIndex: 1060 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-dialog modal-dialog-centered crm-search-modal-dialog">
        <div className="modal-content crm-search-modal-content">
          {/* Header Search Input Bar (No placeholder attribute) */}
          <div className="d-flex align-items-center px-3 py-2.5 border-bottom bg-body position-relative">
            <i className="fas fa-search text-primary me-2.5 fs-5"></i>
            <input
              ref={inputRef}
              type="text"
              className="form-control border-0 shadow-none px-0 fs-6 bg-transparent"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              autoComplete="off"
              aria-label="Search Real Estate Flow CRM"
            />
            {query.trim() !== '' && (
              <button
                type="button"
                className="btn btn-sm btn-link text-muted p-0 me-2"
                onClick={() => {
                  setQuery('');
                  inputRef.current?.focus();
                }}
                title="Clear query"
                aria-label="Clear query"
              >
                <i className="fas fa-circle-xmark fs-6"></i>
              </button>
            )}
            {searching && (
              <span className="spinner-border spinner-border-sm text-primary me-2 flex-shrink-0" role="status"></span>
            )}
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center p-0 rounded-circle flex-shrink-0"
              onClick={onClose}
              title="Close search"
              aria-label="Close search"
              style={{ width: '32px', height: '32px' }}
            >
              <i className="fas fa-times small"></i>
            </button>
          </div>

          {/* Category Filter Chips Bar */}
          <div className="crm-search-chips-container">
            {FILTER_TABS.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  className={`crm-search-chip ${isActive ? 'active' : ''}`}
                  onClick={() => setActiveTab(tab.id)}
                >
                  <i className={`fas ${tab.icon} small`}></i>
                  <span>{tab.label}</span>
                  {query.trim() !== '' && (
                    <span className="chip-count">
                      {tab.id === 'all'
                        ? results.length
                        : results.filter(
                            (r) =>
                              (tab.id === 'pages' && r.category === 'Page') ||
                              (tab.id === 'leads' && r.category === 'Lead') ||
                              (tab.id === 'units' && r.category === 'Unit') ||
                              (tab.id === 'bookings' && r.category === 'Booking')
                          ).length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Modal Body Container */}
          <div
            ref={resultsContainerRef}
            className="p-3"
            style={{
              maxHeight: 'clamp(320px, 60vh, 460px)',
              overflowY: 'auto',
              WebkitOverflowScrolling: 'touch',
            }}
          >
            {/* Zero-Query State */}
            {query.trim() === '' ? (
              <div>
                {/* When 'all' or 'pages' selected: show advanced responsive Quick Navigation launcher */}
                {(activeTab === 'all' || activeTab === 'pages') && (
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="small fw-bold text-muted text-uppercase tracking-wider" style={{ fontSize: '0.72rem' }}>
                        <i className="fas fa-compass text-primary me-1.5"></i> Quick Navigation
                      </span>
                      <span className="text-muted small" style={{ fontSize: '0.7rem' }}>
                        Fast Page Access
                      </span>
                    </div>

                    {/* Responsive Launcher Cards Grid: 2 columns on mobile, 3 columns on tablet/desktop */}
                    <div className="row g-2 g-sm-2.5 mb-3">
                      {QUICK_PAGES.map((page) => (
                        <div key={page.id} className="col-6 col-sm-4">
                          <button
                            type="button"
                            className="crm-search-launcher-card"
                            onClick={() => handleSelect(page)}
                            title={page.title}
                          >
                            <div
                              className="crm-search-launcher-icon"
                              style={{ background: page.gradient }}
                            >
                              <i className={`fas ${page.icon}`}></i>
                            </div>
                            <div className="crm-search-launcher-title">
                              {page.title}
                            </div>
                            <div className="crm-search-launcher-desc">
                              {page.desc}
                            </div>
                          </button>
                        </div>
                      ))}
                    </div>

                    {/* Fast CRM Actions Bar */}
                    <div className="pt-2 border-top">
                      <div className="small fw-bold text-muted text-uppercase tracking-wider mb-2" style={{ fontSize: '0.72rem' }}>
                        <i className="fas fa-bolt text-warning me-1.5"></i> Fast CRM Actions
                      </div>
                      <div className="d-flex flex-wrap gap-1.5">
                        {FAST_ACTIONS.map((action, idx) => (
                          <button
                            key={idx}
                            type="button"
                            className="crm-search-fast-action"
                            onClick={() => {
                              navigate(action.path);
                              onClose();
                            }}
                          >
                            <i className={`fas ${action.icon} text-primary small`}></i>
                            <span>{action.label}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* When 'leads' tab selected: show recent leads preview */}
                {activeTab === 'leads' && (
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="small fw-bold text-muted text-uppercase tracking-wider" style={{ fontSize: '0.72rem' }}>
                        <i className="fas fa-users text-primary me-1.5"></i> Recent CRM Leads
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm btn-link p-0 text-decoration-none small"
                        onClick={() => {
                          navigate('/leads');
                          onClose();
                        }}
                      >
                        View All Leads &rarr;
                      </button>
                    </div>

                    {loadingCategory ? (
                      <div className="text-center py-4 text-muted small">
                        <span className="spinner-border spinner-border-sm me-1.5 text-primary"></span> Loading leads...
                      </div>
                    ) : recentLeads.length === 0 ? (
                      <div className="text-center py-4 text-muted small">
                        No leads registered yet. Click below to add your first lead.
                      </div>
                    ) : (
                      <div className="d-flex flex-column gap-1">
                        {recentLeads.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            className="crm-search-result-row"
                            onClick={() => handleSelect(item)}
                          >
                            <div className="crm-search-result-icon bg-purple-subtle text-purple">
                              <i className="fas fa-user-tag"></i>
                            </div>
                            <div className="flex-grow-1 min-w-0">
                              <div className="d-flex align-items-center gap-1.5 flex-wrap">
                                <span className="fw-semibold text-body small">{item.title}</span>
                                <span className={getStatusPillClass(item.extra)} style={{ fontSize: '0.65rem' }}>
                                  {item.extra}
                                </span>
                              </div>
                              <div className="text-muted small text-truncate" style={{ fontSize: '0.72rem' }}>
                                {item.desc}
                              </div>
                            </div>
                            <i className="fas fa-arrow-right text-muted small"></i>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* When 'units' tab selected: show inventory preview */}
                {activeTab === 'units' && (
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="small fw-bold text-muted text-uppercase tracking-wider" style={{ fontSize: '0.72rem' }}>
                        <i className="fas fa-building text-primary me-1.5"></i> Property Inventory Units
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm btn-link p-0 text-decoration-none small"
                        onClick={() => {
                          navigate('/properties');
                          onClose();
                        }}
                      >
                        View Inventory &rarr;
                      </button>
                    </div>

                    {loadingCategory ? (
                      <div className="text-center py-4 text-muted small">
                        <span className="spinner-border spinner-border-sm me-1.5 text-primary"></span> Loading units...
                      </div>
                    ) : recentUnits.length === 0 ? (
                      <div className="text-center py-4 text-muted small">
                        No property units available yet.
                      </div>
                    ) : (
                      <div className="d-flex flex-column gap-1">
                        {recentUnits.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            className="crm-search-result-row"
                            onClick={() => handleSelect(item)}
                          >
                            <div className="crm-search-result-icon bg-success-subtle text-success">
                              <i className="fas fa-door-open"></i>
                            </div>
                            <div className="flex-grow-1 min-w-0">
                              <div className="d-flex align-items-center gap-1.5 flex-wrap">
                                <span className="fw-semibold text-body small">{item.title}</span>
                                <span className={getStatusPillClass(item.extra)} style={{ fontSize: '0.65rem' }}>
                                  {item.extra}
                                </span>
                              </div>
                              <div className="text-muted small text-truncate" style={{ fontSize: '0.72rem' }}>
                                {item.desc}
                              </div>
                            </div>
                            <i className="fas fa-arrow-right text-muted small"></i>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* When 'bookings' tab selected: show bookings preview */}
                {activeTab === 'bookings' && (
                  <div>
                    <div className="d-flex align-items-center justify-content-between mb-2">
                      <span className="small fw-bold text-muted text-uppercase tracking-wider" style={{ fontSize: '0.72rem' }}>
                        <i className="fas fa-file-contract text-primary me-1.5"></i> Bookings & Agreements
                      </span>
                      <button
                        type="button"
                        className="btn btn-sm btn-link p-0 text-decoration-none small"
                        onClick={() => {
                          navigate('/bookings');
                          onClose();
                        }}
                      >
                        View All Bookings &rarr;
                      </button>
                    </div>

                    {loadingCategory ? (
                      <div className="text-center py-4 text-muted small">
                        <span className="spinner-border spinner-border-sm me-1.5 text-primary"></span> Loading bookings...
                      </div>
                    ) : recentBookings.length === 0 ? (
                      <div className="text-center py-4 text-muted small">
                        No property bookings created yet.
                      </div>
                    ) : (
                      <div className="d-flex flex-column gap-1">
                        {recentBookings.map((item) => (
                          <button
                            key={item.id}
                            type="button"
                            className="crm-search-result-row"
                            onClick={() => handleSelect(item)}
                          >
                            <div className="crm-search-result-icon bg-warning-subtle text-warning-emphasis">
                              <i className="fas fa-file-signature"></i>
                            </div>
                            <div className="flex-grow-1 min-w-0">
                              <div className="d-flex align-items-center gap-1.5 flex-wrap">
                                <span className="fw-semibold text-body small">{item.title}</span>
                                <span className={getStatusPillClass(item.extra)} style={{ fontSize: '0.65rem' }}>
                                  {item.extra}
                                </span>
                              </div>
                              <div className="text-muted small text-truncate" style={{ fontSize: '0.72rem' }}>
                                {item.desc}
                              </div>
                            </div>
                            <i className="fas fa-arrow-right text-muted small"></i>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : visibleResults.length === 0 && !searching ? (
              /* No Results Zero State */
              <div className="py-5 px-3 text-center">
                <div
                  className="rounded-circle bg-body-tertiary d-inline-flex align-items-center justify-content-center text-muted mb-2"
                  style={{ width: '48px', height: '48px' }}
                >
                  <i className="fas fa-search fs-5 opacity-50"></i>
                </div>
                <div className="fw-semibold text-body small mb-1">
                  No results for "{query}"
                </div>
                <div className="text-muted small" style={{ fontSize: '0.76rem' }}>
                  Try searching by customer name, unit number, tower, or switch category tab.
                </div>
              </div>
            ) : (
              /* Search Results List */
              <div>
                <div className="d-flex align-items-center justify-content-between mb-2 px-1">
                  <span className="small text-muted fw-bold text-uppercase" style={{ fontSize: '0.7rem' }}>
                    Results ({visibleResults.length})
                  </span>
                  <span className="text-muted small" style={{ fontSize: '0.7rem' }}>
                    Use &uarr;&darr; keys to navigate
                  </span>
                </div>

                <div className="d-flex flex-column gap-1">
                  {visibleResults.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    return (
                      <button
                        key={item.id || idx}
                        type="button"
                        className={`crm-search-result-row ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                      >
                        <div
                          className="crm-search-result-icon"
                          style={{
                            background: item.gradient || undefined,
                            backgroundColor: !item.gradient ? 'var(--crm-bg)' : undefined,
                          }}
                        >
                          <i className={`fas ${item.icon} ${item.gradient ? 'text-white' : 'text-primary'}`}></i>
                        </div>
                        <div className="flex-grow-1 min-w-0">
                          <div className="d-flex align-items-center gap-1.5 flex-wrap">
                            <span className="fw-semibold text-body small text-truncate">
                              {item.title}
                            </span>
                            <span
                              className={`badge border micro-badge ${getCategoryBadgeClass(item.category)}`}
                              style={{ fontSize: '0.65rem' }}
                            >
                              {item.category}
                            </span>
                            {item.extra && item.category !== 'Page' && (
                              <span className={getStatusPillClass(item.extra)} style={{ fontSize: '0.62rem' }}>
                                {item.extra}
                              </span>
                            )}
                          </div>
                          <div className="text-muted small text-truncate" style={{ fontSize: '0.72rem' }}>
                            {item.desc}
                          </div>
                        </div>
                        <i className={`fas fa-arrow-right small ${isSelected ? 'text-primary' : 'text-muted'}`}></i>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Footer Guide & Branding */}
          <div className="px-3 py-2 bg-body-tertiary border-top d-flex align-items-center justify-content-between small text-muted">
            <span className="d-none d-sm-inline" style={{ fontSize: '0.72rem' }}>
              Press <kbd className="badge bg-body border text-muted">ESC</kbd> to exit &bull; <kbd className="badge bg-body border text-muted">&uarr;&darr;</kbd> to navigate
            </span>
            <span className="d-sm-none" style={{ fontSize: '0.72rem' }}>
              Tap any item to jump
            </span>
            <span className="text-truncate ms-2 fw-semibold text-primary" style={{ fontSize: '0.74rem' }}>
              Real Estate Flow Search
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
