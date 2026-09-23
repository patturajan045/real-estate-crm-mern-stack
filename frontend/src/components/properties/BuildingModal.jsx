import React from 'react';

export default function BuildingModal({
  isOpen,
  onClose,
  isEditing,
  formData,
  onChange,
  onSubmit,
  projects = [],
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
              <i className={`fas ${isEditing ? 'fa-pen-to-square' : 'fa-building'} text-primary me-2`}></i>
              {isEditing ? 'Edit Building / Tower' : 'Add Building / Tower'}
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
                <label className="form-label small fw-semibold">Parent Master Project *</label>
                <select
                  name="project"
                  className="form-select"
                  required
                  value={formData.project}
                  onChange={onChange}
                >
                  <option value="">Select Project</option>
                  {projects.map((p) => (
                    <option key={p.id || p._id} value={p.id || p._id}>
                      {p.name} ({p.city || 'City'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Building / Tower Name *</label>
                <input
                  type="text"
                  name="name"
                  className="form-control"
                  placeholder="e.g. Tower A, Pacific Tower"
                  required
                  value={formData.name}
                  onChange={onChange}
                />
              </div>

              <div className="mb-3">
                <label className="form-label small fw-semibold">Total Floors</label>
                <input
                  type="number"
                  name="totalFloors"
                  className="form-control"
                  min="1"
                  placeholder="12"
                  value={formData.totalFloors}
                  onChange={onChange}
                />
              </div>

              <div className="mb-0">
                <label className="form-label small fw-semibold">Notes / Description</label>
                <textarea
                  name="notes"
                  className="form-control"
                  rows="3"
                  placeholder="Lift capacity, parking levels, special specs..."
                  value={formData.notes}
                  onChange={onChange}
                ></textarea>
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
                    <span>{isEditing ? 'Save Changes' : 'Create Building'}</span>
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
