import React from 'react';

/**
 * Reusable Empty State component
 * Displays when no records match filter criteria or lists are empty
 */
export default function EmptyState({
  icon = 'fa-folder-open',
  title = 'No records found',
  description = 'There are no items to display at this time.',
  actionLabel,
  onAction,
  className = '',
}) {
  return (
    <div className={`text-center py-5 px-3 ${className}`}>
      <div
        className="d-inline-flex align-items-center justify-content-center rounded-circle bg-body-tertiary mb-3 shadow-sm"
        style={{ width: '64px', height: '64px' }}
      >
        <i className={`fas ${icon} fs-3 text-muted`}></i>
      </div>
      <h5 className="fw-semibold mb-1 text-body">{title}</h5>
      <p className="text-muted small mx-auto mb-3" style={{ maxWidth: '420px' }}>
        {description}
      </p>
      {actionLabel && onAction && (
        <button
          type="button"
          className="btn btn-sm btn-primary d-inline-flex align-items-center gap-1.5"
          onClick={onAction}
        >
          <i className="fas fa-plus"></i>
          <span>{actionLabel}</span>
        </button>
      )}
    </div>
  );
}
