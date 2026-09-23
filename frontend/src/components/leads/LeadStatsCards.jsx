import React from 'react';

export default function LeadStatsCards({ leads = [], activeStage = 'All', onSelectStage }) {
  const stages = [
    { label: 'All Leads', value: 'All', icon: 'fa-users', color: 'primary' },
    { label: 'New', value: 'New', icon: 'fa-star', color: 'info' },
    { label: 'Contacted', value: 'Contacted', icon: 'fa-phone', color: 'primary' },
    { label: 'Site Visit', value: 'Site Visit Scheduled', icon: 'fa-building', color: 'warning' },
    { label: 'Negotiation', value: 'Negotiation', icon: 'fa-handshake', color: 'purple' },
    { label: 'Confirmed', value: 'Booking Confirmed', icon: 'fa-check-circle', color: 'success' },
    { label: 'Lost', value: 'Lost', icon: 'fa-circle-xmark', color: 'danger' },
  ];

  const getCount = (stageVal) => {
    if (stageVal === 'All') return leads.length;
    return leads.filter((l) => l.stage === stageVal).length;
  };

  return (
    <div className="row g-2 mb-3">
      {stages.map((st) => {
        const isSelected = activeStage === st.value;
        const count = getCount(st.value);

        return (
          <div key={st.value} className="col-6 col-sm-4 col-md-3 col-xl">
            <button
              type="button"
              className={`btn w-100 text-start p-2.5 rounded-3 border-0 shadow-sm d-flex align-items-center justify-content-between ${
                isSelected
                  ? 'bg-primary text-white'
                  : 'bg-body-secondary text-body hover-surface'
              }`}
              onClick={() => onSelectStage(st.value)}
              style={{ transition: 'all 0.15s ease-in-out' }}
            >
              <div className="min-w-0 me-2">
                <span className={`small d-block text-truncate fw-medium ${isSelected ? 'text-white-50' : 'text-muted'}`}>
                  {st.label}
                </span>
                <span className="fw-bold fs-5 d-block line-height-1 mt-0.5">
                  {count}
                </span>
              </div>
              <i className={`fas ${st.icon} ${isSelected ? 'text-white' : 'text-muted'} fs-5 flex-shrink-0`}></i>
            </button>
          </div>
        );
      })}
    </div>
  );
}
