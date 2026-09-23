import React from 'react';
import { formatDate, getStageBadgeClass, getInitials } from '../../utils/formatters';
import { useCms } from '../../context/CmsContext';
import EmptyState from '../common/EmptyState';

export default function DashboardFollowupsTable({
  followups = [],
  onOpenQuickNote,
  onNavigateLead,
  onOpenQuickLead,
}) {
  const { t } = useCms();

  return (
    <div className="card crm-card border-0 shadow-sm mb-4" id="sectionFollowups">
      <div className="card-header bg-transparent border-bottom d-flex align-items-center justify-content-between py-3">
        <div className="d-flex align-items-center gap-2">
          <i className="fas fa-calendar-check text-warning fs-5"></i>
          <h5 className="card-title fw-bold mb-0 text-body" style={{ fontSize: 'var(--crm-font-h3)' }}>
            {t('dashboard_followups_heading', 'Pending & Urgent Follow-ups')}
          </h5>
        </div>
        <span className="badge bg-warning-subtle text-warning fw-semibold">
          {followups.length} Due
        </span>
      </div>

      <div className="card-body p-0">
        {followups.length === 0 ? (
          <EmptyState
            icon="fa-check-circle"
            title="All follow-ups completed!"
            description="There are no overdue or pending follow-ups scheduled at this time."
            actionLabel="Add New Lead"
            onAction={onOpenQuickLead}
          />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 w-100">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="ps-3">Customer</th>
                  <th scope="col">Stage</th>
                  <th scope="col">Follow-up Due</th>
                  <th scope="col">Assigned Agent</th>
                  <th scope="col" className="text-end pe-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {followups.map((lead) => {
                  const isOverdue = lead.nextFollowUpDate && new Date(lead.nextFollowUpDate) < new Date();
                  return (
                    <tr key={lead.id || lead._id}>
                      <td className="ps-3">
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold small flex-shrink-0"
                            style={{ width: '34px', height: '34px' }}
                          >
                            {getInitials(lead.customerName)}
                          </div>
                          <div className="min-w-0">
                            <span
                              className="fw-semibold text-body text-truncate d-block cursor-pointer text-decoration-hover"
                              onClick={() => onNavigateLead(lead.id || lead._id)}
                              title={lead.customerName}
                              style={{ cursor: 'pointer' }}
                            >
                              {lead.customerName}
                            </span>
                            {lead.phoneNumber && (
                              <small className="text-muted d-block text-truncate">
                                <i className="fas fa-phone-alt me-1 text-muted"></i>
                                {lead.phoneNumber}
                              </small>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className={`badge ${getStageBadgeClass(lead.stage)}`}>
                          {lead.stage}
                        </span>
                      </td>

                      <td>
                        <div className="d-flex align-items-center gap-1.5">
                          <i className={`fas fa-clock ${isOverdue ? 'text-danger' : 'text-muted'} small`}></i>
                          <span className={`small fw-medium ${isOverdue ? 'text-danger' : 'text-body'}`}>
                            {formatDate(lead.nextFollowUpDate)}
                          </span>
                          {isOverdue && (
                            <span className="badge bg-danger-subtle text-danger micro-badge ms-1">
                              Overdue
                            </span>
                          )}
                        </div>
                      </td>

                      <td>
                        <small className="text-muted">
                          {lead.assignedTo?.name || 'Unassigned'}
                        </small>
                      </td>

                      <td className="text-end pe-3">
                        <div className="btn-group btn-group-sm">
                          {lead.phoneNumber && (
                            <a
                              href={`tel:${lead.phoneNumber}`}
                              className="btn btn-outline-secondary btn-sm"
                              title={`Call ${lead.customerName}`}
                              aria-label={`Call ${lead.customerName}`}
                            >
                              <i className="fas fa-phone text-success"></i>
                            </a>
                          )}
                          <button
                            type="button"
                            className="btn btn-outline-primary btn-sm"
                            onClick={() => onOpenQuickNote(lead)}
                            title="Log Activity Note"
                            aria-label="Log Note"
                          >
                            <i className="fas fa-pen-to-square"></i>
                          </button>
                          <button
                            type="button"
                            className="btn btn-outline-secondary btn-sm"
                            onClick={() => onNavigateLead(lead.id || lead._id)}
                            title="View Full Lead Details"
                            aria-label="View Details"
                          >
                            <i className="fas fa-arrow-right"></i>
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
  );
}
