import React from 'react';
import { formatCurrency } from '../../utils/formatters';

export default function BookingModal({
  isOpen,
  onClose,
  formData,
  onChange,
  onSelectUnit,
  onSubmit,
  leads = [],
  availableUnits = [],
  submitting = false,
}) {
  if (!isOpen) return null;

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
              <i className="fas fa-file-signature text-primary me-2"></i>
              Process Property Reservation Booking
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
              {/* Atomic Concurrency Notice */}
              <div className="alert alert-info py-2.5 px-3 d-flex align-items-center gap-2 mb-3">
                <i className="fas fa-shield-halved text-info fs-5 flex-shrink-0"></i>
                <div className="small">
                  <strong>Atomic Double Booking Protection:</strong> Unit availability is atomically verified upon submission. No two agents can accidentally book the same unit.
                </div>
              </div>

              <div className="row g-3">
                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Customer Lead *</label>
                  <select
                    name="lead"
                    className="form-select"
                    required
                    value={formData.lead}
                    onChange={onChange}
                  >
                    <option value="">Select Customer Lead</option>
                    {leads.map((l) => (
                      <option key={l.id || l._id} value={l.id || l._id}>
                        {l.customerName} ({l.phoneNumber || l.stage})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Property Unit *</label>
                  <select
                    name="unit"
                    className="form-select"
                    required
                    value={formData.unit}
                    onChange={(e) => {
                      onChange(e);
                      const selectedUnit = availableUnits.find(
                        (u) => (u.id || u._id) === e.target.value
                      );
                      if (selectedUnit && onSelectUnit) {
                        onSelectUnit(selectedUnit);
                      }
                    }}
                  >
                    <option value="">Select Available Unit</option>
                    {availableUnits.map((u) => (
                      <option key={u.id || u._id} value={u.id || u._id}>
                        {u.unitNumber} - {u.project?.name} ({u.unitType}, {formatCurrency(u.price || 0)})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Total Agreement Value ($) *</label>
                  <input
                    type="number"
                    name="agreementValue"
                    className="form-control"
                    placeholder="250000"
                    required
                    value={formData.agreementValue}
                    onChange={onChange}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Token / Booking Amount Paid ($) *</label>
                  <input
                    type="number"
                    name="bookingAmount"
                    className="form-control"
                    placeholder="25000"
                    required
                    value={formData.bookingAmount}
                    onChange={onChange}
                  />
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Payment Method</label>
                  <select
                    name="paymentMethod"
                    className="form-select"
                    value={formData.paymentMethod}
                    onChange={onChange}
                  >
                    <option value="Bank Wire">Bank Wire Transfer</option>
                    <option value="Cheque">Cheque</option>
                    <option value="Online / Card">Online / Card</option>
                    <option value="Cash">Cash</option>
                    <option value="Demand Draft">Demand Draft</option>
                  </select>
                </div>

                <div className="col-12 col-md-6">
                  <label className="form-label small fw-semibold">Transaction / Cheque Reference</label>
                  <input
                    type="text"
                    name="transactionReference"
                    className="form-control"
                    placeholder="e.g. TXN-8921-AZURE"
                    value={formData.transactionReference}
                    onChange={onChange}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label small fw-semibold">Booking Terms & Notes</label>
                  <textarea
                    name="notes"
                    className="form-control"
                    rows="2"
                    placeholder="Special payment plan conditions, possession target, remarks..."
                    value={formData.notes}
                    onChange={onChange}
                  ></textarea>
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
                    <span>Securing Reservation...</span>
                  </>
                ) : (
                  <>
                    <i className="fas fa-lock"></i>
                    <span>Confirm & Secure Booking</span>
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
