import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bar } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';

export default function PortfolioOccupancySection({ unitsByStatus = {}, totalUnits = 0 }) {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const available = unitsByStatus['Available'] || 0;
  const blocked = unitsByStatus['Blocked'] || 0;
  const booked = unitsByStatus['Booked'] || 0;
  const sold = unitsByStatus['Sold'] || 0;
  const safeTotal = totalUnits > 0 ? totalUnits : (available + blocked + booked + sold) || 1;

  const reservedCount = booked + sold;
  const occupancyRate = totalUnits > 0 ? Math.round((reservedCount / safeTotal) * 100) : 0;

  const pctAvail = Math.round((available / safeTotal) * 100);
  const pctBlock = Math.round((blocked / safeTotal) * 100);
  const pctBook = Math.round((booked / safeTotal) * 100);
  const pctSold = Math.round((sold / safeTotal) * 100);

  const textColor = isDark ? '#cbd5e1' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.07)' : 'rgba(0, 0, 0, 0.05)';

  const horizontalChartData = useMemo(() => ({
    labels: ['Available', 'Booked', 'Sold', 'Blocked'],
    datasets: [
      {
        label: 'Inventory Units',
        data: [available, booked, sold, blocked],
        backgroundColor: [
          '#10b981', // Available (Emerald Green)
          '#3b82f6', // Booked (Vibrant Blue)
          '#8b5cf6', // Sold (Vibrant Purple)
          '#f59e0b', // Blocked (Amber Warning)
        ],
        borderRadius: 8,
        borderSkipped: false,
        maxBarThickness: 24,
      },
    ],
  }), [available, booked, sold, blocked]);

  const horizontalChartOptions = {
    indexAxis: 'y',
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#334155',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
        callbacks: {
          label: (context) => {
            const val = context.raw || 0;
            const pct = Math.round((val / safeTotal) * 100);
            return ` ${val} Units (${pct}% of inventory)`;
          },
        },
      },
    },
    scales: {
      x: {
        beginAtZero: true,
        ticks: { precision: 0, color: textColor, font: { size: 11 } },
        grid: { color: gridColor },
      },
      y: {
        ticks: { color: textColor, font: { size: 12, weight: '600' } },
        grid: { display: false },
      },
    },
  };

  return (
    <div className="crm-card mb-3 mb-sm-4 border-0 shadow-sm">
      {/* Card Header with Occupancy Badge */}
      <div className="crm-card-header d-flex align-items-center justify-content-between p-3 border-bottom">
        <h5 className="crm-card-title fw-bold mb-0 text-body d-flex align-items-center">
          <i className="fas fa-city text-primary me-2"></i>
          <span>Portfolio Occupancy & Inventory Performance</span>
        </h5>
        <div className="d-flex align-items-center gap-2">
          <span className="badge bg-primary-subtle text-primary border border-primary-subtle px-2.5 py-1">
            {occupancyRate}% Reserved / Sold
          </span>
          <button
            type="button"
            className="btn btn-sm btn-outline-primary py-1 px-2.5 d-none d-sm-inline-flex align-items-center"
            onClick={() => navigate('/properties')}
            title="Manage Inventory"
          >
            <span>Inventory</span>
            <i className="fas fa-arrow-right ms-1"></i>
          </button>
        </div>
      </div>

      <div className="crm-card-body p-3">
        {/* Horizontal Chart + Multi-Segment Capacity Bar */}
        <div className="row g-3 align-items-center mb-3">
          <div className="col-12 col-lg-8">
            <div className="d-flex justify-content-between align-items-center mb-2 small">
              <span className="fw-semibold text-body">
                <i className="fas fa-chart-bar text-primary me-1.5"></i> Live Unit Allocation Breakdown
              </span>
              <span className="text-muted small">
                {available} Avail · {booked} Booked · {sold} Sold · {blocked} Blocked ({totalUnits} Total)
              </span>
            </div>
            <div style={{ height: 'clamp(140px, 20vh, 170px)', width: '100%', position: 'relative' }}>
              <Bar data={horizontalChartData} options={horizontalChartOptions} />
            </div>
          </div>

          <div className="col-12 col-lg-4">
            <div className="p-3 rounded-3 border bg-body-tertiary h-100 d-flex flex-column justify-content-center">
              <div className="d-flex justify-content-between align-items-center mb-2">
                <span className="small fw-bold text-body">Portfolio Capacity</span>
                <span className="badge bg-success-subtle text-success border border-success-subtle">
                  Active
                </span>
              </div>
              
              {/* 4-Color Multi-Segment Progress Bar */}
              <div className="crm-progress-multi mb-2" style={{ height: '14px' }}>
                <div
                  className="crm-progress-segment bg-success"
                  style={{ width: `${(available / safeTotal) * 100}%` }}
                  title={`Available: ${available} (${pctAvail}%)`}
                ></div>
                <div
                  className="crm-progress-segment bg-warning"
                  style={{ width: `${(blocked / safeTotal) * 100}%` }}
                  title={`Blocked: ${blocked} (${pctBlock}%)`}
                ></div>
                <div
                  className="crm-progress-segment bg-primary"
                  style={{ width: `${(booked / safeTotal) * 100}%` }}
                  title={`Booked: ${booked} (${pctBook}%)`}
                ></div>
                <div
                  className="crm-progress-segment"
                  style={{ width: `${(sold / safeTotal) * 100}%`, backgroundColor: '#8b5cf6' }}
                  title={`Sold: ${sold} (${pctSold}%)`}
                ></div>
              </div>

              <div className="small text-muted" style={{ fontSize: '0.73rem' }}>
                Real-time visual distribution of available units vs locked agreements.
              </div>
            </div>
          </div>
        </div>

        {/* 4 Detailed Interactive Status Metric Tiles */}
        <div className="row g-2 g-sm-3 occupancy-metrics-row pt-1 text-start">
          {/* 1. Available */}
          <div className="col-6 col-md-3">
            <div
              className="occupancy-card-modern avail"
              onClick={() => navigate('/properties?status=Available')}
              role="button"
              tabIndex={0}
              title="Click to view all Available units"
              onKeyDown={(e) => e.key === 'Enter' && navigate('/properties?status=Available')}
            >
              <div className="occupancy-card-header">
                <div className="d-flex align-items-center gap-2 min-w-0">
                  <div className="occupancy-icon-badge avail">
                    <i className="fas fa-door-open"></i>
                  </div>
                  <div className="min-w-0">
                    <div className="fw-bold small text-truncate text-body">Available</div>
                    <div className="text-muted small text-truncate" style={{ fontSize: '0.7rem' }}>Ready to Sell</div>
                  </div>
                </div>
                <span className="badge rounded-pill bg-success-subtle text-success small">{pctAvail}%</span>
              </div>
              <div className="occupancy-card-value text-success">{available} Units</div>
              <div className="occupancy-progress-bar">
                <div className="occupancy-progress-fill bg-success" style={{ width: `${pctAvail}%` }}></div>
              </div>
              <div className="occupancy-card-footer">
                <span>View Inventory</span>
                <i className="fas fa-arrow-right"></i>
              </div>
            </div>
          </div>

          {/* 2. Blocked */}
          <div className="col-6 col-md-3">
            <div
              className="occupancy-card-modern block"
              onClick={() => navigate('/properties?status=Blocked')}
              role="button"
              tabIndex={0}
              title="Click to view all Blocked units"
              onKeyDown={(e) => e.key === 'Enter' && navigate('/properties?status=Blocked')}
            >
              <div className="occupancy-card-header">
                <div className="d-flex align-items-center gap-2 min-w-0">
                  <div className="occupancy-icon-badge block">
                    <i className="fas fa-lock"></i>
                  </div>
                  <div className="min-w-0">
                    <div className="fw-bold small text-truncate text-body">Blocked</div>
                    <div className="text-muted small text-truncate" style={{ fontSize: '0.7rem' }}>On VIP Hold</div>
                  </div>
                </div>
                <span className="badge rounded-pill bg-warning-subtle text-warning small">{pctBlock}%</span>
              </div>
              <div className="occupancy-card-value text-warning">{blocked} Units</div>
              <div className="occupancy-progress-bar">
                <div className="occupancy-progress-fill bg-warning" style={{ width: `${pctBlock}%` }}></div>
              </div>
              <div className="occupancy-card-footer">
                <span>Review Holds</span>
                <i className="fas fa-arrow-right"></i>
              </div>
            </div>
          </div>

          {/* 3. Booked */}
          <div className="col-6 col-md-3">
            <div
              className="occupancy-card-modern book"
              onClick={() => navigate('/properties?status=Booked')}
              role="button"
              tabIndex={0}
              title="Click to view all Booked units"
              onKeyDown={(e) => e.key === 'Enter' && navigate('/properties?status=Booked')}
            >
              <div className="occupancy-card-header">
                <div className="d-flex align-items-center gap-2 min-w-0">
                  <div className="occupancy-icon-badge book">
                    <i className="fas fa-file-signature"></i>
                  </div>
                  <div className="min-w-0">
                    <div className="fw-bold small text-truncate text-body">Booked</div>
                    <div className="text-muted small text-truncate" style={{ fontSize: '0.7rem' }}>Token Received</div>
                  </div>
                </div>
                <span className="badge rounded-pill bg-primary-subtle text-primary small">{pctBook}%</span>
              </div>
              <div className="occupancy-card-value text-primary">{booked} Units</div>
              <div className="occupancy-progress-bar">
                <div className="occupancy-progress-fill bg-primary" style={{ width: `${pctBook}%` }}></div>
              </div>
              <div className="occupancy-card-footer">
                <span>Track Bookings</span>
                <i className="fas fa-arrow-right"></i>
              </div>
            </div>
          </div>

          {/* 4. Sold */}
          <div className="col-6 col-md-3">
            <div
              className="occupancy-card-modern sold"
              onClick={() => navigate('/properties?status=Sold')}
              role="button"
              tabIndex={0}
              title="Click to view all Sold units"
              onKeyDown={(e) => e.key === 'Enter' && navigate('/properties?status=Sold')}
            >
              <div className="occupancy-card-header">
                <div className="d-flex align-items-center gap-2 min-w-0">
                  <div className="occupancy-icon-badge sold">
                    <i className="fas fa-circle-check"></i>
                  </div>
                  <div className="min-w-0">
                    <div className="fw-bold small text-truncate text-body">Sold</div>
                    <div className="text-muted small text-truncate" style={{ fontSize: '0.7rem' }}>Closed Deals</div>
                  </div>
                </div>
                <span className="badge rounded-pill bg-secondary-subtle text-body small">{pctSold}%</span>
              </div>
              <div className="occupancy-card-value text-purple" style={{ color: '#8b5cf6' }}>{sold} Units</div>
              <div className="occupancy-progress-bar">
                <div className="occupancy-progress-fill" style={{ width: `${pctSold}%`, backgroundColor: '#8b5cf6' }}></div>
              </div>
              <div className="occupancy-card-footer">
                <span>View Closed</span>
                <i className="fas fa-arrow-right"></i>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
