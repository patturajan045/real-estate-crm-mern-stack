import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import dashboardService from '../services/dashboardService';
import leadService from '../services/leadService';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { toast, error as showError } from '../utils/alerts';

import LoadingSpinner from '../components/common/LoadingSpinner';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import QuickActionsRow from '../components/dashboard/QuickActionsRow';
import DashboardKpiCards from '../components/dashboard/DashboardKpiCards';
import LeadFunnelOverview from '../components/dashboard/LeadFunnelOverview';
import DashboardCharts from '../components/dashboard/DashboardCharts';
import PortfolioOccupancySection from '../components/dashboard/PortfolioOccupancySection';
import DashboardRecentTables from '../components/dashboard/DashboardRecentTables';
import DashboardFollowupsTable from '../components/dashboard/DashboardFollowupsTable';
import QuickLeadModal from '../components/dashboard/QuickLeadModal';
import QuickNoteModal from '../components/dashboard/QuickNoteModal';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submittingLead, setSubmittingLead] = useState(false);
  const [submittingNote, setSubmittingNote] = useState(false);
  const [data, setData] = useState(null);
  const [usersList, setUsersList] = useState([]);

  // Modals state
  const [isQuickLeadModalOpen, setIsQuickLeadModalOpen] = useState(false);
  const [isQuickNoteModalOpen, setIsQuickNoteModalOpen] = useState(false);
  const [selectedLeadForNote, setSelectedLeadForNote] = useState(null);

  // Quick Lead Form
  const initialLeadForm = {
    customerName: '',
    phoneNumber: '',
    email: '',
    stage: 'New',
    preferredUnitType: '',
    budgetMin: '',
    budgetMax: '',
    assignedTo: '',
    initialNote: '',
  };
  const [leadFormData, setLeadFormData] = useState(initialLeadForm);

  // Quick Note Form
  const [noteFormData, setNoteFormData] = useState({
    content: '',
    stage: '',
    nextFollowUpDate: '',
  });

  // Fetch all dashboard stats strictly from database
  const fetchDashboardData = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const statsPromise = dashboardService.getStats();
      const usersPromise = (user?.role === 'Super Admin' || user?.role === 'Admin')
        ? userService.getUsers()
        : Promise.resolve({ status: 'success', data: [] });

      const [statsRes, usersRes] = await Promise.all([statsPromise, usersPromise]);

      if (statsRes.status === 'success' && statsRes.data) {
        setData(statsRes.data);
      }
      if (usersRes?.status === 'success' && Array.isArray(usersRes.data)) {
        setUsersList(usersRes.data);
      }

      if (isRefresh) {
        toast('Dashboard metrics refreshed successfully', 'success');
      }
    } catch {
      showError('Could not load dashboard statistics. Please refresh.');
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, [user?.role]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Handle Quick Lead Creation
  const handleCreateLead = async (e) => {
    e.preventDefault();
    setSubmittingLead(true);
    try {
      const payload = { ...leadFormData };
      
      // Auto-assign to current sales rep if not admin
      if (user && user.role === 'Sales Employee') {
        payload.assignedTo = user.id;
      }

      const initialNote = payload.initialNote;
      delete payload.initialNote;

      const res = await leadService.createLead(payload);
      if (res.status === 'success' && res.data) {
        const leadId = res.data.id || res.data._id;
        if (initialNote && leadId) {
          await leadService.addNote(leadId, initialNote);
        }
        setIsQuickLeadModalOpen(false);
        setLeadFormData(initialLeadForm);
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
    
    // Format existing datetime for input
    let formattedDate = '';
    if (lead.nextFollowUpDate) {
      const d = new Date(lead.nextFollowUpDate);
      if (!isNaN(d.getTime())) {
        formattedDate = d.toISOString().slice(0, 16);
      }
    }

    setNoteFormData({
      content: '',
      stage: lead.stage || '',
      nextFollowUpDate: formattedDate,
    });
    setIsQuickNoteModalOpen(true);
  };

  // Handle Quick Note Saving
  const handleSaveNote = async (e) => {
    e.preventDefault();
    if (!selectedLeadForNote) return;
    setSubmittingNote(true);

    try {
      const leadId = selectedLeadForNote.id || selectedLeadForNote._id;
      
      // 1. Add interaction note to database
      await leadService.addNote(leadId, noteFormData.content);

      // 2. Update lead stage and next follow-up date in database
      const updatePayload = {};
      if (noteFormData.stage) updatePayload.stage = noteFormData.stage;
      if (noteFormData.nextFollowUpDate) updatePayload.nextFollowUpDate = noteFormData.nextFollowUpDate;

      if (Object.keys(updatePayload).length > 0) {
        await leadService.updateLead(leadId, updatePayload);
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
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  // Merge overdue and today follow-ups into single active urgent list
  const urgentFollowupsList = useMemo(() => {
    if (!data?.followups) return [];
    return [
      ...(data.followups.overdue || []),
      ...(data.followups.today || [])
    ];
  }, [data?.followups]);

  // Executive CSV Metrics Export
  const handleExportReport = () => {
    if (!data) return;

    const now = new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '');
    const lines = [
      `REAL ESTATE CRM - EXECUTIVE METRICS REPORT`,
      `Generated At,"${now}"`,
      `Generated By,"${user?.name || 'CRM User'} (${user?.role || 'Staff'})"`,
      ``,
      `=== KEY PERFORMANCE INDICATORS ===`,
      `Metric,Value`,
      `Total Revenue,"${data?.counts?.totalRevenue || 0}"`,
      `Total Active Leads,"${data?.counts?.totalLeads || 0}"`,
      `Total Units,"${data?.counts?.totalUnits || 0}"`,
      `Total Bookings,"${data?.counts?.totalBookings || 0}"`,
      `Overdue Follow-ups,"${data?.followups?.overdue?.length || 0}"`,
      `Today's Follow-ups,"${data?.followups?.today?.length || 0}"`,
      ``,
      `=== LEAD PIPELINE BY STAGE ===`,
      `Stage,Count`,
    ];

    const stages = ['New', 'Contacted', 'Site Visit', 'Interested', 'Negotiation', 'Booked', 'Lost'];
    stages.forEach(st => {
      lines.push(`"${st}",${data?.leadsByStage?.[st] || 0}`);
    });

    lines.push(``);
    lines.push(`=== UNIT INVENTORY STATUS ===`);
    lines.push(`Status,Count`);
    const statuses = ['Available', 'Booked', 'Sold', 'Blocked'];
    statuses.forEach(st => {
      lines.push(`"${st}",${data?.unitsByStatus?.[st] || 0}`);
    });

    if (urgentFollowupsList.length > 0) {
      lines.push(``);
      lines.push(`=== URGENT & DUE FOLLOW-UPS ===`);
      lines.push(`Customer,Stage,Phone,Due Date,Assigned Rep`);
      urgentFollowupsList.forEach(f => {
        lines.push(`"${f.customerName || ''}","${f.stage || ''}","${f.phoneNumber || ''}","${f.nextFollowUpDate ? new Date(f.nextFollowUpDate).toLocaleDateString() : ''}","${f.assignedToName || f.assignedTo?.name || 'Unassigned'}"`);
      });
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + encodeURIComponent(lines.join('\n'));
    const link = document.createElement('a');
    link.setAttribute('href', csvContent);
    link.setAttribute('download', `CRM_Dashboard_Report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    toast('Executive report exported successfully!', 'success');
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading CRM dashboard insights..." />;
  }

  return (
    <div className="crm-dashboard pb-5">
      {/* 1. Creative Centered Page Header with Action Pills */}
      <DashboardHeader
        onOpenQuickLead={() => setIsQuickLeadModalOpen(true)}
        onNavigateNewBooking={() => navigate('/bookings?action=new')}
        onRefresh={() => fetchDashboardData(true)}
        refreshing={refreshing}
        onExportReport={handleExportReport}
      />

      {/* 2. Responsive 4 Quick Action Cards */}
      <QuickActionsRow
        onOpenQuickLead={() => setIsQuickLeadModalOpen(true)}
        onNavigateBookings={() => navigate('/bookings')}
        onNavigateProperties={() => navigate('/properties')}
        onScrollToFollowups={scrollToFollowups}
      />

      {/* 3. 4 KPI Stat Cards Row (Swipeable Carousel on Mobile) */}
      <DashboardKpiCards
        data={data}
        onScrollToFollowups={scrollToFollowups}
        onNavigateLeads={() => navigate('/leads')}
        onNavigateProperties={() => navigate('/properties')}
        onNavigateBookings={() => navigate('/bookings')}
      />

      {/* 4. Visual Lead Funnel & Pipeline Stage Breakdown */}
      <LeadFunnelOverview
        leadsByStage={data?.leadsByStage || {}}
        totalLeads={data?.counts?.totalLeads || 0}
      />

      {/* 5. Analytics Charts: Pipeline Bar Chart + Inventory Doughnut Chart */}
      <DashboardCharts data={data} />

      {/* 6. Portfolio Occupancy & Inventory Performance (Chart + Multi-Segment Capacity + 4 Quad Metric Tiles) */}
      <PortfolioOccupancySection
        unitsByStatus={data?.unitsByStatus || {}}
        totalUnits={data?.counts?.totalUnits || 0}
      />

      {/* 7. Side-by-Side Activity Tables: Recent Leads & Recent Bookings */}
      <DashboardRecentTables
        recentLeads={data?.recentLeads || []}
        recentBookings={data?.recentBookings || []}
        onOpenQuickNote={handleOpenQuickNote}
        onOpenQuickLead={() => setIsQuickLeadModalOpen(true)}
      />

      {/* 8. Pending & Urgent Follow-ups Section */}
      <DashboardFollowupsTable
        followups={urgentFollowupsList}
        onOpenQuickNote={handleOpenQuickNote}
        onNavigateLead={(leadId) => navigate(`/leads?search=${encodeURIComponent(leadId)}`)}
      />

      {/* 9. Quick Add Lead Modal (with Database Users List) */}
      <QuickLeadModal
        isOpen={isQuickLeadModalOpen}
        onClose={() => setIsQuickLeadModalOpen(false)}
        formData={leadFormData}
        onChange={(e) => setLeadFormData({ ...leadFormData, [e.target.name]: e.target.value })}
        onSubmit={handleCreateLead}
        usersList={usersList}
        submitting={submittingLead}
      />

      {/* 10. Quick Note / Activity Modal */}
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
