import React from 'react';

export default function LeadModal({
  isOpen,
  onClose,
  isEditing,
  formData,
  onChange,
  onSubmit,
  usersList = [],
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
              <i className={`fas ${isEditing ? 'fa-user-pen' : 'fa-user-plus'} text-primary me-2`}></i>
              {isEditing ? 'Edit Customer Lead' : 'Create New Lead'}
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
                    placeholder="e.g. John Doe"
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
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={onChange}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">City / Location</label>
                  <input
                    type="text"
                    name="city"
                    className="form-control"
                    placeholder="e.g. San Diego"
                    value={formData.city}
                    onChange={onChange}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Pipeline Stage</label>
                  <select
                    name="stage"
                    className="form-select"
                    value={formData.stage}
                    onChange={onChange}
                  >
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Site Visit Scheduled">Site Visit Scheduled</option>
                    <option value="Negotiation">Negotiation</option>
                    <option value="Booking Confirmed">Booking Confirmed</option>
                    <option value="Lost">Lost</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Lead Source</label>
                  <select
                    name="source"
                    className="form-select"
                    value={formData.source}
                    onChange={onChange}
                  >
                    <option value="Website">Website</option>
                    <option value="Walk-in">Walk-in</option>
                    <option value="Referral">Referral</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Campaign">Campaign</option>
                    <option value="Broker">Broker</option>
                    <option value="Other">Other</option>
                  </select>
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
                  <label className="form-label small fw-semibold">Assigned Agent</label>
                  <select
                    name="assignedTo"
                    className="form-select"
                    value={formData.assignedTo}
                    onChange={onChange}
                  >
                    <option value="">Unassigned</option>
                    {usersList.map((u) => (
                      <option key={u.id || u._id} value={u.id || u._id}>
                        {u.name} ({u.role})
                      </option>
                    ))}
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

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Next Follow-up Date</label>
                  <input
                    type="date"
                    name="nextFollowUpDate"
                    className="form-control"
                    value={formData.nextFollowUpDate}
                    onChange={onChange}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Address / Neighborhood</label>
                  <input
                    type="text"
                    name="address"
                    className="form-control"
                    placeholder="Customer residential/office address"
                    value={formData.address}
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
                    <i className="fas fa-check"></i>
                    <span>{isEditing ? 'Save Changes' : 'Create Lead'}</span>
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
