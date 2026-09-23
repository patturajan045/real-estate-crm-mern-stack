import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function MobileQuickActionModal({ isOpen, onClose }) {
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleAction = (path) => {
    onClose();
    navigate(path);
  };

  return (
    <>
      <div
        className="modal fade modal-bottom-sheet show d-block"
        id="mobileQuickActionModal"
        tabIndex="-1"
        aria-labelledby="mobileQuickActionTitle"
        aria-modal="true"
        role="dialog"
      >
        <div className="modal-dialog modal-dialog-end m-0 w-100">
          <div className="modal-content border-0 shadow-lg">
            <div className="modal-header border-0 pb-0">
              <div className="d-flex align-items-center gap-2">
                <div className="stat-icon primary" style={{ width: '32px', height: '32px', fontSize: '0.95rem' }}>
                  <i className="fas fa-bolt"></i>
                </div>
                <h5 className="modal-title fw-bold fs-6" id="mobileQuickActionTitle">
                  Quick Actions
                </h5>
              </div>
              <button type="button" className="btn-close" onClick={onClose} aria-label="Close"></button>
            </div>
            <div className="modal-body pt-2 pb-4">
              <div className="row g-2">
                <div className="col-6">
                  <button
                    className="btn btn-outline-secondary w-100 p-3 text-start d-flex flex-column gap-1.5 rounded-3"
                    onClick={() => handleAction('/leads?action=add')}
                  >
                    <i className="fas fa-user-plus text-primary fs-4"></i>
                    <span className="fw-bold small text-body">+ Add Lead</span>
                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                      New Prospect
                    </span>
                  </button>
                </div>
                <div className="col-6">
                  <button
                    className="btn btn-outline-secondary w-100 p-3 text-start d-flex flex-column gap-1.5 rounded-3"
                    onClick={() => handleAction('/bookings?action=add')}
                  >
                    <i className="fas fa-file-contract text-success fs-4"></i>
                    <span className="fw-bold small text-body">+ New Booking</span>
                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                      Unit Reservation
                    </span>
                  </button>
                </div>
                <div className="col-6">
                  <button
                    className="btn btn-outline-secondary w-100 p-3 text-start d-flex flex-column gap-1.5 rounded-3"
                    onClick={() => handleAction('/properties?action=add')}
                  >
                    <i className="fas fa-building text-info fs-4"></i>
                    <span className="fw-bold small text-body">+ Add Property</span>
                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                      Projects & Units
                    </span>
                  </button>
                </div>
                <div className="col-6">
                  <button
                    className="btn btn-outline-secondary w-100 p-3 text-start d-flex flex-column gap-1.5 rounded-3"
                    onClick={() => handleAction('/dashboard#followups')}
                  >
                    <i className="fas fa-phone-alt text-warning fs-4"></i>
                    <span className="fw-bold small text-body">+ Follow-up</span>
                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>
                      Customer Calls
                    </span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="modal-backdrop fade show" onClick={onClose}></div>
    </>
  );
}
