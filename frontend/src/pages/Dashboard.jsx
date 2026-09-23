import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../services/dashboardService';
import leadService from '../services/leadService';
import { useAuth } from '../context/AuthContext';
import { useCms } from '../context/CmsContext';
import { toast, error as showError } from '../utils/alerts';

import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import DashboardKpiCards from '../components/dashboard/DashboardKpiCards';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import DashboardFollowupsTable from '../components/dashboard/DashboardFollowupsTable';
import DashboardRecentBookings from '../components/dashboard/DashboardRecentBookings';
import QuickLeadModal from '../components/dashboard/QuickLeadModal';
import QuickNoteModal from '../components/dashboard/QuickNoteModal';

export default function Dashboard() {
  const { user } = useAuth();
  const { t } = useCms();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submittingLead, setSubmittingLead] = useState(false);
  const [submittingNote, setSubmittingNote] = useState(false);
  const [data, setData] = useState(null);

  // Modals state
  const [isQuickLeadModalOpen, setIsQuickLeadModalOpen] = useState(false);
  const [isQuickNoteModalOpen, setIsQuickNoteModalOpen] = useState(false);
  const [selectedLeadForNote, setSelectedLeadForNote] = useState(null);

  // Quick Lead Form
  const [leadFormData, setLeadFormData] = useState({
    customerName: '',
    phoneNumber: '',
    email: '',
    stage: 'New',
    preferredUnitType: '',
    budgetMin: '',
    budgetMax: '',
    initialNote: '',
  });

  // Quick Note Form
  const [noteFormData, setNoteFormData] = useState({
    content: '',
    stage: '',
    nextFollowUpDate: '',
  });

  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await dashboardService.getStats();
      if (res.status === 'success' && res.data) {
        setData(res.data);
        if (isRefresh) toast('Dashboard metrics refreshed successfully', 'success');
      }
    } catch {
      showError('Could not load dashboard statistics. Please refresh.');
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle Quick Lead Creation
  const handleCreateLead = async (e) => {
    e.preventDefault();
    setSubmittingLead(true);
    try {
      const payload = { ...leadFormData };
      if (user && user.role === 'Sales Employee') {
        payload.assignedTo = user.id;
      }
      const initialNote = payload.initialNote;
      delete payload.initialNote;

      const res = await leadService.createLead(payload);
      if (res.status === 'success' && res.data) {
        if (initialNote) {
          await leadService.addNote(res.data.id, initialNote);
        }
        setIsQuickLeadModalOpen(false);
        setLeadFormData({
          customerName: '',
          phoneNumber: '',
          email: '',
          stage: 'New',
          preferredUnitType: '',
          budgetMin: '',
          budgetMax: '',
          initialNote: '',
        });
        toast('Lead created successfully!', 'success');
        fetchDashboardData();
      }
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Failed to create lead');
    } finally {
      setSubmittingLead(false);
    }
  };

  // Open Quick Note Modal
  const handleOpenQuickNote = (lead) => {
    setSelectedLeadForNote(lead);
    setNoteFormData({
      content: '',
      stage: lead.stage || '',
      nextFollowUpDate: lead.nextFollowUpDate ? lead.nextFollowUpDate.split('T')[0] : '',
    });
    setIsQuickNoteModalOpen(true);
  };

  // Handle Quick Note Saving
  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!selectedLeadForNote) return;
    setSubmittingNote(true);

    try {
      await leadService.addNote(selectedLeadForNote.id || selectedLeadForNote._id, noteFormData.content);

      if (noteFormData.stage || noteFormData.nextFollowUpDate) {
        const updatePayload = {};
        if (noteFormData.stage) updatePayload.stage = noteFormData.stage;
        if (noteFormData.nextFollowUpDate) updatePayload.nextFollowUpDate = noteFormData.nextFollowUpDate;
        await leadService.updateLead(selectedLeadForNote.id || selectedLeadForNote._id, updatePayload);
      }

      setIsQuickNoteModalOpen(false);
      setSelectedLeadForNote(null);
      setNoteFormData({ content: '', stage: '', nextFollowUpDate: '' });
      toast('Activity logged successfully!', 'success');
      fetchDashboardData();
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Failed to log activity');
    } finally {
      setSubmittingNote(false);
    }
  };

  const scrollToFollowups = () => {
    const el = document.getElementById('sectionFollowups');
    if (el) el.scrollIntoView({ behavior: 'smooth' });
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading CRM dashboard insights..." />;
  }

  return (
    <div className="crm-dashboard">
      <PageHeader
        title={t('dashboard_title', 'Sales & Inventory Dashboard')}
        subtitle={t('dashboard_subtitle', 'Live metrics, lead pipeline progress, and upcoming follow-ups')}
        primaryActionLabel="Quick Lead"
        primaryActionIcon="fa-plus"
        onPrimaryAction={() => setIsQuickLeadModalOpen(true)}
        onRefresh={() => fetchDashboardData(true)}
        refreshing={refreshing}
      />

      {/* 4 Responsive KPI Metric Cards */}
      <DashboardKpiCards
        data={data}
        onScrollToFollowups={scrollToFollowups}
        onNavigateLeads={() => navigate('/leads')}
        onNavigateProperties={() => navigate('/properties')}
        onNavigateBookings={() => navigate('/bookings')}
      />

      {/* Analytics Charts: Pipeline Bar Chart + Inventory Doughnut Chart */}
      <DashboardCharts data={data} />

      {/* Responsive Follow-ups List */}
      <DashboardFollowupsTable
        followups={data?.urgentFollowUps || []}
        onOpenQuickNote={handleOpenQuickNote}
        onNavigateLead={(leadId) => navigate(`/leads?search=${leadId}`)}
        onOpenQuickLead={() => setIsQuickLeadModalOpen(true)}
      />

      {/* Recent Bookings & Agreements */}
      <DashboardRecentBookings
        bookings={data?.recentBookings || []}
        onNavigateBookings={() => navigate('/bookings')}
        onNavigateBookingItem={(booking) => navigate(`/bookings?highlight=${booking.id || booking._id}`)}
      />

      {/* Quick Lead Modal */}
      <QuickLeadModal
        isOpen={isQuickLeadModalOpen}
        onClose={() => setIsQuickLeadModalOpen(false)}
        formData={leadFormData}
        onChange={(e) => setLeadFormData({ ...leadFormData, [e.target.name]: e.target.value })}
        onSubmit={handleCreateLead}
        submitting={submittingLead}
      />

      {/* Quick Note Modal */}
      <QuickNoteModal
        isOpen={isQuickNoteModalOpen}
        onClose={() => setIsQuickNoteModalOpen(false)}
        lead={selectedLeadForNote}
        formData={noteFormData}
        onChange={(e) => setNoteFormData({ ...noteFormData, [e.target.name]: e.target.value })}
        onSubmit={handleSaveNote}
        submitting={submittingNote}
      />
    </div>
  );
}
