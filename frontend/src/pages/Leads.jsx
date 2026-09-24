import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import leadService from '../services/leadService';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useCms } from '../context/CmsContext';
import {
  formatCurrency,
  formatDate,
  getInitials,
  getStageBadgeClass,
} from '../utils/formatters';
import { confirm, toast, error as showError } from '../utils/alerts';

import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import JqueryDataTable from '../components/common/JqueryDataTable';
import RecordActionModal from '../components/common/RecordActionModal';
import LeadStatsCards from '../components/leads/LeadStatsCards';
import LeadFilterBar from '../components/leads/LeadFilterBar';
import LeadModal from '../components/leads/LeadModal';
import LeadNotesModal from '../components/leads/LeadNotesModal';
import { exportToCsv } from '../utils/exportUtils';

export default function Leads() {
  const { user } = useAuth();
  const { t } = useCms();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [leads, setLeads] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submittingLead, setSubmittingLead] = useState(false);
  const [submittingNote, setSubmittingNote] = useState(false);

  // Filters
  const [stageFilter, setStageFilter] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');

  // Modals
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isNotesModalOpen, setIsNotesModalOpen] = useState(false);
  const [editingLeadId, setEditingLeadId] = useState(null);
  const [activeLead, setActiveLead] = useState(null);

  // Mobile Record Action Sheet
  const [recordActionData, setRecordActionData] = useState(null);

  // Form State
  const initialFormData = {
    customerName: '',
    email: '',
    phoneNumber: '',
    city: '',
    stage: 'New',
    source: 'Website',
    preferredUnitType: '',
    budgetMin: '',
    budgetMax: '',
    assignedTo: '',
    nextFollowUpDate: '',
    address: '',
  };
  const [formData, setFormData] = useState(initialFormData);

  // New Note State
  const [noteContent, setNoteContent] = useState('');
  const [noteStage, setNoteStage] = useState('');
  const [noteNextDate, setNoteNextDate] = useState('');

  const fetchLeads = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const params = {};
      if (stageFilter !== 'All') params.stage = stageFilter;
      const res = await leadService.getLeads(params);
      if (res.status === 'success' && res.data) {
        setLeads(res.data);
        if (isRefresh) toast('Leads refreshed successfully', 'success');
      }
    } catch {
      showError('Could not load leads.');
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, [stageFilter]);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await userService.getUsers();
      if (res.status === 'success' && res.data) {
        setUsersList(res.data);
      }
    } catch {
      // Ignore
    }
  }, []);

  useEffect(() => {
    fetchLeads();
    fetchUsers();
  }, [fetchLeads, fetchUsers]);

  // Open Add Modal from URL param
  useEffect(() => {
    if (searchParams.get('action') === 'add') {
      handleOpenCreate();
    }
    const searchVal = searchParams.get('search');
    if (searchVal) {
      setSearchTerm(searchVal);
    }
  }, [searchParams]);

  const handleOpenCreate = () => {
    setEditingLeadId(null);
    setFormData({
      ...initialFormData,
      assignedTo: user?.role === 'Sales Employee' ? user.id : '',
    });
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (lead) => {
    setEditingLeadId(lead.id || lead._id);
    setFormData({
      customerName: lead.customerName || '',
      email: lead.email || '',
      phoneNumber: lead.phoneNumber || '',
      city: lead.city || '',
      stage: lead.stage || 'New',
      source: lead.source || 'Website',
      preferredUnitType: lead.preferredUnitType || '',
      budgetMin: lead.budgetMin ?? '',
      budgetMax: lead.budgetMax ?? '',
      assignedTo: lead.assignedTo?.id || lead.assignedTo?._id || lead.assignedTo || '',
      nextFollowUpDate: lead.nextFollowUpDate ? lead.nextFollowUpDate.split('T')[0] : '',
      address: lead.address || '',
    });
    setIsFormModalOpen(true);
  };

  const handleOpenNotes = (lead) => {
    setActiveLead(lead);
    setNoteContent('');
    setNoteStage(lead.stage || '');
    setNoteNextDate(lead.nextFollowUpDate ? lead.nextFollowUpDate.split('T')[0] : '');
    setIsNotesModalOpen(true);
  };

  const handleSubmitLead = async (e) => {
    e.preventDefault();
    setSubmittingLead(true);
    try {
      const payload = { ...formData };
      if (!payload.assignedTo) delete payload.assignedTo;
      if (!payload.nextFollowUpDate) delete payload.nextFollowUpDate;

      if (editingLeadId) {
        await leadService.updateLead(editingLeadId, payload);
        toast('Lead updated successfully!', 'success');
      } else {
        await leadService.createLead(payload);
        toast('Lead created successfully!', 'success');
      }
      setIsFormModalOpen(false);
      fetchLeads();
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Failed to save lead');
    } finally {
      setSubmittingLead(false);
    }
  };

  const handleSubmitNote = async (e) => {
    e.preventDefault();
    if (!activeLead) return;
    setSubmittingNote(true);

    try {
      const leadId = activeLead.id || activeLead._id;
      await leadService.addNote(leadId, noteContent);

      if (noteStage || noteNextDate) {
        const updatePayload = {};
        if (noteStage) updatePayload.stage = noteStage;
        if (noteNextDate) updatePayload.nextFollowUpDate = noteNextDate;
        await leadService.updateLead(leadId, updatePayload);
      }

      toast('Note saved and lead updated!', 'success');
      setNoteContent('');
      fetchLeads();
      const updatedRes = await leadService.getLeadById(leadId);
      if (updatedRes.status === 'success') {
        setActiveLead(updatedRes.data);
      }
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Failed to add note');
    } finally {
      setSubmittingNote(false);
    }
  };

  const handleDeleteLead = async (lead) => {
    const isConfirmed = await confirm(
      'Delete Lead?',
      `Are you sure you want to permanently delete lead for "${lead.customerName}"?`,
      'Yes, Delete'
    );
    if (!isConfirmed) return;

    try {
      await leadService.deleteLead(lead.id || lead._id);
      toast('Lead removed successfully.', 'info');
      fetchLeads();
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Failed to delete lead');
    }
  };

  // Convert to booking
  const handleConvertToBooking = (lead) => {
    navigate(`/bookings?action=new&leadId=${lead.id || lead._id}`);
  };

  // Filtered Leads
  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      const term = searchTerm.toLowerCase();
      const matchSearch =
        !term ||
        (lead.customerName && lead.customerName.toLowerCase().includes(term)) ||
        (lead.phoneNumber && lead.phoneNumber.includes(term)) ||
        (lead.email && lead.email.toLowerCase().includes(term)) ||
        (lead.city && lead.city.toLowerCase().includes(term)) ||
        (lead.id && lead.id.toLowerCase().includes(term));

      const matchStage = stageFilter === 'All' || lead.stage === stageFilter;
      return matchSearch && matchStage;
    });
  }, [leads, searchTerm, stageFilter]);

  // Export filtered leads to Excel / CSV
  const handleExportLeads = () => {
    const leadsToExport = filteredLeads.length > 0 ? filteredLeads : leads;
    if (leadsToExport.length === 0) {
      toast('No leads available to export', 'info');
      return;
    }
    const headers = [
      'Customer Name',
      'Email',
      'Phone Number',
      'City',
      'Stage',
      'Source',
      'Preferred Unit',
      'Budget Min',
      'Budget Max',
      'Assigned Agent',
      'Next Follow-up Date',
      'Created Date',
    ];
    const rows = leadsToExport.map((l) => [
      l.customerName || '',
      l.email || '',
      l.phoneNumber || '',
      l.city || '',
      l.stage || 'New',
      l.source || '',
      l.preferredUnitType || '',
      l.budgetMin || '',
      l.budgetMax || '',
      l.assignedTo?.name || (typeof l.assignedTo === 'string' ? l.assignedTo : 'Unassigned'),
      l.nextFollowUpDate ? new Date(l.nextFollowUpDate).toLocaleDateString() : '',
      formatDate(l.createdAt || l.addedTime),
    ]);
    const dateStr = new Date().toISOString().slice(0, 10);
    exportToCsv(`Leads_Pipeline_${dateStr}.csv`, headers, rows);
    toast(`Exported ${leadsToExport.length} leads to Excel successfully!`, 'success');
  };

  // DataTables Columns
  const tableColumns = useMemo(
    () => [
      {
        title: 'Customer',
        data: 'customerName',
        render: (data, type, row) => `
          <div class="d-flex align-items-center gap-2">
            <div class="rounded-circle bg-primary-subtle text-primary d-flex align-items-center justify-content-center fw-bold small flex-shrink-0" style="width:34px;height:34px;">
              ${getInitials(data)}
            </div>
            <div class="min-w-0">
              <span class="fw-semibold text-body text-truncate d-block">${data || '-'}</span>
              <small class="text-muted text-truncate d-block">${row.email || '-'}</small>
            </div>
          </div>
        `,
      },
      {
        title: 'Phone',
        data: 'phoneNumber',
        render: (data) =>
          data
            ? `<a href="tel:${data}" class="text-decoration-none text-body small"><i class="fas fa-phone-alt text-success me-1"></i>${data}</a>`
            : '-',
      },
      {
        title: 'Stage',
        data: 'stage',
        render: (data) =>
          `<span class="badge ${getStageBadgeClass(data)}">${data || 'New'}</span>`,
      },
      {
        title: 'Budget',
        data: 'budgetMax',
        render: (data, type, row) => {
          if (!row.budgetMin && !row.budgetMax) return '-';
          if (row.budgetMin && row.budgetMax) {
            return `<small class="text-body fw-medium">${formatCurrency(row.budgetMin)} - ${formatCurrency(row.budgetMax)}</small>`;
          }
          return `<small class="text-body fw-medium">Up to ${formatCurrency(row.budgetMax || row.budgetMin)}</small>`;
        },
      },
      {
        title: 'Assigned Agent',
        data: 'assignedTo',
        render: (data) =>
          data && data.name
            ? `<small class="text-body fw-medium"><i class="fas fa-user-tie text-muted me-1"></i>${data.name}</small>`
            : '<span class="text-muted small">Unassigned</span>',
      },
      {
        title: 'Follow-up Due',
        data: 'nextFollowUpDate',
        render: (data) => {
          if (!data) return '<span class="text-muted small">None</span>';
          const isOverdue = new Date(data) < new Date();
          return `
            <div class="d-flex align-items-center gap-1">
              <i class="fas fa-clock ${isOverdue ? 'text-danger' : 'text-muted'} small"></i>
              <small class="${isOverdue ? 'text-danger fw-semibold' : 'text-body'}">${formatDate(data)}</small>
            </div>
          `;
        },
      },
      {
        title: 'Actions',
        data: null,
        orderable: false,
        className: 'text-end',
        render: () => `
          <div class="btn-group btn-group-sm">
            <button type="button" class="btn btn-outline-primary btn-sm" data-action="notes" title="Notes & History">
              <i class="fas fa-comment-dots"></i>
            </button>
            <button type="button" class="btn btn-outline-secondary btn-sm" data-action="edit" title="Edit Lead">
              <i class="fas fa-pen-to-square"></i>
            </button>
            <button type="button" class="btn btn-outline-success btn-sm" data-action="convert" title="Convert to Booking">
              <i class="fas fa-file-signature"></i>
            </button>
            <button type="button" class="btn btn-outline-danger btn-sm" data-action="delete" title="Delete Lead">
              <i class="fas fa-trash-can"></i>
            </button>
          </div>
        `,
      },
    ],
    []
  );

  const handleTableAction = (action, lead) => {
    switch (action) {
      case 'notes':
        handleOpenNotes(lead);
        break;
      case 'edit':
        handleOpenEdit(lead);
        break;
      case 'convert':
        handleConvertToBooking(lead);
        break;
      case 'delete':
        handleDeleteLead(lead);
        break;
      default:
        break;
    }
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading leads pipeline..." />;
  }

  return (
    <div className="crm-leads-page">
      <PageHeader
        title={t('leads_title', 'Leads Management')}
        subtitle={t('leads_subtitle', 'Manage prospect pipeline, schedule follow-ups, and convert leads to bookings')}
        primaryActionLabel="New Lead"
        primaryActionIcon="fa-user-plus"
        onPrimaryAction={handleOpenCreate}
        onRefresh={() => fetchLeads(true)}
        refreshing={refreshing}
        onExport={handleExportLeads}
        exportLabel="Export Excel"
      />

      {/* Stage Summary Cards */}
      <LeadStatsCards
        leads={leads}
        activeStage={stageFilter}
        onSelectStage={(st) => setStageFilter(st)}
      />

      {/* Search & Filter Bar */}
      <LeadFilterBar
        searchTerm={searchTerm}
        onSearchChange={setSearchTerm}
        activeStage={stageFilter}
        onStageChange={setStageFilter}
        totalCount={leads.length}
        filteredCount={filteredLeads.length}
      />

      {/* Responsive Data Table */}
      <div className="card crm-card border-0 shadow-sm">
        <div className="card-body p-3">
          <JqueryDataTable
            columns={tableColumns}
            data={filteredLeads}
            onAction={handleTableAction}
            tableId="leadsDataTable"
          />
        </div>
      </div>

      {/* Lead Create / Edit Modal */}
      <LeadModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        isEditing={Boolean(editingLeadId)}
        formData={formData}
        onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
        onSubmit={handleSubmitLead}
        usersList={usersList}
        submitting={submittingLead}
      />

      {/* Lead Notes & Activity Modal */}
      <LeadNotesModal
        isOpen={isNotesModalOpen}
        onClose={() => setIsNotesModalOpen(false)}
        lead={activeLead}
        noteContent={noteContent}
        onNoteContentChange={setNoteContent}
        noteStage={noteStage}
        onNoteStageChange={setNoteStage}
        noteNextDate={noteNextDate}
        onNoteNextDateChange={setNoteNextDate}
        onSubmitNote={handleSubmitNote}
        submitting={submittingNote}
      />

      {/* Mobile Record Action Sheet */}
      <RecordActionModal
        isOpen={Boolean(recordActionData)}
        onClose={() => setRecordActionData(null)}
        record={recordActionData}
        recordType="lead"
        onEdit={(lead) => handleOpenEdit(lead)}
        onDelete={(lead) => handleDeleteLead(lead)}
        onLogActivity={(lead) => handleOpenNotes(lead)}
        onBookLead={(lead) => handleConvertToBooking(lead)}
      />
    </div>
  );
}
