import React from 'react';

export default function QuickNoteModal({
  isOpen,
  onClose,
  lead,
  formData,
  onChange,
  onSubmit,
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
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-bottom py-3">
            <div>
              <h5 className="modal-title fw-bold text-body mb-0">
                <i className="fas fa-comment-dots text-primary me-2"></i>
                Log Follow-up Note
              </h5>
              <small className="text-muted">
                Customer: <span className="fw-semibold text-body">{lead.customerName}</span>
              </small>
            </div>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <form onSubmit={onSubmit}>
            <div className="modal-body p-4">
              <div className="mb-3">
                <label className="form-label small fw-semibold">Note / Interaction Summary *</label>
                <textarea
                  name="content"
                  className="form-control"
                  rows="4"
                  placeholder="Summary of customer call, site visit feedback, or next steps..."
                  required
                  value={formData.content}
                  onChange={onChange}
                ></textarea>
              </div>

              <div className="row g-3">
                <div className="col-12 col-sm-6">
                  <label className="form-label small fw-semibold">Update Stage</label>
                  <select
                    name="stage"
                    className="form-select form-select-sm"
                    value={formData.stage}
                    onChange={onChange}
                  >
                    <option value="">Keep Current ({lead.stage})</option>
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Site Visit Scheduled">Site Visit Scheduled</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Booking Confirmed">Booking Confirmed</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label small fw-semibold">Next Follow-up Date</label>
                  <input
                    type="date"
                    name="nextFollowUpDate"
                    className="form-control form-control-sm"
                    value={formData.nextFollowUpDate}
                    onChange={onChange}
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer border-top py-3">
              <button
                type="button"
                className="btn btn-secondary btn-sm"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1.5"
                disabled={submitting}
              >
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm" role="status"></span>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-save"></i>
                    <span>Save Note & Update</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
