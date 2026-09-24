import React from 'react';

/**
 * Standardized responsive Page Header
 * @param {string} title - Dynamic page title
 * @param {string} subtitle - Explanatory subtitle
 * @param {string} primaryActionLabel - Text for the primary action button
 * @param {string} primaryActionIcon - FontAwesome icon
 * @param {Function} onPrimaryAction - Click callback for primary action
 * @param {Function} onRefresh - Optional refresh button callback
 * @param {boolean} refreshing - Spinner on refresh button
 * @param {Function} onExport - Optional callback to export data to Excel / CSV
 * @param {string} exportLabel - Custom label for export button
 * @param {string} exportTitle - Tooltip title for export button
 * @param {React.ReactNode} children - Additional filter chips or action slots
 */
export default function PageHeader({
  title,
  subtitle,
  primaryActionLabel,
  primaryActionIcon = 'fa-plus',
  onPrimaryAction,
  onRefresh,
  refreshing = false,
  onExport,
  exportLabel,
  exportTitle,
  children,
}) {
  return (
    <div className="crm-page-header d-flex flex-column flex-md-row align-items-start align-items-md-center justify-content-between gap-3 mb-4">
      <div className="min-w-0">
        <h1 className="h3 fw-bold mb-1 text-body text-truncate" style={{ fontSize: 'var(--crm-font-h1)' }}>
          {title}
        </h1>
        {subtitle && (
          <p className="text-muted small mb-0" style={{ fontSize: 'var(--crm-font-sm)' }}>
            {subtitle}
          </p>
        )}
      </div>

      <div className="d-flex align-items-center gap-2 flex-wrap w-100 w-md-auto justify-content-start justify-content-md-end">
        {children}

        {onRefresh && (
          <button
            type="button"
            className="btn btn-outline-secondary btn-sm d-inline-flex align-items-center gap-1.5"
            onClick={onRefresh}
            disabled={refreshing}
            title="Refresh Data"
            aria-label="Refresh Data"
          >
            <i className={`fas fa-rotate ${refreshing ? 'fa-spin' : ''}`}></i>
            <span className="d-none d-sm-inline">Refresh</span>
          </button>
        )}

        {onExport && (
          <button
            type="button"
            className="btn btn-outline-success btn-sm d-inline-flex align-items-center gap-1.5"
            onClick={onExport}
            title={exportTitle || 'Export data to Excel / CSV'}
            aria-label="Export Excel Report"
          >
            <i className="fas fa-file-excel text-success"></i>
            <span className="d-none d-sm-inline">{exportLabel || 'Export Excel'}</span>
            <span className="d-sm-none">Export</span>
          </button>
        )}

        {primaryActionLabel && onPrimaryAction && (
          <button
            type="button"
            className="btn btn-primary btn-sm d-inline-flex align-items-center gap-1.5 fw-medium"
            onClick={onPrimaryAction}
          >
            <i className={`fas ${primaryActionIcon}`}></i>
            <span>{primaryActionLabel}</span>
          </button>
        )}
      </div>
    </div>
  );
}
