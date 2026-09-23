export function formatCurrency(amount) {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatDate(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch (e) {
    return dateStr;
  }
}

export function formatDateTime(dateStr) {
  if (!dateStr) return '-';
  try {
    const d = new Date(dateStr);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch (e) {
    return dateStr;
  }
}

export function getInitials(name) {
  if (!name) return 'U';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export function getRoleBadgeClass(role) {
  if (role === 'Super Admin') return 'role-super-admin';
  if (role === 'Admin') return 'role-admin';
  return 'role-sales';
}

export function getStageBadgeClass(stage) {
  const stageClassMap = {
    New: 'stage-new',
    Contacted: 'stage-contacted',
    'Site Visit': 'stage-site-visit',
    Interested: 'stage-interested',
    Negotiation: 'stage-negotiation',
    Booked: 'stage-booked',
    Lost: 'stage-lost',
  };
  return stageClassMap[stage] || 'stage-new';
}

export function getStatusBadgeClass(status) {
  const statusClassMap = {
    Available: 'unit-available',
    Blocked: 'unit-blocked',
    Booked: 'unit-booked',
    Sold: 'unit-sold',
    Confirmed: 'unit-available',
    Pending: 'unit-blocked',
    Cancelled: 'unit-booked',
  };
  return statusClassMap[status] || 'unit-available';
}
