import React from 'react';

export default function QuickLeadModal({
  isOpen,
  onClose,
  formData,
  onChange,
  onSubmit,
  submitting = false,
}) {
  if (!isOpen) return null;

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
            <h5 className="modal-title fw-bold text-body">
              <i className="fas fa-user-plus text-primary me-2"></i>
              Quick Lead Entry
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
              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Customer Full Name *</label>
                  <input
                    type="text"
                    name="customerName"
                    className="form-control"
                    placeholder="e.g. Eleanor Vance"
                    required
                    value={formData.customerName}
                    onChange={onChange}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Phone Number *</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    className="form-control"
                    placeholder="+1 555-0199"
                    required
                    value={formData.phoneNumber}
                    onChange={onChange}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Email Address</label>
                  <input
                    type="email"
                    name="email"
                    className="form-control"
                    placeholder="customer@example.com"
                    value={formData.email}
                    onChange={onChange}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Preferred Unit Type</label>
                  <select
                    name="preferredUnitType"
                    className="form-select"
                    value={formData.preferredUnitType}
                    onChange={onChange}
                  >
                    <option value="">Any / Flexible</option>
                    <option value="1BHK">1BHK</option>
                    <option value="2BHK">2BHK</option>
                    <option value="3BHK">3BHK</option>
                    <option value="4BHK">4BHK</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Villa">Villa</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Min Budget ($)</label>
                  <input
                    type="number"
                    name="budgetMin"
                    className="form-control"
                    placeholder="100000"
                    value={formData.budgetMin}
                    onChange={onChange}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Max Budget ($)</label>
                  <input
                    type="number"
                    name="budgetMax"
                    className="form-control"
                    placeholder="500000"
                    value={formData.budgetMax}
                    onChange={onChange}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">Initial Conversation Note</label>
                  <textarea
                    name="initialNote"
                    className="form-control"
                    rows="3"
                    placeholder="Key requirements, requested floor, timeline, or notes from call..."
                    value={formData.initialNote}
                    onChange={onChange}
                  ></textarea>
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
                    <i className="fas fa-check"></i>
                    <span>Create Lead</span>
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
