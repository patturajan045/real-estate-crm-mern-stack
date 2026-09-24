import React from 'react';
import { getStageBadgeClass } from '../../utils/formatters';
import { useCms } from '../../context/CmsContext';

export default function DashboardFollowupsTable({
  followups = [],
  onOpenQuickNote,
  onNavigateLead,
}) {
  const { t } = useCms();

  return (
    <div className="row g-3 g-md-4" id="sectionFollowups">
      <div className="col-12">
        <div className="crm-card mb-0 border-0 shadow-sm">
          <div className="crm-card-header d-flex align-items-center justify-content-between p-3 border-bottom">
            <h5 className="crm-card-title fw-bold mb-0 text-warning d-flex align-items-center">
              <i className="fas fa-bell me-2"></i>
              <span>{t('dashboard_followups_heading', 'Pending & Urgent Follow-ups')}</span>
            </h5>
            <span className="badge bg-warning-subtle text-warning flex-shrink-0 px-2.5 py-1">
              {followups.length} Actions Due
            </span>
          </div>

          <div className="crm-card-body p-0">
            {followups.length === 0 ? (
              <div className="text-center py-5">
                <div className="crm-avatar mx-auto mb-2 bg-success-subtle text-success">
                  <i className="fas fa-check-circle"></i>
                </div>
                <div className="fw-semibold text-body">All caught up!</div>
                <p className="text-muted small mb-0">
                  No pending or overdue follow-ups for today. Great job keeping in touch with clients!
                </p>
              </div>
            ) : (
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0 w-100" id="tableFollowups">
                  <thead className="bg-body-tertiary">
                    <tr>
                      <th className="ps-3 py-2.5">Customer</th>
                      <th className="py-2.5">Stage</th>
                      <th className="py-2.5">Due</th>
                      <th className="py-2.5">Assigned Rep</th>
                      <th className="text-end pe-3 py-2.5">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {followups.map((item) => {
                      const isOverdue = item.nextFollowUpDate && new Date(item.nextFollowUpDate) < new Date().setHours(0, 0, 0, 0);

                      return (
                        <tr key={item.id || item._id}>
                          <td className="ps-3 py-2.5">
                            <div
                              className="fw-semibold text-body cursor-pointer"
                              onClick={() => onNavigateLead(item.id || item._id)}
                              title={item.customerName}
                            >
                              {item.customerName}
                            </div>
                            {item.phoneNumber && (
                              <div className="small text-muted">
                                <a
                                  href={`tel:${item.phoneNumber}`}
                                  className="text-decoration-none text-muted"
                                  title={`Call ${item.customerName}`}
                                >
                                  <i className="fas fa-phone-alt me-1 text-success"></i>
                                  {item.phoneNumber}
                                </a>
                              </div>
                            )}
                          </td>

                          <td className="py-2.5">
                            <span className={`badge ${getStageBadgeClass(item.stage)}`}>
                              {item.stage}
                            </span>
                          </td>

                          <td className="py-2.5">
                            {isOverdue ? (
                              <span className="badge bg-danger-subtle text-danger border border-danger-subtle px-2 py-0.5 small">
                                <i className="fas fa-exclamation-circle me-1"></i> Overdue
                              </span>
                            ) : (
                              <span className="badge bg-warning-subtle text-warning border border-warning-subtle px-2 py-0.5 small">
                                <i className="fas fa-clock me-1"></i> Today
                              </span>
                            )}
                          </td>

                          <td className="py-2.5">
                            <span className="small text-secondary">
                              {item.assignedToName || item.assignedTo?.name || 'Unassigned'}
                            </span>
                          </td>

                          <td className="text-end pe-3 py-2.5">
                            <div className="d-inline-flex align-items-center justify-content-end gap-1">
                              {item.phoneNumber && (
                                <>
                                  <a
                                    href={`tel:${item.phoneNumber}`}
                                    className="btn btn-outline-secondary btn-sm py-1 px-1.5 d-none d-sm-inline-flex align-items-center"
                                    title={`Call ${item.customerName}`}
                                  >
                                    <i className="fas fa-phone-alt small text-success"></i>
                                  </a>
                                  <a
                                    href={`https://wa.me/${(item.phoneNumber || '').replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Hello ${item.customerName}, following up regarding your property inquiry.`)}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="btn btn-outline-success btn-sm py-1 px-1.5 d-inline-flex align-items-center"
                                    title={`WhatsApp ${item.customerName}`}
                                  >
                                    <i className="fab fa-whatsapp small"></i>
                                  </a>
                                </>
                              )}
                              <button
                                type="button"
                                className="btn btn-sm btn-primary py-1 px-2.5 d-inline-flex align-items-center gap-1.5 shadow-sm"
                                onClick={() => onOpenQuickNote(item)}
                                title="Log call summary or schedule next follow-up"
                              >
                                <i className="fas fa-pen small"></i>
                                <span className="d-none d-sm-inline">Log Note</span>
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
    </div>
  );
}
