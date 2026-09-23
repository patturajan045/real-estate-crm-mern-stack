import React from 'react';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../utils/formatters';

export default function BookingReceiptModal({ isOpen, onClose, booking }) {
  if (!isOpen || !booking) return null;

  const handlePrint = () => {
    window.print();
  };

  const balanceDue = (booking.agreementValue || 0) - (booking.bookingAmount || 0);

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
              <i className="fas fa-receipt text-primary me-2"></i>
              Booking Reservation Voucher
            </h5>
            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn btn-outline-secondary btn-sm d-none d-sm-inline-flex align-items-center gap-1"
                onClick={handlePrint}
              >
                <i className="fas fa-print"></i>
                <span>Print</span>
              </button>
              <button
                type="button"
                className="btn-close"
                onClick={onClose}
                aria-label="Close"
              ></button>
            </div>
          </div>

          <div className="modal-body p-4" id="printableBookingReceipt">
            {/* Voucher Header */}
            <div className="d-flex flex-column flex-sm-row justify-content-between align-items-start align-items-sm-center pb-3 mb-3 border-bottom gap-2">
              <div>
                <h4 className="fw-bold mb-0 text-primary">EstateFlow CRM</h4>
                <small className="text-muted">Official Property Reservation Acknowledgment</small>
              </div>
              <div className="text-sm-end">
                <span className={`badge ${getStatusBadgeClass(booking.status || 'Confirmed')} fs-6`}>
                  {booking.status || 'Confirmed'}
                </span>
                <div className="text-muted small mt-1">
                  Date: {formatDate(booking.bookingDate || booking.createdAt)}
                </div>
              </div>
            </div>

            {/* Reference Number */}
            <div className="bg-body-secondary p-2.5 rounded-3 mb-4 d-flex justify-content-between align-items-center">
              <span className="small text-muted">Reservation ID:</span>
              <span className="font-monospace fw-bold text-body small">
                {booking.id || booking._id}
              </span>
            </div>

            {/* Two Column Grid */}
            <div className="row g-3 mb-4">
              {/* Customer Details */}
              <div className="col-12 col-md-6">
                <div className="card bg-body-tertiary border-0 p-3 h-100">
                  <h6 className="fw-bold text-body mb-2">
                    <i className="fas fa-user text-primary me-1.5"></i>
                    Customer Details
                  </h6>
                  <div className="small mb-1">
                    <span className="text-muted">Name:</span>{' '}
                    <strong className="text-body">{booking.lead?.customerName || 'N/A'}</strong>
                  </div>
                  {booking.lead?.phoneNumber && (
                    <div className="small mb-1">
                      <span className="text-muted">Phone:</span>{' '}
                      <span className="text-body">{booking.lead.phoneNumber}</span>
                    </div>
                  )}
                  {booking.lead?.email && (
                    <div className="small mb-1">
                      <span className="text-muted">Email:</span>{' '}
                      <span className="text-body">{booking.lead.email}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Property Details */}
              <div className="col-12 col-md-6">
                <div className="card bg-body-tertiary border-0 p-3 h-100">
                  <h6 className="fw-bold text-body mb-2">
                    <i className="fas fa-building text-success me-1.5"></i>
                    Property Specifications
                  </h6>
                  <div className="small mb-1">
                    <span className="text-muted">Unit:</span>{' '}
                    <strong className="text-body">{booking.unit?.unitNumber || 'N/A'}</strong>
                  </div>
                  <div className="small mb-1">
                    <span className="text-muted">Project:</span>{' '}
                    <span className="text-body">{booking.unit?.project?.name || 'N/A'}</span>
                  </div>
                  <div className="small mb-1">
                    <span className="text-muted">Type:</span>{' '}
                    <span className="text-body">{booking.unit?.unitType || 'N/A'}</span>
                  </div>
                  {booking.unit?.carpetAreaSqFt && (
                    <div className="small">
                      <span className="text-muted">Carpet Area:</span>{' '}
                      <span className="text-body">{booking.unit.carpetAreaSqFt} sq.ft</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="card border-0 bg-body-secondary p-3 mb-3">
              <h6 className="fw-bold text-body mb-2">
                <i className="fas fa-money-bill-wave text-info me-1.5"></i>
                Financial Summary
              </h6>
              <div className="d-flex justify-content-between py-1 border-bottom border-light-subtle small">
                <span className="text-muted">Total Agreed Value:</span>
                <span className="fw-semibold text-body">{formatCurrency(booking.agreementValue || 0)}</span>
              </div>
              <div className="d-flex justify-content-between py-1 border-bottom border-light-subtle small">
                <span className="text-muted">Token / Booking Paid:</span>
                <span className="fw-bold text-success">{formatCurrency(booking.bookingAmount || 0)}</span>
              </div>
              <div className="d-flex justify-content-between py-1 small">
                <span className="text-muted">Remaining Balance:</span>
                <span className="fw-bold text-primary">{formatCurrency(balanceDue)}</span>
              </div>
              {booking.paymentMethod && (
                <div className="small text-muted mt-2 pt-2 border-top border-light-subtle">
                  Method: <strong>{booking.paymentMethod}</strong>
                  {booking.transactionReference && ` &bull; Ref: ${booking.transactionReference}`}
                </div>
              )}
            </div>

            {booking.notes && (
              <div className="small text-muted">
                <strong>Remarks:</strong> {booking.notes}
              </div>
            )}
          </div>

          <div className="modal-footer border-top py-3">
            <button
              type="button"
              className="btn btn-secondary btn-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
