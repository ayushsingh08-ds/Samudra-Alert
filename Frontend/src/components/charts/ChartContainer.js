import React, { useRef } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend
);

const ChartContainer = ({ 
  type = 'line',
  data,
  options = {},
  title,
  height = 300,
  className = '' 
}) => {
  const chartRef = useRef();

  const defaultOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: !!title,
        text: title,
      },
    },
    scales: type !== 'pie' && type !== 'doughnut' ? {
      y: {
        beginAtZero: true,
      },
    } : undefined,
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
    plugins: {
      ...defaultOptions.plugins,
      ...options.plugins,
    },
  };

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return <Bar ref={chartRef} data={data} options={mergedOptions} />;
      case 'pie':
        return <Pie ref={chartRef} data={data} options={mergedOptions} />;
      case 'doughnut':
        return <Doughnut ref={chartRef} data={data} options={mergedOptions} />;
      case 'line':
      default:
        return <Line ref={chartRef} data={data} options={mergedOptions} />;
    }
  };

  if (!data) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="flex items-center justify-center h-64">
          <div className="text-gray-500">No data available</div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
      <div style={{ height: `${height}px` }}>
        {renderChart()}
      </div>
    </div>
  );
};

// Predefined chart configurations for common use cases
export const ReportsOverTimeChart = ({ reports }) => {
  // Group reports by date
  const groupedByDate = reports.reduce((acc, report) => {
    const date = new Date(report.reportedAt).toLocaleDateString();
    acc[date] = (acc[date] || 0) + 1;
    return acc;
  }, {});

  const data = {
    labels: Object.keys(groupedByDate).slice(-7), // Last 7 days
    datasets: [
      {
        label: 'Reports',
        data: Object.values(groupedByDate).slice(-7),
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.1,
      },
    ],
  };

  return (
    <ChartContainer
      type="line"
      data={data}
      title="Reports Over Time"
      options={{
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              stepSize: 1,
            },
          },
        },
      }}
    />
  );
};

export const ReportsByTypeChart = ({ reports }) => {
  const typeCount = reports.reduce((acc, report) => {
    acc[report.type] = (acc[report.type] || 0) + 1;
    return acc;
  }, {});

  const colors = {
    flood: '#3B82F6',
    storm: '#F59E0B',
    tsunami: '#EF4444',
    pollution: '#10B981',
    other: '#6B7280'
  };

  const data = {
    labels: Object.keys(typeCount).map(type => type.charAt(0).toUpperCase() + type.slice(1)),
    datasets: [
      {
        data: Object.values(typeCount),
        backgroundColor: Object.keys(typeCount).map(type => colors[type] || colors.other),
        borderColor: Object.keys(typeCount).map(type => colors[type] || colors.other),
        borderWidth: 2,
      },
    ],
  };

  return (
    <ChartContainer
      type="doughnut"
      data={data}
      title="Reports by Type"
      height={250}
    />
  );
};

export const SeverityDistributionChart = ({ reports }) => {
  const severityCount = reports.reduce((acc, report) => {
    acc[report.severity] = (acc[report.severity] || 0) + 1;
    return acc;
  }, {});

  const data = {
    labels: ['High', 'Medium', 'Low'],
    datasets: [
      {
        label: 'Reports',
        data: [
          severityCount.high || 0,
          severityCount.medium || 0,
          severityCount.low || 0,
        ],
        backgroundColor: [
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(16, 185, 129, 0.8)',
        ],
        borderColor: [
          'rgb(239, 68, 68)',
          'rgb(245, 158, 11)',
          'rgb(16, 185, 129)',
        ],
        borderWidth: 1,
      },
    ],
  };

  return (
    <ChartContainer
      type="bar"
      data={data}
      title="Severity Distribution"
      height={250}
    />
  );
};

export const VerificationStatusChart = ({ reports }) => {
  const statusCount = reports.reduce((acc, report) => {
    acc[report.status] = (acc[report.status] || 0) + 1;
    return acc;
  }, {});

  const data = {
    labels: ['Verified', 'Pending', 'Rejected'],
    datasets: [
      {
        data: [
          statusCount.verified || 0,
          statusCount.pending || 0,
          statusCount.rejected || 0,
        ],
        backgroundColor: [
          'rgba(16, 185, 129, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(239, 68, 68, 0.8)',
        ],
        borderColor: [
          'rgb(16, 185, 129)',
          'rgb(245, 158, 11)',
          'rgb(239, 68, 68)',
        ],
        borderWidth: 2,
      },
    ],
  };

  return (
    <ChartContainer
      type="pie"
      data={data}
      title="Verification Status"
      height={250}
    />
  );
};

export default ChartContainer;