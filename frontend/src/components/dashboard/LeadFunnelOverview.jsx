import React from 'react';
import { useNavigate } from 'react-router-dom';

const FUNNEL_STAGES = [
  { name: 'New', color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.1)', border: 'rgba(59, 130, 246, 0.25)' },
  { name: 'Contacted', color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.1)', border: 'rgba(139, 92, 246, 0.25)' },
  { name: 'Site Visit', color: '#06b6d4', bg: 'rgba(6, 182, 212, 0.1)', border: 'rgba(6, 182, 212, 0.25)' },
  { name: 'Interested', color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.25)' },
  { name: 'Negotiation', color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)', border: 'rgba(249, 115, 22, 0.25)' },
  { name: 'Booked', color: '#10b981', bg: 'rgba(16, 185, 129, 0.1)', border: 'rgba(16, 185, 129, 0.25)' },
];

export default function LeadFunnelOverview({ leadsByStage = {}, totalLeads = 0 }) {
  const navigate = useNavigate();
  const safeTotal = totalLeads > 0 ? totalLeads : 1;

  return (
    <div className="crm-card mb-3 mb-sm-4 border-0 shadow-sm">
      <div className="crm-card-header d-flex align-items-center justify-content-between p-3 border-bottom">
        <h5 className="crm-card-title fw-bold mb-0 text-body d-flex align-items-center">
          <i className="fas fa-filter text-primary me-2"></i>
          <span>Lead Pipeline Funnel & Stage Breakdown</span>
        </h5>
        <button
          type="button"
          className="btn btn-sm btn-outline-primary flex-shrink-0"
          onClick={() => navigate('/leads')}
        >
          View Pipeline &rarr;
        </button>
      </div>

      <div className="crm-card-body p-3">
        <div className="lead-funnel-grid">
          {FUNNEL_STAGES.map((s) => {
            const count = leadsByStage[s.name] || 0;
            const pct = totalLeads > 0 ? Math.round((count / safeTotal) * 100) : 0;

            return (
              <div
                key={s.name}
                className="funnel-stage-card"
                onClick={() => navigate(`/leads?stage=${encodeURIComponent(s.name)}`)}
                role="button"
                tabIndex={0}
                title={`${s.name}: ${count} leads (${pct}% of pipeline)`}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/leads?stage=${encodeURIComponent(s.name)}`)}
              >
                <div className="d-flex justify-content-between align-items-center mb-1">
                  <span className="small fw-semibold" style={{ color: s.color, fontSize: '0.8rem' }}>
                    {s.name}
                  </span>
                  <span
                    className="badge rounded-pill"
                    style={{
                      backgroundColor: s.bg,
                      color: s.color,
                      fontSize: '0.72rem',
                      border: `1px solid ${s.border}`,
                    }}
                  >
                    {pct}%
                  </span>
                </div>
                <div className="fw-bold text-body fs-5 mb-1">{count}</div>
                <div className="funnel-stage-progress">
                  <div
                    className="funnel-stage-fill"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: s.color,
                    }}
                  ></div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
