import React from 'react';

export default function UnitModal({
  isOpen,
  onClose,
  isEditing,
  formData,
  onChange,
  onSubmit,
  projects = [],
  buildings = [],
  submitting = false,
}) {
  if (!isOpen) return null;

  // Filter buildings cascading by chosen project
  const availableBuildings = formData.project
    ? buildings.filter(
        (b) =>
          (b.project?.id || b.project?._id || b.project) === formData.project
      )
    : buildings;

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
              <i className={`fas ${isEditing ? 'fa-pen-to-square' : 'fa-plus-circle'} text-primary me-2`}></i>
              {isEditing ? 'Edit Property Unit' : 'Add Property Unit'}
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
                  <label className="form-label small fw-semibold">Master Project *</label>
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

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Building / Tower *</label>
                  <select
                    name="building"
                    className="form-select"
                    required
                    value={formData.building}
                    onChange={onChange}
                  >
                    <option value="">Select Building / Tower</option>
                    {availableBuildings.map((b) => (
                      <option key={b.id || b._id} value={b.id || b._id}>
                        {b.name} ({b.totalFloors || 0} Floors)
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Unit Number / Code *</label>
                  <input
                    type="text"
                    name="unitNumber"
                    className="form-control"
                    placeholder="e.g. A-402, PH-1201"
                    required
                    value={formData.unitNumber}
                    onChange={onChange}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Floor Number</label>
                  <input
                    type="number"
                    name="floor"
                    className="form-control"
                    min="0"
                    placeholder="1"
                    value={formData.floor}
                    onChange={onChange}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Unit Configuration</label>
                  <select
                    name="unitType"
                    className="form-select"
                    value={formData.unitType}
                    onChange={onChange}
                  >
                    <option value="1BHK">1BHK</option>
                    <option value="2BHK">2BHK</option>
                    <option value="3BHK">3BHK</option>
                    <option value="4BHK">4BHK</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Villa">Villa</option>
                    <option value="Commercial">Commercial / Retail</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Availability Status</label>
                  <select
                    name="status"
                    className="form-select"
                    value={formData.status}
                    onChange={onChange}
                  >
                    <option value="Available">Available</option>
                    <option value="Reserved">Reserved</option>
                    <option value="Booked">Booked</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Carpet Area (sq.ft)</label>
                  <input
                    type="number"
                    name="carpetAreaSqFt"
                    className="form-control"
                    placeholder="1250"
                    value={formData.carpetAreaSqFt}
                    onChange={onChange}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Agreement Price ($) *</label>
                  <input
                    type="number"
                    name="price"
                    className="form-control"
                    placeholder="250000"
                    required
                    value={formData.price}
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
                    <span>{isEditing ? 'Save Unit Changes' : 'Create Unit'}</span>
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
