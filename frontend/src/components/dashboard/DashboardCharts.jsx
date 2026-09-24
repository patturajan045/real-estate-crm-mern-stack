import React, { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
  const navigate = useNavigate();

  const textColor = isDark ? '#cbd5e1' : '#475569';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9';
  const borderColor = isDark ? '#121a2d' : '#ffffff';

  // Leads pipeline data from database
  const pipelineData = useMemo(() => {
    const stages = data?.leadsByStage || {};
    const labels = ['New', 'Contacted', 'Site Visit', 'Interested', 'Negotiation', 'Booked', 'Lost'];
    const counts = labels.map((stage) => stages[stage] || 0);

    return {
      labels,
      datasets: [
        {
          label: 'Active Leads',
          data: counts,
          backgroundColor: [
            '#3b82f6', // New
            '#8b5cf6', // Contacted
            '#06b6d4', // Site Visit
            '#f59e0b', // Interested
            '#f97316', // Negotiation
            '#10b981', // Booked
            '#94a3b8', // Lost
          ],
          borderRadius: 6,
          maxBarThickness: 38,
        },
      ],
    };
  }, [data?.leadsByStage]);

  // Inventory doughnut data from database
  const inventoryData = useMemo(() => {
    const units = data?.unitsByStatus || {};
    const labels = ['Available', 'Blocked', 'Booked', 'Sold'];
    const counts = labels.map((status) => units[status] || 0);

    return {
      labels,
      datasets: [
        {
          data: counts,
          backgroundColor: [
            '#10b981', // Available
            '#f59e0b', // Blocked
            '#ef4444', // Booked
            '#8b5cf6', // Sold
          ],
          borderColor: borderColor,
          borderWidth: 3,
        },
      ],
    };
  }, [data?.unitsByStatus, borderColor]);

  const barOptions = {
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
      },
    },
    scales: {
      x: {
        grid: { display: false },
        ticks: { color: textColor, font: { size: 11.5, weight: '500' } },
      },
      y: {
        grid: { color: gridColor },
        ticks: { color: textColor, precision: 0, font: { size: 11 } },
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
          padding: 14,
          font: { size: 11.5, weight: '500' },
        },
      },
      tooltip: {
        backgroundColor: isDark ? '#1e293b' : '#ffffff',
        titleColor: isDark ? '#f8fafc' : '#0f172a',
        bodyColor: isDark ? '#cbd5e1' : '#334155',
        borderColor: isDark ? '#334155' : '#e2e8f0',
        borderWidth: 1,
        padding: 10,
        cornerRadius: 8,
      },
    },
    cutout: '70%',
  };

  return (
    <div className="row g-3 g-md-4 mb-3 mb-sm-4">
      {/* 1. Lead Pipeline Stages Bar Chart */}
      <div className="col-12 col-lg-8">
        <div className="crm-card h-100 mb-0 border-0 shadow-sm">
          <div className="crm-card-header d-flex align-items-center justify-content-between p-3 border-bottom">
            <h5 className="crm-card-title fw-bold mb-0 text-body d-flex align-items-center">
              <i className="fas fa-chart-bar text-primary me-2"></i>
              <span>{t('dashboard_pipeline_heading', 'Leads by Pipeline Stage')}</span>
            </h5>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary flex-shrink-0"
              onClick={() => navigate('/leads')}
            >
              Manage Leads
            </button>
          </div>
          <div className="crm-card-body p-3">
            <div style={{ height: 'clamp(220px, 30vh, 280px)', width: '100%', position: 'relative' }}>
              <Bar data={pipelineData} options={barOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* 2. Property Inventory Doughnut Chart */}
      <div className="col-12 col-lg-4">
        <div className="crm-card h-100 mb-0 border-0 shadow-sm">
          <div className="crm-card-header d-flex align-items-center justify-content-between p-3 border-bottom">
            <h5 className="crm-card-title fw-bold mb-0 text-body d-flex align-items-center">
              <i className="fas fa-chart-pie text-success me-2"></i>
              <span>{t('dashboard_inventory_heading', 'Unit Inventory Status')}</span>
            </h5>
            <button
              type="button"
              className="btn btn-sm btn-outline-secondary flex-shrink-0"
              onClick={() => navigate('/properties')}
            >
              Units
            </button>
          </div>
          <div className="crm-card-body p-3 d-flex flex-column align-items-center justify-content-center">
            <div style={{ height: 'clamp(200px, 28vh, 240px)', width: '100%', position: 'relative' }}>
              <Doughnut data={inventoryData} options={doughnutOptions} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
