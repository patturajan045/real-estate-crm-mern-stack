import React from 'react';
import { formatCurrency, getStatusBadgeClass } from '../../utils/formatters';
import EmptyState from '../common/EmptyState';

export default function UnitCardGrid({
  units = [],
  onOpenUnitModal,
  onEditUnit,
  onDeleteUnit,
  onBookUnit,
}) {
  if (units.length === 0) {
    return (
      <EmptyState
        icon="fa-door-open"
        title="No units found"
        description="Try adjusting your project, status, or type filters, or add a new property unit."
        actionLabel="Add Unit"
        onAction={onOpenUnitModal}
      />
    );
  }

  return (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-3">
      {units.map((unit) => {
        const isAvailable = unit.status === 'Available';
        const isReserved = unit.status === 'Reserved';
        const isBooked = unit.status === 'Booked';

        let borderColor = 'var(--crm-border)';
        if (isAvailable) borderColor = 'rgba(16, 185, 129, 0.4)';
        else if (isReserved) borderColor = 'rgba(245, 158, 11, 0.4)';
        else if (isBooked) borderColor = 'rgba(59, 130, 246, 0.4)';

        return (
          <div key={unit.id || unit._id} className="col">
            <div
              className="card crm-card h-100 border shadow-sm"
              style={{ borderColor, transition: 'all 0.2s ease' }}
            >
              <div className="card-body p-3 d-flex flex-column justify-content-between">
                {/* Header: Unit Number + Status */}
                <div>
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <span className="badge bg-body-secondary text-body fw-bold fs-6">
                      {unit.unitNumber}
                    </span>
                    <span className={`badge ${getStatusBadgeClass(unit.status)}`}>
                      {unit.status}
                    </span>
                  </div>

                  <h6 className="fw-bold mb-1 text-body text-truncate" title={unit.project?.name || ''}>
                    {unit.project?.name || 'Project'}
                  </h6>
                  <p className="text-muted small mb-2 text-truncate">
                    <i className="fas fa-building me-1"></i>
                    {unit.building?.name || 'Tower'} &bull; Floor {unit.floor ?? '-'}
                  </p>
                </div>

                {/* Specs */}
                <div className="bg-body-secondary rounded-2 p-2 mb-3">
                  <div className="d-flex justify-content-between align-items-center small">
                    <span className="text-muted">Type:</span>
                    <span className="fw-semibold text-body">{unit.unitType || '2BHK'}</span>
                  </div>
                  {unit.carpetAreaSqFt && (
                    <div className="d-flex justify-content-between align-items-center small mt-1">
                      <span className="text-muted">Carpet Area:</span>
                      <span className="fw-medium text-body">{unit.carpetAreaSqFt} sq.ft</span>
                    </div>
                  )}
                  <div className="d-flex justify-content-between align-items-center small mt-1">
                    <span className="text-muted">Price:</span>
                    <span className="fw-bold text-primary">{formatCurrency(unit.price || 0)}</span>
                  </div>
                </div>

                {/* Card Actions (Responsive with clear spacing between each button) */}
                <div className="d-flex align-items-center justify-content-between gap-2 mt-auto pt-2.5 border-top flex-wrap">
                  {isAvailable ? (
                    <>
                      <button
                        type="button"
                        className="btn btn-sm btn-primary flex-grow-1 d-inline-flex align-items-center justify-content-center gap-1.5 py-1.5 px-2.5 shadow-sm"
                        onClick={() => onBookUnit(unit)}
                        title="Reserve / Book this Unit"
                      >
                        <i className="fas fa-file-signature small"></i>
                        <span className="fw-semibold">Book</span>
                      </button>
                      <div className="d-flex align-items-center gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-secondary d-inline-flex align-items-center justify-content-center py-1.5 px-2.5"
                          onClick={() => onEditUnit(unit)}
                          title="Edit Unit Details"
                        >
                          <i className="fas fa-pen-to-square"></i>
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-outline-danger d-inline-flex align-items-center justify-content-center py-1.5 px-2.5"
                          onClick={() => onDeleteUnit(unit)}
                          title="Delete Unit"
                        >
                          <i className="fas fa-trash-can"></i>
                        </button>
                      </div>
                    </>
                  ) : (
                    <div className="d-flex align-items-center justify-content-end gap-2 w-100">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-secondary flex-grow-1 d-inline-flex align-items-center justify-content-center gap-1.5 py-1.5 px-3"
                        onClick={() => onEditUnit(unit)}
                        title="Edit Unit Details"
                      >
                        <i className="fas fa-pen-to-square"></i>
                        <span>Edit Unit</span>
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger d-inline-flex align-items-center justify-content-center py-1.5 px-3"
                        onClick={() => onDeleteUnit(unit)}
                        title="Delete Unit"
                      >
                        <i className="fas fa-trash-can"></i>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
