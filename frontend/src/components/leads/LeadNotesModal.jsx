import React from 'react';
import { formatDateTime } from '../../utils/formatters';

export default function LeadNotesModal({
  isOpen,
  onClose,
  lead,
  noteContent,
  onNoteContentChange,
  noteStage,
  onNoteStageChange,
  noteNextDate,
  onNoteNextDateChange,
  onSubmitNote,
  submitting = false,
}) {
  if (!isOpen || !lead) return null;

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)' }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-bottom py-3">
            <div>
              <h5 className="modal-title fw-bold text-body mb-0">
                <i className="fas fa-clock-rotate-left text-primary me-2"></i>
                Activity & Notes History
              </h5>
              <small className="text-muted">
                Lead: <span className="fw-semibold text-body">{lead.customerName}</span> ({lead.stage})
              </small>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <div className="modal-body p-4">
            {/* Log New Note Form */}
            <form onSubmit={onSubmitNote} className="card bg-body-tertiary border-0 p-3 mb-4">
              <h6 className="fw-semibold mb-2 text-body">
                <i className="fas fa-plus-circle text-primary me-1.5"></i>
                Log New Activity / Interaction
              </h6>

              <div className="mb-2.5">
                <textarea
                  className="form-control"
                  rows="3"
                  placeholder="Record customer response, requirements discussed, meeting notes..."
                  required
                  value={noteContent}
                  onChange={(e) => onNoteContentChange(e.target.value)}
                ></textarea>
              </div>

              <div className="row g-2 align-items-end">
                <div className="col-12 col-sm-5">
                  <label className="form-label micro-badge text-muted mb-1">Update Stage (Optional)</label>
                  <select
                    className="form-select form-select-sm"
                    value={noteStage}
                    onChange={(e) => onNoteStageChange(e.target.value)}
                  >
                    <option value="">Keep current ({lead.stage})</option>
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Site Visit Scheduled">Site Visit Scheduled</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Booking Confirmed">Booking Confirmed</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>

                <div className="col-12 col-sm-5">
                  <label className="form-label micro-badge text-muted mb-1">Next Follow-up Date</label>
                  <input
                    type="date"
                    className="form-control form-control-sm"
                    value={noteNextDate}
                    onChange={(e) => onNoteNextDateChange(e.target.value)}
                  />
                </div>

                <div className="col-12 col-sm-2">
                  <button
                    type="submit"
                    className="btn btn-primary btn-sm w-100 d-inline-flex align-items-center justify-content-center gap-1"
                    disabled={submitting}
                  >
                    {submitting ? (
                      <span className="spinner-border spinner-border-sm" role="status"></span>
                    ) : (
                      <>
                        <i className="fas fa-paper-plane"></i>
                        <span>Save</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </form>

            {/* Previous Notes Timeline */}
            <h6 className="fw-semibold mb-3 text-body">
              <i className="fas fa-list-check text-muted me-1.5"></i>
              Activity History ({lead.notes ? lead.notes.length : 0})
            </h6>

            {!lead.notes || lead.notes.length === 0 ? (
              <p className="text-muted small text-center py-3 mb-0">
                No activity notes logged yet for this lead.
              </p>
            ) : (
              <div className="activity-timeline" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {lead.notes
                  .slice()
                  .reverse()
                  .map((note, idx) => (
                    <div key={idx} className="card border-0 bg-body-secondary mb-2 p-3">
                      <div className="d-flex align-items-center justify-content-between mb-1.5">
                        <span className="fw-semibold small text-body">
                          <i className="fas fa-user-circle text-primary me-1"></i>
                          {note.author?.name || 'Team Member'}
                        </span>
                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                          {formatDateTime(note.createdAt)}
                        </small>
                      </div>
                      <p className="small mb-0 text-body whitespace-pre-wrap">
                        {note.content}
                      </p>
                    </div>
                  ))}
              </div>
            )}
          </div>

          <div className="modal-footer border-top py-3">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
