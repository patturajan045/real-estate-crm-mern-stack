import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import leadService from '../../services/leadService';
import unitService from '../../services/unitService';
import bookingService from '../../services/bookingService';

export default function GlobalSearchModal({ isOpen, onClose }) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  const QUICK_PAGES = [
    { title: 'Dashboard', icon: 'fa-chart-line', path: '/', category: 'Page', desc: 'KPI metrics, pipeline funnel, and follow-ups' },
    { title: 'Leads Management', icon: 'fa-users', path: '/leads', category: 'Page', desc: 'Manage prospect pipeline & call notes' },
    { title: 'Property Inventory', icon: 'fa-building', path: '/properties', category: 'Page', desc: 'Units, master projects & towers' },
    { title: 'Bookings & Agreements', icon: 'fa-file-signature', path: '/bookings', category: 'Page', desc: 'Reservation contracts & payments' },
    { title: 'Users & Team', icon: 'fa-user-gear', path: '/users', category: 'Page', desc: 'Staff roles & account permissions' },
    { title: 'Platform Settings', icon: 'fa-sliders', path: '/settings', category: 'Page', desc: 'Dynamic CMS content & headings' },
  ];

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  // Debounced search across API
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const q = query.trim().toLowerCase();
        
        // Filter local quick pages first
        const matchedPages = QUICK_PAGES.filter(
          (p) => p.title.toLowerCase().includes(q) || p.desc.toLowerCase().includes(q)
        );

        // Fetch matched leads & units in parallel
        const [leadRes, unitRes] = await Promise.all([
          leadService.getLeads({ search: q }).catch(() => ({ status: 'error', data: [] })),
          unitService.getUnits().catch(() => ({ status: 'error', data: [] })),
        ]);

        const leadMatches = (leadRes?.data || [])
          .filter((l) => l.customerName?.toLowerCase().includes(q) || l.phoneNumber?.includes(q) || l.email?.toLowerCase().includes(q))
          .slice(0, 4)
          .map((l) => ({
            title: l.customerName,
            category: 'Lead',
            icon: 'fa-user-tag',
            desc: `${l.stage} · ${l.phoneNumber || l.email}`,
            path: `/leads?search=${encodeURIComponent(l.customerName)}`,
          }));

        const unitMatches = (unitRes?.data || [])
          .filter((u) => u.unitNumber?.toLowerCase().includes(q) || u.unitType?.toLowerCase().includes(q) || u.project?.name?.toLowerCase().includes(q))
          .slice(0, 4)
          .map((u) => ({
            title: `Unit ${u.unitNumber} (${u.unitType})`,
            category: 'Unit',
            icon: 'fa-door-open',
            desc: `${u.status} · ${u.project?.name || 'Project'} · Floor ${u.floor ?? '-'}`,
            path: `/properties?search=${encodeURIComponent(u.unitNumber)}`,
          }));

        setResults([...matchedPages, ...leadMatches, ...unitMatches]);
      } catch {
        // Fallback to page matches
      } finally {
        setSearching(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const handleSelect = (item) => {
    navigate(item.path);
    onClose();
  };

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.7)', backdropFilter: 'blur(6px)', zIndex: 1060 }}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg" style={{ maxWidth: '640px' }}>
        <div className="modal-content border-0 shadow-2xl overflow-hidden" style={{ borderRadius: '1rem' }}>
          {/* Search Header Bar */}
          <div className="d-flex align-items-center px-3 py-2.5 border-bottom bg-body">
            <i className="fas fa-search text-primary me-2.5 fs-5"></i>
            <input
              ref={inputRef}
              type="text"
              className="form-control border-0 shadow-none px-0 fs-6 bg-transparent"
              placeholder="Search leads, units, bookings, or pages... (ESC to close)"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Escape') onClose();
                if (e.key === 'Enter' && results.length > 0) handleSelect(results[0]);
              }}
            />
            {searching ? (
              <span className="spinner-border spinner-border-sm text-primary ms-2" role="status"></span>
            ) : (
              <kbd className="badge bg-body-secondary text-muted border py-1 px-1.5 small font-monospace">ESC</kbd>
            )}
          </div>

          {/* Results List */}
          <div className="p-2" style={{ maxHeight: '380px', overflowY: 'auto' }}>
            {query.trim() === '' ? (
              <div>
                <div className="px-2.5 py-1.5 small fw-bold text-muted text-uppercase tracking-wider" style={{ fontSize: '0.72rem' }}>
                  Quick Navigation
                </div>
                <div className="list-group list-group-flush">
                  {QUICK_PAGES.map((page) => (
                    <button
                      key={page.path}
                      type="button"
                      className="list-group-item list-group-item-action d-flex align-items-center gap-2.5 py-2 px-2.5 rounded border-0 mb-1"
                      onClick={() => handleSelect(page)}
                    >
                      <div
                        className="rounded-2 bg-primary-subtle text-primary d-flex align-items-center justify-content-center flex-shrink-0"
                        style={{ width: '32px', height: '32px' }}
                      >
                        <i className={`fas ${page.icon} small`}></i>
                      </div>
                      <div className="flex-grow-1 min-w-0 text-start">
                        <div className="fw-semibold text-body small">{page.title}</div>
                        <div className="text-muted text-truncate" style={{ fontSize: '0.75rem' }}>
                          {page.desc}
                        </div>
                      </div>
                      <i className="fas fa-arrow-right text-muted small"></i>
                    </button>
                  ))}
                </div>
              </div>
            ) : results.length === 0 && !searching ? (
              <div className="p-4 text-center text-muted small">
                <i className="fas fa-search me-1.5"></i> No matches found for "{query}".
              </div>
            ) : (
              <div className="list-group list-group-flush">
                {results.map((item, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className="list-group-item list-group-item-action d-flex align-items-center gap-2.5 py-2 px-2.5 rounded border-0 mb-1"
                    onClick={() => handleSelect(item)}
                  >
                    <div
                      className={`rounded-2 d-flex align-items-center justify-content-center flex-shrink-0 ${
                        item.category === 'Lead'
                          ? 'bg-purple-subtle text-purple'
                          : item.category === 'Unit'
                          ? 'bg-success-subtle text-success'
                          : 'bg-primary-subtle text-primary'
                      }`}
                      style={{ width: '32px', height: '32px' }}
                    >
                      <i className={`fas ${item.icon} small`}></i>
                    </div>
                    <div className="flex-grow-1 min-w-0 text-start">
                      <div className="d-flex align-items-center gap-1.5">
                        <span className="fw-semibold text-body small text-truncate">{item.title}</span>
                        <span className="badge bg-body-secondary text-muted border micro-badge" style={{ fontSize: '0.65rem' }}>
                          {item.category}
                        </span>
                      </div>
                      <div className="text-muted text-truncate" style={{ fontSize: '0.74rem' }}>
                        {item.desc}
                      </div>
                    </div>
                    <i className="fas fa-arrow-right text-muted small"></i>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Footer Guide */}
          <div className="px-3 py-2 bg-body-tertiary border-top d-flex align-items-center justify-content-between small text-muted">
            <span style={{ fontSize: '0.72rem' }}>
              Tip: Press <kbd className="badge bg-body border text-muted">↑</kbd> <kbd className="badge bg-body border text-muted">↓</kbd> to navigate, <kbd className="badge bg-body border text-muted">Enter</kbd> to select
            </span>
            <span style={{ fontSize: '0.72rem' }}>EstateFlow CRM Instant Command</span>
          </div>
        </div>
      </div>
    </div>
  );
}
