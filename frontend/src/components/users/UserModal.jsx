import React from 'react';

export default function UserModal({
  isOpen,
  onClose,
  isEditing,
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
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-bottom py-3">
            <h5 className="modal-title fw-bold text-body">
              <i className={`fas ${isEditing ? 'fa-user-pen' : 'fa-user-plus'} text-primary me-2`}></i>
              {isEditing ? 'Edit Team Member' : 'Add Team Member'}
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
              <div className="mb-3">
                <label className="form-label small fw-semibold">Full Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="e.g. Sarah Connor"
                  required
                  value={formData.name}
                  onChange={onChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Email Address *</label>
                <input
                  type="email"
                  name="email"
                  className="form-control"
                  placeholder="sarah@crm.com"
                  required
                  value={formData.email}
                  onChange={onChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">
                  Password {isEditing ? '(Leave blank to retain current)' : '*'}
                </label>
                <input
                  type="password"
                  name="password"
                  className="form-control"
                  placeholder={isEditing ? '••••••••' : 'Minimum 6 characters'}
                  required={!isEditing}
                  value={formData.password}
                  onChange={onChange}
                />
              </div>

              <div className="row g-2 mb-3">
                <div className="col-12 col-sm-6">
                  <label className="form-label small fw-semibold">Platform Role *</label>
                  <select
                    name="role"
                    className="form-select"
                    value={formData.role}
                    onChange={onChange}
                  >
                    <option value="Sales Employee">Sales Employee</option>
                    <option value="Admin">Admin</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>

                <div className="col-12 col-sm-6">
                  <label className="form-label small fw-semibold">Phone Number</label>
                  <input
                    type="tel"
                    name="phoneNumber"
                    className="form-control"
                    placeholder="+1 555-0199"
                    value={formData.phoneNumber}
                    onChange={onChange}
                  />
                </div>
              </div>

              <div className="form-check form-switch mt-2">
                <input
                  className="form-check-input"
                  type="checkbox"
                  role="switch"
                  id="userActiveSwitch"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={(e) =>
                    onChange({
                      target: { name: 'isActive', value: e.target.checked },
                    })
                  }
                />
                <label className="form-check-label small fw-semibold text-body" htmlFor="userActiveSwitch">
                  Account Active & Enabled
                </label>
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
                    <span>{isEditing ? 'Save Member' : 'Create Member'}</span>
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
