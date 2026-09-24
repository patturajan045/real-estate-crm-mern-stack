import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  formatCurrency,
  formatDate,
  getInitials,
  getStageBadgeClass,
  getStatusBadgeClass,
} from '../../utils/formatters';
import { useCms } from '../../context/CmsContext';

export default function DashboardRecentTables({
  recentLeads = [],
  recentBookings = [],
  onOpenQuickNote,
  onOpenQuickLead,
}) {
  const navigate = useNavigate();
  const { t } = useCms();

  const avatarColors = [
    'bg-primary',
    'bg-success',
    'bg-warning',
    'bg-info',
    'bg-danger',
    'bg-secondary',
  ];

  return (
    <div className="row g-3 g-md-4 mb-3 mb-sm-4">
      {/* 1. Recent Leads Table */}
      <div className="col-12 col-xl-7">
        <div className="crm-card h-100 mb-0 border-0 shadow-sm">
          <div className="crm-card-header d-flex align-items-center justify-content-between p-3 border-bottom">
            <h5 className="crm-card-title fw-bold mb-0 text-body d-flex align-items-center">
              <i className="fas fa-user-tag text-primary me-2"></i>
              <span>Recent Leads</span>
            </h5>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary flex-shrink-0"
              onClick={() => navigate('/leads')}
            >
              View All &rarr;
            </button>
          </div>

          <div className="crm-card-body p-0">
            {recentLeads.length === 0 ? (
              <div className="text-center py-5">
                <div className="crm-avatar mx-auto mb-2 bg-primary-subtle text-primary">
                  <i className="fas fa-user-plus"></i>
                </div>
                <div className="fw-semibold text-body">No leads recorded yet</div>
                <p className="text-muted small mb-3">Add your first property lead to kickstart your pipeline.</p>
                <button
                  type="button"
                  className="btn btn-sm btn-primary"
                  onClick={onOpenQuickLead}
                >
                  + Add New Lead
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 w-100">
                  <thead className="bg-body-tertiary">
                    <tr>
                      <th className="ps-3 py-2.5">Customer</th>
                      <th className="py-2.5">Stage</th>
                      <th className="py-2.5">Preference</th>
                      <th className="py-2.5">Added</th>
                      <th className="text-end pe-3 py-2.5">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentLeads.map((lead, index) => {
                      const colorCls = avatarColors[index % avatarColors.length];
                      const budgetStr = lead.budgetMin ? formatCurrency(lead.budgetMin) : '-';

                      return (
                        <tr key={lead.id || lead._id}>
                          <td className="ps-3 py-2.5">
                            <div className="d-flex align-items-center gap-2">
                              <div className={`crm-avatar crm-avatar-sm ${colorCls} text-white`}>
                                {getInitials(lead.customerName)}
                              </div>
                              <div className="min-w-0">
                                <div
                                  className="fw-semibold text-body text-truncate cursor-pointer"
                                  style={{ maxWidth: '140px' }}
                                  onClick={() => navigate(`/leads?search=${encodeURIComponent(lead.customerName)}`)}
                                  title={lead.customerName}
                                >
                                  {lead.customerName}
                                </div>
                                <div className="small text-muted text-truncate" style={{ fontSize: '0.72rem', maxWidth: '140px' }}>
                                  {lead.phoneNumber || lead.email}
                                </div>
                              </div>
                            </div>
                          </td>

                          <td className="py-2.5">
                            <span className={`badge ${getStageBadgeClass(lead.stage)}`}>
                              {lead.stage}
                            </span>
                          </td>

                          <td className="py-2.5">
                            <div className="small">
                              {lead.preferredUnitType && (
                                <span className="badge bg-body-secondary text-body border me-1">
                                  {lead.preferredUnitType}
                                </span>
                              )}
                              <span className="text-muted">{budgetStr}</span>
                            </div>
                          </td>

                          <td className="py-2.5">
                            <span className="small text-muted">
                              {formatDate(lead.addedTime || lead.createdAt)}
                            </span>
                          </td>

                          <td className="text-end pe-3 py-2.5">
                            <div className="d-inline-flex align-items-center justify-content-end gap-1">
                              {lead.phoneNumber && (
                                <>
                                  <a
                                    href={`tel:${lead.phoneNumber}`}
                                    className="btn btn-outline-secondary btn-sm py-1 px-1.5 d-none d-sm-inline-flex align-items-center"
                                    title={`Call ${lead.customerName}`}
                                  >
                                    <i className="fas fa-phone-alt small text-success"></i>
                                  </a>
                                  <a
                                    href={`https://wa.me/${(lead.phoneNumber || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${lead.customerName}, following up regarding your property inquiry.`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-outline-success btn-sm py-1 px-1.5 d-inline-flex align-items-center"
                                    title={`WhatsApp ${lead.customerName}`}
                                  >
                                    <i className="fab fa-whatsapp small"></i>
                                  </a>
                                </>
                              )}
                              <button
                                type="button"
                                className="btn btn-outline-primary btn-sm py-1 px-2 d-inline-flex align-items-center gap-1"
                                onClick={() => onOpenQuickNote(lead)}
                                title="Log Call Note"
                              >
                                <i className="fas fa-pen small"></i>
                                <span className="small d-none d-md-inline">Note</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Recent Bookings Table */}
      <div className="col-12 col-xl-5">
        <div className="crm-card h-100 mb-0 border-0 shadow-sm">
          <div className="crm-card-header d-flex align-items-center justify-content-between p-3 border-bottom">
            <h5 className="crm-card-title fw-bold mb-0 text-info d-flex align-items-center">
              <i className="fas fa-receipt me-2"></i>
              <span>{t('dashboard_bookings_heading', 'Recent Bookings')}</span>
            </h5>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary flex-shrink-0"
              onClick={() => navigate('/bookings')}
            >
              View All &rarr;
            </button>
          </div>

          <div className="crm-card-body p-0">
            {recentBookings.length === 0 ? (
              <div className="text-center py-5">
                <div className="crm-avatar mx-auto mb-2 bg-info-subtle text-info">
                  <i className="fas fa-file-signature"></i>
                </div>
                <div className="fw-semibold text-body">No bookings yet</div>
                <p className="text-muted small mb-3">Reserve a unit to see booking agreements here.</p>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => navigate('/bookings')}
                >
                  + New Booking
                </button>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 w-100">
                  <thead className="bg-body-tertiary">
                    <tr>
                      <th className="ps-3 py-2.5">Booking #</th>
                      <th className="py-2.5">Customer & Unit</th>
                      <th className="py-2.5">Amount</th>
                      <th className="pe-3 text-end py-2.5">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentBookings.map((b) => {
                      const customerName = b.lead?.customerName || b.leadName || 'Customer';
                      const unitNumber = b.unit?.unitNumber || b.unitNumber || 'Unit';
                      const projectName = b.unit?.project?.name || b.projectName || '';

                      return (
                        <tr key={b.id || b._id}>
                          <td className="ps-3 py-2.5">
                            <span
                              className="fw-semibold font-monospace small text-primary bg-primary-subtle px-1.5 py-0.5 rounded border border-primary-subtle"
                              style={{ fontSize: '0.74rem' }}
                            >
                              {b.bookingNumber}
                            </span>
                            <div className="text-muted small mt-0.5" style={{ fontSize: '0.7rem' }}>
                              {formatDate(b.bookingDate || b.createdAt)}
                            </div>
                          </td>

                          <td className="py-2.5">
                            <div className="fw-semibold text-body text-truncate" style={{ maxWidth: '140px' }}>
                              {customerName}
                            </div>
                            <div className="small text-muted text-truncate" style={{ maxWidth: '140px', fontSize: '0.75rem' }}>
                              {unitNumber}{projectName ? ` · ${projectName}` : ''}
                            </div>
                          </td>

                          <td className="py-2.5 fw-bold text-body">
                            {formatCurrency(b.agreementValue || 0)}
                          </td>

                          <td className="pe-3 text-end py-2.5">
                            <span className={`badge ${getStatusBadgeClass(b.status)}`}>
                              {b.status}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
