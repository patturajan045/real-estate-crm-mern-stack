import React from 'react';

export default function RecordActionModal({ isOpen, onClose, data }) {
  if (!isOpen || !data) return null;

  const { title = 'Record Actions', subtitle = 'Select an action for this record', badge = null, metaItems = [], actions = [] } = data;

  return (
    <>
      <div
        className="modal fade show d-block"
        id="recordActionModal"
        tabIndex="-1"
        aria-labelledby="recordActionTitle"
        aria-modal="true"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-centered modal-sm" style={{ maxWidth: '420px' }}>
          <div className="modal-content shadow-lg border-0">
            <div className="modal-header border-bottom py-3 px-3 px-sm-4 bg-light-subtle">
              <div className="min-w-0 me-2">
                <div className="d-flex align-items-center gap-2 mb-0.5">
                  <h6 className="modal-title fw-bold text-truncate mb-0" id="recordActionTitle">
                    {title}
                  </h6>
                  {badge}
                </div>
                <div className="text-secondary small text-truncate" id="recordActionSubtitle">
                  {subtitle}
                </div>
              </div>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
            </div>
            <div className="modal-body p-3 px-sm-4">
              {metaItems && metaItems.length > 0 && (
                <div className="record-action-meta-list mb-3 p-2.5 rounded bg-light-subtle border">
                  {metaItems.map((item, idx) => (
                    <div key={idx} className="d-flex justify-content-between text-muted small py-0.5">
                      <span>{item.label}:</span>
                      <strong className="text-body">{item.value}</strong>
                    </div>
                  ))}
                </div>
              )}
              <div
                className="text-muted small fw-semibold text-uppercase mb-2"
                style={{ fontSize: '0.68rem', letterSpacing: '0.05em' }}
              >
                Available Actions
              </div>
              <div id="recordActionBody" className="d-flex flex-column gap-1">
                {actions.map((act, idx) => (
                  <button
                    key={idx}
                    type="button"
                    className={`btn ${act.btnClass || 'btn-outline-secondary'} text-start d-flex align-items-center gap-2 py-2 px-3`}
                    onClick={() => {
                      onClose();
                      if (act.onClick) act.onClick();
                    }}
                  >
                    {act.icon && <i className={`fas ${act.icon}`}></i>}
                    <span>{act.label}</span>
                  </button>
                ))}
              </div>
            </div>
            <div className="modal-footer py-2 px-3 border-top">
              <button type="button" className="btn btn-secondary w-100" onClick={onClose}>
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
    </>
  );
}
