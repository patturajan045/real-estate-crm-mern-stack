import React, { useMemo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';
import { useTheme } from '../../context/ThemeContext';
import { useCms } from '../../context/CmsContext';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
);

export default function DashboardCharts({ data }) {
  const { isDark } = useTheme();
  const { t } = useCms();

  const textColor = isDark ? '#94a3b8' : '#64748b';
  const gridColor = isDark ? '#1e2c47' : '#e2e8f0';

  // Leads pipeline data
  const pipelineData = useMemo(() => {
    const stages = ['New', 'Contacted', 'Site Visit Scheduled', 'Negotiation', 'Booking Confirmed', 'Lost'];
    const counts = stages.map(stage => {
      const match = data?.pipeline?.find(p => p.stage === stage || p._id === stage);
      return match ? match.count : 0;
    });

    return {
      labels: ['New', 'Contacted', 'Site Visit', 'Negotiation', 'Confirmed', 'Lost'],
      datasets: [
        {
          label: 'Leads',
          data: counts,
          backgroundColor: [
            'rgba(59, 130, 246, 0.75)',
            'rgba(6, 182, 212, 0.75)',
            'rgba(245, 158, 11, 0.75)',
            'rgba(139, 92, 246, 0.75)',
            'rgba(16, 185, 129, 0.75)',
            'rgba(239, 68, 68, 0.75)',
          ],
          borderColor: [
            '#3b82f6',
            '#06b6d4',
            '#f59e0b',
            '#8b5cf6',
            '#10b981',
            '#ef4444',
          ],
          borderWidth: 1.5,
          borderRadius: 4,
        },
      ],
    };
  }, [data?.pipeline]);

  // Inventory doughnut data
  const inventoryData = useMemo(() => {
    const inv = data?.inventory || {};
    const available = inv.available || 0;
    const reserved = inv.reserved || 0;
    const booked = inv.booked || 0;

    return {
      labels: ['Available', 'Reserved', 'Booked'],
      datasets: [
        {
          data: [available, reserved, booked],
          backgroundColor: [
            'rgba(16, 185, 129, 0.85)',
            'rgba(245, 158, 11, 0.85)',
            'rgba(59, 130, 246, 0.85)',
          ],
          borderColor: isDark ? '#121a2d' : '#ffffff',
          borderWidth: 2,
        },
      ],
    };
  }, [data?.inventory, isDark]);

  const barOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#334155',
        borderColor: gridColor,
        borderWidth: 1,
        padding: 10,
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: textColor, font: { size: 11 } },
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: textColor, stepSize: 1, font: { size: 11 } },
        beginAtZero: true,
      },
    },
  };

  const doughnutOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: textColor,
          boxWidth: 12,
          padding: 12,
          font: { size: 11.5 },
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#334155',
        borderColor: gridColor,
        borderWidth: 1,
        padding: 10,
      },
    },
    cutout: '70%',
  };

  return (
    <div className="row g-3 mb-4">
      {/* Pipeline Bar Chart */}
      <div className="col-12 col-lg-8">
        <div className="card crm-card border-0 shadow-sm h-100">
          <div className="card-header bg-transparent border-0 pt-3 pb-0 d-flex align-items-center justify-content-between">
            <h5 className="card-title fw-bold mb-0 text-body" style={{ fontSize: 'var(--crm-font-h3)' }}>
              <i className="fas fa-chart-column text-primary me-2"></i>
              {t('dashboard_pipeline_heading', 'Leads by Pipeline Stage')}
            </h5>
            <span className="badge bg-body-secondary text-muted small fw-normal">Live</span>
          </div>
          <div className="card-body p-3" style={{ height: '300px' }}>
            <Bar data={pipelineData} options={barOptions} />
          </div>
        </div>
      </div>

      {/* Inventory Doughnut Chart */}
      <div className="col-12 col-lg-4">
        <div className="card crm-card border-0 shadow-sm h-100">
          <div className="card-header bg-transparent border-0 pt-3 pb-0 d-flex align-items-center justify-content-between">
            <h5 className="card-title fw-bold mb-0 text-body" style={{ fontSize: 'var(--crm-font-h3)' }}>
              <i className="fas fa-chart-pie text-success me-2"></i>
              {t('dashboard_inventory_heading', 'Unit Inventory Status')}
            </h5>
            <span className="badge bg-body-secondary text-muted small fw-normal">Inventory</span>
          </div>
          <div className="card-body p-3 d-flex align-items-center justify-content-center" style={{ height: '300px' }}>
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
              <Doughnut data={inventoryData} options={doughnutOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
