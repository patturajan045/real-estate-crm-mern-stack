import React from 'react';
import { useAuth } from '../../context/AuthContext';

export default function QuickLeadModal({
  isOpen,
  onClose,
  formData,
  onChange,
  onSubmit,
  usersList = [],
  submitting = false,
}) {
  const { user } = useAuth();
  if (!isOpen) return null;

  const isAdminOrSuper = user?.role === 'Super Admin' || user?.role === 'Admin';

  return (
    <div
      className="modal fade show d-block"
      tabIndex="-1"
      role="dialog"
      aria-modal="true"
      style={{ backgroundColor: 'rgba(0, 0, 0, 0.65)' }}
    >
      <div className="modal-dialog modal-dialog-centered modal-lg modal-dialog-scrollable">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-bottom py-3">
            <h5 className="modal-title fw-bold text-body">
              <i className="fas fa-user-plus text-primary me-2"></i>
              Add New Lead
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
                {/* Customer Full Name */}
                <div className="col-12">
                  <label className="form-label small fw-semibold">Customer Name *</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="far fa-user"></i></span>
                    <input
                      type="text"
                      name="customerName"
                      className="form-control"
                      placeholder="e.g. Samantha Reed"
                      required
                      value={formData.customerName}
                      onChange={onChange}
                    />
                  </div>
                </div>

                {/* Phone Number */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Phone Number *</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="fas fa-phone"></i></span>
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
                </div>

                {/* Email Address */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Email Address *</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="far fa-envelope"></i></span>
                    <input
                      type="email"
                      name="email"
                      className="form-control"
                      placeholder="customer@example.com"
                      required
                      value={formData.email}
                      onChange={onChange}
                    />
                  </div>
                </div>

                {/* Initial Stage */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Initial Stage</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="fas fa-layer-group"></i></span>
                    <select
                      name="stage"
                      className="form-select"
                      value={formData.stage}
                      onChange={onChange}
                    >
                      <option value="New">New</option>
                      <option value="Contacted">Contacted</option>
                      <option value="Site Visit">Site Visit</option>
                      <option value="Interested">Interested</option>
                      <option value="Negotiation">Negotiation</option>
                    </select>
                  </div>
                </div>

                {/* Preferred Unit Type */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Preferred Unit Type</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="fas fa-home"></i></span>
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
                </div>

                {/* Min Budget */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Min Budget ($)</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="fas fa-dollar-sign"></i></span>
                    <input
                      type="number"
                      name="budgetMin"
                      className="form-control"
                      placeholder="100000"
                      value={formData.budgetMin}
                      onChange={onChange}
                    />
                  </div>
                </div>

                {/* Max Budget */}
                <div className="col-md-6">
                  <label className="form-label small fw-semibold">Max Budget ($)</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="fas fa-dollar-sign"></i></span>
                    <input
                      type="number"
                      name="budgetMax"
                      className="form-control"
                      placeholder="500000"
                      value={formData.budgetMax}
                      onChange={onChange}
                    />
                  </div>
                </div>

                {/* Database-Driven Assigned Agent (Only for Admin/Super Admin) */}
                {isAdminOrSuper && (
                  <div className="col-12">
                    <label className="form-label small fw-semibold">Assign to Team Member (Database)</label>
                    <div className="input-group">
                      <span className="input-group-text"><i className="fas fa-user-check"></i></span>
                      <select
                        name="assignedTo"
                        className="form-select"
                        value={formData.assignedTo || ''}
                        onChange={onChange}
                      >
                        <option value="">Unassigned</option>
                        {usersList.map((u) => (
                          <option key={u.id || u._id} value={u.id || u._id}>
                            {u.name} ({u.role}) - {u.email}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                )}

                {/* Initial Note / Requirement */}
                <div className="col-12">
                  <label className="form-label small fw-semibold">Initial Notes / Requirement</label>
                  <div className="input-group">
                    <span className="input-group-text"><i className="fas fa-sticky-note"></i></span>
                    <textarea
                      name="initialNote"
                      className="form-control"
                      rows="2"
                      placeholder="Key requirements, requested floor, timeline, or notes from call..."
                      value={formData.initialNote}
                      onChange={onChange}
                    ></textarea>
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
                    <i className="fas fa-check"></i>
                    <span>Save Lead</span>
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
