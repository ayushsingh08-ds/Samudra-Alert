// src/pages/components/TrendsChart.jsx
import React, { useMemo } from "react";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, ReferenceLine
} from "recharts";
import LoadingSkeleton from "./LoadingSkeleton";

const TrendsChart = React.memo(({ data = [], loading, anomalies = [] }) => {
  const chartData = useMemo(() => {
    return data.map(item => ({
      ...item,
      date: item.date === "unknown" ? "N/A" : item.date,
      Total: (item.High || 0) + (item.Medium || 0) + (item.Low || 0)
    }));
  }, [data]);

  const anomalyDates = useMemo(() => {
    return anomalies
      .filter(a => a.date)
      .map(a => a.date);
  }, [anomalies]);

  if (loading && chartData.length === 0) {
    return (
      <div className="pd-glass-card">
        <div className="pd-card-title">📈 Risk Trends</div>
        <LoadingSkeleton height={300} />
      </div>
    );
  }

  return (
    <div className="pd-glass-card">
      <div className="pd-card-title">📈 Risk Trends Over Time</div>
      <div className="trends-chart-container">
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(167,139,250,0.2)" />
              <XAxis 
                dataKey="date" 
                stroke="var(--text-secondary)"
                fontSize={12}
              />
              <YAxis 
                stroke="var(--text-secondary)"
                fontSize={12}
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--glass-bg-primary)',
                  border: '1px solid var(--glass-border-primary)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(16px)',
                  color: 'var(--text-primary)'
                }}
              />
              <Legend />
              
              <Line 
                type="monotone" 
                dataKey="High" 
                stroke="#f472b6" 
                strokeWidth={3}
                dot={{ fill: '#f472b6', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#f472b6', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="Medium" 
                stroke="#a78bfa" 
                strokeWidth={2}
                dot={{ fill: '#a78bfa', strokeWidth: 2, r: 3 }}
              />
              <Line 
                type="monotone" 
                dataKey="Low" 
                stroke="#7c3aed" 
                strokeWidth={2}
                dot={{ fill: '#7c3aed', strokeWidth: 2, r: 3 }}
              />
              
              {/* Add reference lines for anomaly dates */}
              {anomalyDates.map(date => (
                <ReferenceLine 
                  key={date}
                  x={date} 
                  stroke="#ff4d6d" 
                  strokeDasharray="5 5"
                  strokeWidth={1}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-chart-data">
            <p>📊 No trend data available</p>
            <small>Data will appear here once records are loaded</small>
          </div>
        )}
      </div>
    </div>
  );
});

export default TrendsChart;
