import React, { useState, useEffect, useCallback, useMemo } from 'react';
import userService from '../services/userService';
import { useAuth } from '../context/AuthContext';
import { useCms } from '../context/CmsContext';
import { getInitials, getRoleBadgeClass } from '../utils/formatters';
import { confirm, toast, error as showError } from '../utils/alerts';

import PageHeader from '../components/common/PageHeader';
import LoadingSpinner from '../components/common/LoadingSpinner';
import StatCard from '../components/common/StatCard';
import JqueryDataTable from '../components/common/JqueryDataTable';
import RecordActionModal from '../components/common/RecordActionModal';
import UserModal from '../components/users/UserModal';

export default function Users() {
  const { user: currentUser } = useAuth();
  const { t } = useCms();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);

  // Mobile Record Action Sheet
  const [recordActionData, setRecordActionData] = useState(null);

  const initialFormData = {
    name: '',
    email: '',
    password: '',
    role: 'Sales Employee',
    phoneNumber: '',
    isActive: true,
  };
  const [formData, setFormData] = useState(initialFormData);

  const fetchUsers = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    try {
      const res = await userService.getUsers();
      if (res.status === 'success' && res.data) {
        setUsers(res.data);
        if (isRefresh) toast('Users list refreshed', 'success');
      }
    } catch {
      showError('Could not load users list.');
    } finally {
      setLoading(false);
      if (isRefresh) setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleOpenCreate = () => {
    setEditingUserId(null);
    setFormData(initialFormData);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (user) => {
    setEditingUserId(user.id || user._id);
    setFormData({
      name: user.name || '',
      email: user.email || '',
      password: '',
      role: user.role || 'Sales Employee',
      phoneNumber: user.phoneNumber || '',
      isActive: user.isActive ?? true,
    });
    setIsModalOpen(true);
  };

  const handleSubmitUser = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (editingUserId && !payload.password) {
        delete payload.password;
      }

      if (editingUserId) {
        await userService.updateUser(editingUserId, payload);
        toast('Team member updated successfully!', 'success');
      } else {
        await userService.createUser(payload);
        toast('Team member created successfully!', 'success');
      }
      setIsModalOpen(false);
      fetchUsers();
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Failed to save team member');
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleActive = async (user) => {
    if (user.id === currentUser?.id || user._id === currentUser?.id) {
      showError('You cannot deactivate your own logged-in account.');
      return;
    }

    const actionText = user.isActive ? 'deactivate' : 'reactivate';
    const ok = await confirm(
      `${user.isActive ? 'Deactivate' : 'Reactivate'} Account?`,
      `Are you sure you want to ${actionText} ${user.name}'s account?`,
      `Yes, ${actionText}`
    );
    if (!ok) return;

    try {
      await userService.updateUser(user.id || user._id, { isActive: !user.isActive });
      toast(`User ${user.name} has been ${user.isActive ? 'deactivated' : 'reactivated'}.`, 'info');
      fetchUsers();
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Failed to update user status');
    }
  };

  const handleDeleteUser = async (user) => {
    if (user.id === currentUser?.id || user._id === currentUser?.id) {
      showError('You cannot delete your own logged-in account.');
      return;
    }

    const ok = await confirm(
      'Permanent User Deletion?',
      `Are you sure you want to permanently delete "${user.name}"? If active, they will first be deactivated; if already inactive, records will be permanently removed. Assigned leads will be safely unassigned.`,
      'Yes, Proceed'
    );
    if (!ok) return;

    try {
      // If user is already inactive, use permanent flag
      const isPermanent = !user.isActive;
      await userService.deleteUser(user.id || user._id, isPermanent);
      toast(
        isPermanent
          ? `User ${user.name} permanently deleted from database.`
          : `Active user ${user.name} safely deactivated.`,
        'info'
      );
      fetchUsers();
    } catch (err) {
      showError(err.response?.data?.message || err.message || 'Failed to delete user');
    }
  };

  // Metrics
  const metrics = useMemo(() => {
    const total = users.length;
    const superAdmins = users.filter((u) => u.role === 'Super Admin').length;
    const admins = users.filter((u) => u.role === 'Admin').length;
    const sales = users.filter((u) => u.role === 'Sales Employee').length;
    return { total, superAdmins, admins, sales };
  }, [users]);

  // DataTables Columns
  const tableColumns = useMemo(
    () => [
      {
        title: 'Team Member',
        data: 'name',
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
        title: 'Role',
        data: 'role',
        render: (data) => `<span class="badge ${getRoleBadgeClass(data)}">${data}</span>`,
      },
      {
        title: 'Phone Number',
        data: 'phoneNumber',
        render: (data) => data ? `<small class="text-body">${data}</small>` : '<span class="text-muted small">-</span>',
      },
      {
        title: 'Status',
        data: 'isActive',
        render: (data) =>
          data
            ? '<span class="badge bg-success-subtle text-success">Active</span>'
            : '<span class="badge bg-danger-subtle text-danger">Inactive</span>',
      },
      {
        title: 'Actions',
        data: null,
        orderable: false,
        className: 'text-end',
        render: (data, type, row) => `
          <div class="btn-group btn-group-sm">
            <button type="button" class="btn btn-outline-secondary btn-sm" data-action="edit" title="Edit Member">
              <i class="fas fa-pen-to-square"></i>
            </button>
            <button type="button" class="btn btn-outline-${row.isActive ? 'warning' : 'success'} btn-sm" data-action="toggle" title="${row.isActive ? 'Deactivate' : 'Reactivate'}">
              <i class="fas ${row.isActive ? 'fa-user-slash' : 'fa-user-check'}"></i>
            </button>
            <button type="button" class="btn btn-outline-danger btn-sm" data-action="delete" title="Delete Account">
              <i class="fas fa-trash-can"></i>
            </button>
          </div>
        `,
      },
    ],
    []
  );

  const handleTableAction = (action, user) => {
    if (action === 'edit') handleOpenEdit(user);
    else if (action === 'toggle') handleToggleActive(user);
    else if (action === 'delete') handleDeleteUser(user);
  };

  if (loading) {
    return <LoadingSpinner fullPage message="Loading team members..." />;
  }

  return (
    <div className="crm-users-page">
      <PageHeader
        title={t('users_title', 'Team & User Management')}
        subtitle={t('users_subtitle', 'Manage employee accounts, permissions, and roles (Super Admin, Admin, Sales Employee)')}
        primaryActionLabel="Add Team Member"
        primaryActionIcon="fa-user-plus"
        onPrimaryAction={handleOpenCreate}
        onRefresh={() => fetchUsers(true)}
        refreshing={refreshing}
      />

      {/* KPI Cards */}
      <div className="row row-cols-1 row-cols-sm-2 row-cols-xl-4 g-3 mb-4">
        <div className="col">
          <StatCard
            title="Total Accounts"
            value={metrics.total}
            icon="fa-users"
            colorClass="text-primary"
            bgClass="bg-primary-subtle"
            subtitle="Platform users"
          />
        </div>
        <div className="col">
          <StatCard
            title="Super Admins"
            value={metrics.superAdmins}
            icon="fa-shield-halved"
            colorClass="text-purple"
            bgClass="bg-purple-subtle"
            subtitle="Full root privileges"
          />
        </div>
        <div className="col">
          <StatCard
            title="Admins"
            value={metrics.admins}
            icon="fa-user-shield"
            colorClass="text-info"
            bgClass="bg-info-subtle"
            subtitle="Operations managers"
          />
        </div>
        <div className="col">
          <StatCard
            title="Sales Staff"
            value={metrics.sales}
            icon="fa-user-tie"
            colorClass="text-success"
            bgClass="bg-success-subtle"
            subtitle="Frontline agents"
          />
        </div>
      </div>

      {/* Responsive Data Table */}
      <div className="card crm-card border-0 shadow-sm">
        <div className="card-body p-3">
          <JqueryDataTable
            columns={tableColumns}
            data={users}
            onAction={handleTableAction}
            tableId="usersDataTable"
          />
        </div>
      </div>

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        isEditing={Boolean(editingUserId)}
        formData={formData}
        onChange={(e) => setFormData({ ...formData, [e.target.name]: e.target.value })}
        onSubmit={handleSubmitUser}
        submitting={submitting}
      />

      {/* Mobile Record Action Sheet */}
      <RecordActionModal
        isOpen={Boolean(recordActionData)}
        onClose={() => setRecordActionData(null)}
        record={recordActionData}
        recordType="user"
        onEdit={(u) => handleOpenEdit(u)}
        onDelete={(u) => handleDeleteUser(u)}
      />
    </div>
  );
}
