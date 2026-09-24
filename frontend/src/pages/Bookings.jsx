import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import bookingService from '../services/bookingService';
import leadService from '../services/leadService';
import unitService from '../services/unitService';
import { useAuth } from '../context/AuthContext';
import { useCms } from '../context/CmsContext';
import {
  formatCurrency,
  formatDate,
  getStatusBadgeClass,
} from '../utils/formatters';
import { confirm, toast, error as showError } from '../utils/alerts';

import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatCard from '../components/common/StatCard';
import JqueryDataTable from '../components/common/JqueryDataTable';
import RecordActionModal from '../components/common/RecordActionModal';
import BookingModal from '../components/bookings/BookingModal';
import BookingReceiptModal from '../components/bookings/BookingReceiptModal';
import { exportToCsv } from '../utils/exportUtils';

export default function Bookings() {
  const { user } = useAuth();
  const { t } = useCms();
  const [searchParams] = useSearchParams();

  const [bookings, setBookings] = useState([]);
  const [leads, setLeads] = useState([]);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Status Filter
  const [statusFilter, setStatusFilter] = useState('All');

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedBookingForReceipt, setSelectedBookingForReceipt] = useState(null);

  // Mobile Record Action Sheet
  const [recordActionData, setRecordActionData] = useState(null);

  const initialFormData = {
    lead: '',
    unit: '',
    agreementValue: '',
    bookingAmount: '',
    paymentMethod: 'Bank Wire',
    transactionReference: '',
    notes: '',
  };
  const [formData, setFormData] = useState(initialFormData);

  const fetchBookings = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await bookingService.getBookings();
      if (res.status === 'success' && res.data) {
        setBookings(res.data);
        if (isRefresh) toast('Bookings refreshed successfully', 'success');
      }
    } catch {
      showError('Could not load bookings.');
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, []);

  const fetchDropdownData = useCallback(async () => {
    try {
      const [lRes, uRes] = await Promise.all([
        leadService.getLeads(),
        unitService.getUnits({ status: 'Available' }),
      ]);
      if (lRes.status === 'success') setLeads(lRes.data);
      if (uRes.status === 'success') setUnits(uRes.data);
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    fetchBookings();
    fetchDropdownData();
  }, [fetchBookings, fetchDropdownData]);

  // Handle URL actions
  useEffect(() => {
    if (searchParams.get('action') === 'new') {
      const leadId = searchParams.get('leadId') || '';
      const unitId = searchParams.get('unitId') || '';

      setFormData((prev) => ({
        ...prev,
        lead: leadId || prev.lead,
        unit: unitId || prev.unit,
      }));

      if (unitId && units.length > 0) {
        const matchingUnit = units.find((u) => (u.id || u._id) === unitId);
        if (matchingUnit) {
          setFormData((prev) => ({
            ...prev,
            agreementValue: matchingUnit.price || '',
            bookingAmount: matchingUnit.price ? Math.round(matchingUnit.price * 0.1) : '',
          }));
        }
      }
      setIsModalOpen(true);
    }
  }, [searchParams, units]);

  const handleOpenCreate = () => {
    setFormData(initialFormData);
    fetchDropdownData();
    setIsModalOpen(true);
  };

  const handleSelectUnit = (unit) => {
    setFormData((prev) => ({
      ...prev,
      agreementValue: unit.price || '',
      bookingAmount: unit.price ? Math.round(unit.price * 0.1) : '',
    }));
  };

  const handleSubmitBooking = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
        ...formData,
        bookedBy: user?.id,
        agreementValue: Number(formData.agreementValue),
        bookingAmount: Number(formData.bookingAmount),
      };

      const res = await bookingService.createBooking(payload);
      if (res.status === 'success') {
        toast('Booking reservation confirmed & unit secured!', 'success');
        setIsModalOpen(false);
        setFormData(initialFormData);
        fetchBookings();
        fetchDropdownData();

        if (res.data) {
          setSelectedBookingForReceipt(res.data);
          setIsReceiptOpen(true);
        }
      }
    } catch (err) {
      if (err.response?.status === 409) {
        showError('Double Booking Guard: This unit was just reserved by another agent. Please select another unit.');
      } else {
        showError(err.response?.data?.message || err.message || 'Failed to create booking');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancelBooking = async (booking) => {
    const ok = await confirm(
      'Cancel Reservation?',
      `Are you sure you want to cancel the booking for unit "${booking.unit?.unitNumber || 'Unit'}"? The unit will be released back to Available status.`,
      'Yes, Cancel Booking'
    );
    if (!ok) return;

    try {
      await bookingService.cancelBooking(booking.id || booking._id);
      toast('Booking cancelled and unit released back to Available.', 'info');
      fetchBookings();
      fetchDropdownData();
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Failed to cancel booking');
    }
  };

  const handleViewReceipt = (booking) => {
    setSelectedBookingForReceipt(booking);
    setIsReceiptOpen(true);
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = bookings.length;
    const confirmed = bookings.filter((b) => b.status === 'Confirmed').length;
    const revenue = bookings
      .filter((b) => b.status !== 'Cancelled')
      .reduce((acc, b) => acc + (b.agreementValue || 0), 0);
    const collected = bookings
      .filter((b) => b.status !== 'Cancelled')
      .reduce((acc, b) => acc + (b.bookingAmount || 0), 0);
    return { total, confirmed, revenue, collected };
  }, [bookings]);

  // Filtered Bookings
  const filteredBookings = useMemo(() => {
    if (statusFilter === 'All') return bookings;
    return bookings.filter((b) => b.status === statusFilter);
  }, [bookings, statusFilter]);

  // Export Bookings to Excel / CSV
  const handleExportBookings = () => {
    const list = filteredBookings.length > 0 ? filteredBookings : bookings;
    if (list.length === 0) {
      toast('No bookings available to export', 'info');
      return;
    }
    const headers = [
      'Booking Number',
      'Unit Number',
      'Project Name',
      'Customer Lead',
      'Phone Number',
      'Email',
      'Agreement Value (INR)',
      'Booking Amount (INR)',
      'Status',
      'Booking Date',
    ];
    const rows = list.map((b) => [
      b.bookingNumber || '',
      b.unit?.unitNumber || b.unitNumber || '',
      b.unit?.project?.name || b.projectName || '',
      b.lead?.customerName || b.leadName || '',
      b.lead?.phoneNumber || '',
      b.lead?.email || '',
      b.agreementValue || 0,
      b.bookingAmount || 0,
      b.status || '',
      formatDate(b.bookingDate || b.createdAt),
    ]);
    const dateStr = new Date().toISOString().slice(0, 10);
    exportToCsv(`Bookings_Report_${dateStr}.csv`, headers, rows);
    toast(`Exported ${list.length} bookings to Excel successfully!`, 'success');
  };

  // DataTables Columns
  const tableColumns = useMemo(
    () => [
      {
        title: 'Unit',
        data: 'unit',
        render: (data) => `
          <div class="fw-bold text-body">${data?.unitNumber || '-'}</div>
          <small class="text-muted">${data?.project?.name || ''}</small>
        `,
      },
      {
        title: 'Customer Lead',
        data: 'lead',
        render: (data) => `
          <div class="fw-semibold text-body">${data?.customerName || '-'}</div>
          <small class="text-muted">${data?.phoneNumber || '-'}</small>
        `,
      },
      {
        title: 'Agreement Value',
        data: 'agreementValue',
        render: (data) => `<span class="fw-bold text-body">${formatCurrency(data || 0)}</span>`,
      },
      {
        title: 'Booking Amount',
        data: 'bookingAmount',
        render: (data) => `<span class="fw-semibold text-success">${formatCurrency(data || 0)}</span>`,
      },
      {
        title: 'Booking Date',
        data: 'bookingDate',
        render: (data, type, row) => `<small class="text-muted">${formatDate(data || row.createdAt)}</small>`,
      },
      {
        title: 'Status',
        data: 'status',
        render: (data) => `<span class="badge ${getStatusBadgeClass(data)}">${data}</span>`,
      },
      {
        title: 'Actions',
        data: null,
        orderable: false,
        className: 'text-end',
        render: (data, type, row) => `
          <div class="btn-group btn-group-sm">
            <button type="button" class="btn btn-outline-primary btn-sm" data-action="receipt" title="View Reservation Voucher">
              <i class="fas fa-receipt"></i>
            </button>
            ${
              row.status !== 'Cancelled'
                ? `<button type="button" class="btn btn-outline-danger btn-sm" data-action="cancel" title="Cancel Booking & Release Unit">
                    <i class="fas fa-ban"></i>
                  </button>`
                : ''
            }
          </div>
        `,
      },
    ],
    []
  );

  const handleTableAction = (action, booking) => {
    if (action === 'receipt') handleViewReceipt(booking);
    else if (action === 'cancel') handleCancelBooking(booking);
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading bookings and agreements..." />;
  }

  return (
    <div className="crm-bookings-page">
      <PageHeader
        title={t('bookings_title', 'Bookings Management')}
        subtitle={t('bookings_subtitle', 'Connect customer leads with property units and process reservation agreements')}
        primaryActionLabel="New Booking"
        primaryActionIcon="fa-plus"
        onPrimaryAction={handleOpenCreate}
        onRefresh={() => fetchBookings(true)}
        refreshing={refreshing}
        onExport={handleExportBookings}
        exportLabel="Export Excel"
      />

      {/* KPI Summary Cards */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3 mb-4">
        <div className="col">
          <StatCard
            title="Total Bookings"
            value={metrics.total}
            icon="fa-file-signature"
            colorClass="text-primary"
            bgClass="bg-primary-subtle"
            subtitle={`${metrics.confirmed} confirmed`}
          />
        </div>
        <div className="col">
          <StatCard
            title="Confirmed Agreements"
            value={metrics.confirmed}
            icon="fa-circle-check"
            colorClass="text-success"
            bgClass="bg-success-subtle"
            subtitle="Secured inventory"
          />
        </div>
        <div className="col">
          <StatCard
            title="Total Value"
            value={formatCurrency(metrics.revenue)}
            icon="fa-money-bill-trend-up"
            colorClass="text-info"
            bgClass="bg-info-subtle"
            subtitle="Agreed gross sales"
          />
        </div>
        <div className="col">
          <StatCard
            title="Token Collected"
            value={formatCurrency(metrics.collected)}
            icon="fa-hand-holding-dollar"
            colorClass="text-warning"
            bgClass="bg-warning-subtle"
            subtitle="Cash in hand / account"
          />
        </div>
      </div>

      {/* Filter Bar */}
      <div className="card crm-card border-0 shadow-sm p-3 mb-3">
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2">
          <div className="btn-group btn-group-sm" role="group">
            {['All', 'Confirmed', 'Under Review', 'Cancelled'].map((st) => (
              <button
                key={st}
                type="button"
                className={`btn ${statusFilter === st ? 'btn-primary' : 'btn-outline-secondary'}`}
                onClick={() => setStatusFilter(st)}
              >
                {st}
              </button>
            ))}
          </div>

          <span className="text-muted small">
            Showing <strong>{filteredBookings.length}</strong> of {bookings.length} agreements
          </span>
        </div>
      </div>

      {/* Responsive Data Table */}
      <div className="card crm-card border-0 shadow-sm">
        <div className="card-body p-3">
          <JqueryDataTable
            columns={tableColumns}
            data={filteredBookings}
            onAction={handleTableAction}
            tableId="bookingsDataTable"
          />
        </div>
      </div>

      {/* Booking Form Modal */}
      <BookingModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        formData={formData}
        onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
        onSelectUnit={handleSelectUnit}
        onSubmit={handleSubmitBooking}
        leads={leads}
        availableUnits={units}
        submitting={submitting}
      />

      {/* Booking Receipt Voucher Modal */}
      <BookingReceiptModal
        isOpen={isReceiptOpen}
        onClose={() => setIsReceiptOpen(false)}
        booking={selectedBookingForReceipt}
      />

      {/* Mobile Record Action Sheet */}
      <RecordActionModal
        isOpen={Boolean(recordActionData)}
        onClose={() => setRecordActionData(null)}
        record={recordActionData}
        recordType="booking"
        onViewReceipt={(b) => handleViewReceipt(b)}
        onCancelBooking={(b) => handleCancelBooking(b)}
      />
    </div>
  );
}
