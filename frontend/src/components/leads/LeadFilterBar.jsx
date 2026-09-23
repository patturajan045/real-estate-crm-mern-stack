import React from 'react';

export default function LeadFilterBar({
  searchTerm,
  onSearchChange,
  activeStage,
  onStageChange,
  totalCount,
  filteredCount,
}) {
  return (
    <div className="card crm-card border-0 shadow-sm p-3 mb-3">
      <div className="row g-2 align-items-center">
        {/* Search input */}
        <div className="col-12 col-md-6 col-lg-5">
          <div className="input-group input-group-sm">
            <span className="input-group-text bg-body-tertiary border-end-0">
              <i className="fas fa-search text-muted"></i>
            </span>
            <input
              type="text"
              className="form-control border-start-0"
              placeholder="Search by customer name, phone, email, or city..."
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="btn btn-outline-secondary border-start-0"
                onClick={() => onSearchChange('')}
                title="Clear search"
              >
                <i className="fas fa-xmark"></i>
              </button>
            )}
          </div>
        </div>

        {/* Stage quick dropdown on mobile or tablet */}
        <div className="col-12 col-md-6 col-lg-4 ms-auto d-flex align-items-center justify-content-md-end gap-2">
          <span className="text-muted small text-nowrap">
            Showing <strong className="text-body">{filteredCount}</strong> of {totalCount} leads
          </span>
        </div>
      </div>
    </div>
  );
}
