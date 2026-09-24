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
      <div className="modal-dialog modal-dialog-centered modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-bottom py-3">
            <h5 className="modal-title fw-bold text-body mb-0">
              <i className="fas fa-phone-alt text-success me-2"></i>
              Log Activity & Follow-up
            </h5>
            <button
              type="button"
              className="btn-close"
              onClick={onClose}
              aria-label="Close"
            ></button>
          </div>

          <form onSubmit={onSubmit}>
            <div className="modal-body p-4">
              {/* Customer Display */}
              <div className="mb-3">
                <label className="form-label fw-bold small text-muted text-uppercase mb-1">Customer</label>
                <div className="fw-semibold text-primary fs-6">
                  {lead.customerName} {lead.stage ? `(${lead.stage})` : ''}
                </div>
              </div>

              {/* Call / Interaction Summary */}
              <div className="mb-3">
                <label className="form-label small fw-semibold">Call / Meeting Summary *</label>
                <div className="input-group">
                  <span className="input-group-text"><i className="fas fa-comment-alt"></i></span>
                  <textarea
                    name="content"
                    className="form-control"
                    rows="3"
                    placeholder="Key highlights from client call, scheduled site visit, or price inquiry..."
                    required
                    value={formData.content}
                    onChange={onChange}
                  ></textarea>
                </div>
              </div>

              <div className="row g-2">
                {/* Update Stage */}
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Update Stage</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="fas fa-step-forward"></i></span>
                    <select
                      name="stage"
                      className="form-select form-select-sm"
                      value={formData.stage}
                      onChange={onChange}
                    >
                      <option value="">Keep Current Stage</option>
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Site Visit">Site Visit</option>
                      <option value="Interested">Interested</option>
                      <option value="Negotiation">Negotiation</option>
                      <option value="Booked">Booked</option>
                      <option value="Lost">Lost</option>
                    </select>
                  </div>
                </div>

                {/* Next Follow-up Date & Time */}
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Next Follow-up Date & Time</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="far fa-calendar-alt"></i></span>
                    <input
                      type="datetime-local"
                      name="nextFollowUpDate"
                      className="form-control form-control-sm"
                      value={formData.nextFollowUpDate}
                      onChange={onChange}
                    />
                  </div>
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
                className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1.5 px-3"
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
                    <span>Save Activity</span>
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
