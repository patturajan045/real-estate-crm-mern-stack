import React from 'react';

export default function ProjectModal({
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
      <div className="modal-dialog modal-dialog-centered modal-lg">
        <div className="modal-content border-0 shadow-lg">
          <div className="modal-header border-bottom py-3">
            <h5 className="modal-title fw-bold text-body">
              <i className={`fas ${isEditing ? 'fa-pen-to-square' : 'fa-city'} text-primary me-2`}></i>
              {isEditing ? 'Edit Master Project' : 'Create Master Project'}
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
                  <label className="form-label small fw-semibold">Project Name *</label>
                  <input
                    type="text"
                    name="name"
                    className="form-control"
                    placeholder="e.g. Azure Bay Residences"
                    required
                    value={formData.name}
                    onChange={onChange}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Builder / Developer Name</label>
                  <input
                    type="text"
                    name="builder"
                    className="form-control"
                    placeholder="e.g. Apex Living Group"
                    value={formData.builder}
                    onChange={onChange}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">City *</label>
                  <input
                    type="text"
                    name="city"
                    className="form-control"
                    placeholder="e.g. San Diego"
                    required
                    value={formData.city}
                    onChange={onChange}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">State / Province</label>
                  <input
                    type="text"
                    name="state"
                    className="form-control"
                    placeholder="e.g. California"
                    value={formData.state}
                    onChange={onChange}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Construction Status</label>
                  <select
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={onChange}
                  >
                    <option value="Pre-Launch">Pre-Launch</option>
                    <option value="Under Construction">Under Construction</option>
                    <option value="Ready to Move">Ready to Move</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Street Address</label>
                  <input
                    type="text"
                    name="address"
                    className="form-control"
                    placeholder="e.g. 500 Ocean Blvd"
                    value={formData.address}
                    onChange={onChange}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">Project Description</label>
                  <textarea
                    name="description"
                    className="form-control"
                    rows="3"
                    placeholder="Amenities, proximity to transit, key selling points..."
                    value={formData.description}
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
                    <span>{isEditing ? 'Save Changes' : 'Create Project'}</span>
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
