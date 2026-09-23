import React from 'react';

/**
 * Reusable Loading Spinner
 * @param {boolean} fullPage - If true, renders a centered viewport overlay
 * @param {string} message - Optional loading message
 * @param {string} size - 'sm' | 'md' | 'lg'
 */
export default function LoadingSpinner({
  fullPage = false,
  message = 'Loading...',
  size = 'md',
}) {
  const spinnerClass =
    size === 'sm'
      ? 'spinner-border-sm'
      : size === 'lg'
      ? 'spinner-border'
      : 'spinner-border';

  const spinnerStyle = size === 'lg' ? { width: '3rem', height: '3rem' } : {};

  if (fullPage) {
    return (
      <div
        className="d-flex flex-column align-items-center justify-content-center w-100 min-vh-50 py-5"
        style={{ minHeight: '60vh' }}
      >
        <div
          className={`spinner-border text-primary ${spinnerClass}`}
          role="status"
          style={spinnerStyle}
        >
          <span className="visually-hidden">Loading...</span>
        </div>
        {message && (
          <p className="mt-3 text-muted fw-medium small mb-0 animate-pulse">
            {message}
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="d-flex align-items-center justify-content-center py-4 gap-2">
      <div
        className={`spinner-border text-primary ${spinnerClass}`}
        role="status"
        style={spinnerStyle}
      >
        <span className="visually-hidden">Loading...</span>
      </div>
      {message && <span className="text-muted small">{message}</span>}
    </div>
  );
}
