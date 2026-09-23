import React from 'react';

/**
 * Reusable KPI Metric Card
 * @param {string} title - Card header label
 * @param {string|number} value - Main numerical/currency value
 * @param {string} icon - FontAwesome icon class
 * @param {string} colorClass - Bootstrap or CRM text color class
 * @param {string} bgClass - Background badge/icon wrapper class
 * @param {string} subtitle - Small contextual subtitle below value
 * @param {string} badgeText - Small badge pill text (e.g. '+12% this week')
 * @param {string} badgeType - 'success' | 'warning' | 'info' | 'primary'
 * @param {Function} onClick - Optional click handler for drill-down
 */
export default function StatCard({
  title,
  value,
  icon,
  colorClass = 'text-primary',
  bgClass = 'bg-primary-subtle',
  subtitle,
  badgeText,
  badgeType = 'success',
  onClick,
}) {
  return (
    <div
      className={`card crm-card border-0 shadow-sm h-100 ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer', transition: 'transform 0.15s ease-in-out' } : {}}
    >
      <div className="card-body p-3 p-sm-3.5 d-flex flex-column justify-content-between">
        <div className="d-flex align-items-center justify-content-between mb-2">
          <span className="text-muted small fw-medium text-uppercase text-truncate" style={{ letterSpacing: '0.04em' }}>
            {title}
          </span>
          <div
            className={`d-inline-flex align-items-center justify-content-center rounded-3 ${bgClass} ${colorClass} p-2 flex-shrink-0`}
            style={{ width: '38px', height: '38px' }}
          >
            <i className={`fas ${icon} fs-5`}></i>
          </div>
        </div>

        <div>
          <div className="d-flex align-items-baseline gap-2">
            <h3 className="fw-bold mb-0 text-body" style={{ fontSize: 'clamp(1.3rem, 2vw, 1.8rem)' }}>
              {value}
            </h3>
            {badgeText && (
              <span className={`badge bg-${badgeType}-subtle text-${badgeType} fw-semibold`}>
                {badgeText}
              </span>
            )}
          </div>

          {subtitle && (
            <p className="text-muted small mb-0 mt-1 text-truncate">
              {subtitle}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
