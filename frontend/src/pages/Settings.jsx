import React, { useState, useEffect, useCallback } from 'react';
import cmsService from '../services/cmsService';
import { useAuth } from '../context/AuthContext';
import { useCms } from '../context/CmsContext';
import { confirm, toast, error as showError, success as showSuccess } from '../utils/alerts';

export default function Settings() {
  const { hasRole } = useAuth();
  const { t, refreshContent } = useCms();

  const [groupedData, setGroupedData] = useState({});
  const [contentValues, setContentValues] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [openAccordions, setOpenAccordions] = useState({ navigation: true });

  const fetchGroupedContent = useCallback(async () => {
    try {
      setLoading(true);
      const res = await cmsService.getGroupedContent();
      if (res.status === 'success' && res.data) {
        setGroupedData(res.data);
        const map = {};
        for (const items of Object.values(res.data)) {
          for (const item of items) {
            map[item.sectionKey] = item.content || '';
          }
        }
        setContentValues(map);
      }
    } catch {
      showError('Failed to load platform content settings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGroupedContent();
  }, [fetchGroupedContent]);

  if (!hasRole(['Super Admin'])) {
    return (
      <div className="text-center py-5">
        <div className="alert alert-warning d-inline-block">
          <i className="fas fa-exclamation-triangle me-2"></i>
          Access Restricted: Platform CMS settings are exclusively accessible by Super Admin.
        </div>
      </div>
    );
  }

  const handleInputChange = (sectionKey, value) => {
    setContentValues((prev) => ({ ...prev, [sectionKey]: value }));
  };

  const handleToggleAccordion = (pageKey) => {
    setOpenAccordions((prev) => ({
      ...prev,
      [pageKey]: !prev[pageKey],
    }));
  };

  const handleSaveAll = async () => {
    setSaving(true);
    try {
      const res = await cmsService.batchUpdateContent(contentValues);
      if (res.status === 'success') {
        showSuccess(`Successfully updated ${res.updatedCount || 'all'} text elements across the platform.`);
        await refreshContent();
      }
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Failed to update CMS settings');
    } finally {
      setSaving(false);
    }
  };

  const handleResetDefaults = async () => {
    const confirmed = await confirm(
      'Reset All Content to Defaults?',
      'Are you sure you want to revert all system headings, titles, and notices to factory defaults? Any customizations will be overwritten.',
      'Yes, Revert to Defaults',
      'warning'
    );

    if (confirmed) {
      try {
        setLoading(true);
        const res = await cmsService.resetDefaults();
        if (res.status === 'success') {
          showSuccess('All headings and copy reverted to default system values.');
          await fetchGroupedContent();
          await refreshContent();
        }
      } catch (err) {
        showError(err.response?.data?.message || err.message || 'Failed to reset defaults');
      } finally {
        setLoading(false);
      }
    }
  };

  const pageNames = {
    navigation: { title: 'Global Navigation & Sidebar', icon: 'fa-compass', color: 'text-primary' },
    dashboard: { title: 'Dashboard Page', icon: 'fa-chart-pie', color: 'text-primary' },
    leads: { title: 'Leads Pipeline Page', icon: 'fa-user-tag', color: 'text-info' },
    properties: { title: 'Properties & Inventory Page', icon: 'fa-city', color: 'text-success' },
    bookings: { title: 'Bookings Page', icon: 'fa-file-signature', color: 'text-warning' },
    login: { title: 'Login Page', icon: 'fa-sign-in-alt', color: 'text-secondary' },
    register: { title: 'Register Page', icon: 'fa-user-plus', color: 'text-secondary' },
    users: { title: 'Team / Users Page', icon: 'fa-users-cog', color: 'text-danger' },
    settings: { title: 'Platform Settings Page', icon: 'fa-sliders-h', color: 'text-dark' },
  };

  return (
    <>
      {/* Centered Page Header */}
      <div className="crm-page-header-centered">
        <div className="page-icon-badge settings-badge">
          <i className="fas fa-sliders-h"></i>
        </div>
        <h1 className="page-title-creative">
          {t('settings_title', 'Platform Content & Dynamic Headings')}
        </h1>
        <p className="page-subtitle-creative">
          {t(
            'settings_subtitle',
            'Customize all portal headings, titles, subheadings, and paragraphs dynamically across the system'
          )}
        </p>
        <div className="page-header-divider"></div>
      </div>

      {/* Control Bar */}
      <div className="crm-card mb-3 mb-sm-4">
        <div className="crm-card-body p-2 p-sm-3">
          <div className="d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-2 gap-sm-3">
            <div className="d-flex align-items-center gap-2 text-secondary small">
              <i className="fas fa-sliders-h text-primary fs-5 flex-shrink-0"></i>
              <span>
                {t(
                  'settings_info_banner',
                  'All changes saved here update system records instantly and apply across the entire portal for all users without code changes.'
                )}
              </span>
            </div>
            <div className="d-flex flex-wrap gap-2 w-100 w-md-auto justify-content-end">
              <button
                type="button"
                className="btn btn-outline-danger btn-sm flex-fill flex-md-grow-0"
                onClick={handleResetDefaults}
                title="Reset all headings to defaults"
              >
                <i className="fas fa-undo me-1"></i> Reset to Defaults
              </button>
              <button
                type="button"
                className="btn btn-primary btn-sm d-flex align-items-center justify-content-center gap-1 flex-fill flex-md-grow-0"
                onClick={handleSaveAll}
                disabled={saving}
              >
                {saving ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-1"></span>
                    <span>Saving Settings...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-save me-1"></i>
                    <span>Save All Headings</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Dynamic CMS Accordion Container */}
      <div id="cmsAccordionContainer">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary mb-2"></div>
            <p className="text-muted small">Loading platform content settings...</p>
          </div>
        ) : (
          <div className="accordion" id="cmsAccordion">
            {Object.entries(groupedData).map(([pageKey, items]) => {
              const meta = pageNames[pageKey] || {
                title: pageKey.toUpperCase(),
                icon: 'fa-file-alt',
                color: 'text-primary',
              };
              const isOpen = !!openAccordions[pageKey];

              return (
                <div key={pageKey} className="accordion-item border mb-3 rounded overflow-hidden shadow-sm">
                  <h2 className="accordion-header">
                    <button
                      className={`accordion-button ${isOpen ? '' : 'collapsed'} fw-semibold`}
                      type="button"
                      onClick={() => handleToggleAccordion(pageKey)}
                    >
                      <i className={`fas ${meta.icon} ${meta.color} me-2 fs-5`}></i>
                      <span>{meta.title}</span>
                      <span className="badge bg-light text-secondary border ms-2">
                        {items.length} items
                      </span>
                    </button>
                  </h2>
                  {isOpen && (
                    <div className="accordion-collapse show">
                      <div className="accordion-body bg-light p-3">
                        <div className="row g-3">
                          {items.map((item) => {
                            const isLong =
                              item.contentType === 'paragraph' ||
                              item.contentType === 'notice' ||
                              (contentValues[item.sectionKey] && contentValues[item.sectionKey].length > 80);

                            return (
                              <div key={item.sectionKey} className="col-12">
                                <div className="card border p-3 bg-white">
                                  <div className="d-flex justify-content-between align-items-center mb-1">
                                    <label className="form-label fw-bold text-dark mb-0 small">
                                      {item.label}
                                    </label>
                                    <span
                                      className="badge bg-secondary-subtle text-secondary small font-monospace"
                                      style={{ fontSize: '0.7rem' }}
                                    >
                                      {item.sectionKey}
                                    </span>
                                  </div>
                                  <div className="small text-muted mb-2">
                                    Type:{' '}
                                    <span
                                      className="badge bg-light text-muted border text-uppercase"
                                      style={{ fontSize: '0.65rem' }}
                                    >
                                      {item.contentType}
                                    </span>
                                  </div>
                                  {isLong ? (
                                    <textarea
                                      className="form-control"
                                      rows="2"
                                      value={contentValues[item.sectionKey] || ''}
                                      onChange={(e) => handleInputChange(item.sectionKey, e.target.value)}
                                    ></textarea>
                                  ) : (
                                    <input
                                      type="text"
                                      className="form-control"
                                      value={contentValues[item.sectionKey] || ''}
                                      onChange={(e) => handleInputChange(item.sectionKey, e.target.value)}
                                    />
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
}
