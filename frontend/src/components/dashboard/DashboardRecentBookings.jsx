import React from 'react';
import { formatCurrency, formatDate, getStatusBadgeClass } from '../../utils/formatters';
import { useCms } from '../../context/CmsContext';
import EmptyState from '../common/EmptyState';

export default function DashboardRecentBookings({
  bookings = [],
  onNavigateBookings,
  onNavigateBookingItem,
}) {
  const { t } = useCms();

  return (
    <div className="card crm-card border-0 shadow-sm mb-4">
      <div className="card-header bg-transparent border-bottom d-flex align-items-center justify-content-between py-3">
        <div className="d-flex align-items-center gap-2">
          <i className="fas fa-file-contract text-info fs-5"></i>
          <h5 className="card-title fw-bold mb-0 text-body" style={{ fontSize: 'var(--crm-font-h3)' }}>
            {t('dashboard_bookings_heading', 'Recent Bookings & Agreements')}
          </h5>
        </div>
        <button
          type="button"
          className="btn btn-sm btn-link text-decoration-none p-0 fw-medium"
          onClick={onNavigateBookings}
        >
          View All <i className="fas fa-arrow-right ms-1 small"></i>
        </button>
      </div>

      <div className="card-body p-0">
        {bookings.length === 0 ? (
          <EmptyState
            icon="fa-file-signature"
            title="No bookings recorded yet"
            description="Bookings processed from converted leads will be tracked and displayed here."
            actionLabel="View Bookings"
            onAction={onNavigateBookings}
          />
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0 w-100">
              <thead className="table-light">
                <tr>
                  <th scope="col" className="ps-3">Unit</th>
                  <th scope="col">Customer Lead</th>
                  <th scope="col">Agreement Value</th>
                  <th scope="col">Booking Date</th>
                  <th scope="col">Status</th>
                  <th scope="col" className="text-end pe-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id || booking._id}>
                    <td className="ps-3">
                      <div className="fw-semibold text-body">
                        {booking.unit?.unitNumber || 'Unit'}
                      </div>
                      <small className="text-muted">
                        {booking.unit?.project?.name || ''}
                      </small>
                    </td>

                    <td>
                      <div className="fw-medium text-body">
                        {booking.lead?.customerName || 'N/A'}
                      </div>
                      {booking.lead?.phoneNumber && (
                        <small className="text-muted">
                          {booking.lead.phoneNumber}
                        </small>
                      )}
                    </td>

                    <td>
                      <span className="fw-bold text-body">
                        {formatCurrency(booking.agreementValue || 0)}
                      </span>
                    </td>

                    <td>
                      <small className="text-muted">
                        {formatDate(booking.bookingDate || booking.createdAt)}
                      </small>
                    </td>

                    <td>
                      <span className={`badge ${getStatusBadgeClass(booking.status || 'Confirmed')}`}>
                        {booking.status || 'Confirmed'}
                      </span>
                    </td>

                    <td className="text-end pe-3">
                      <button
                        type="button"
                        className="btn btn-outline-secondary btn-sm"
                        onClick={() => onNavigateBookingItem ? onNavigateBookingItem(booking) : onNavigateBookings()}
                        title="View Booking Details"
                        aria-label="View Details"
                      >
                        <i className="fas fa-arrow-right"></i>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
