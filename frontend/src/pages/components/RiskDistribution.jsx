// src/pages/components/RiskDistribution.jsx
import React, { useMemo } from "react";
import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from "recharts";
import LoadingSkeleton from "./LoadingSkeleton";

const RISK_COLORS = {
  High: '#f472b6',
  Medium: '#a78bfa', 
  Low: '#7c3aed',
  Unknown: '#64748b'
};

const RiskDistribution = React.memo(({ data = [], loading }) => {
  const pieData = useMemo(() => {
    const counts = data.reduce((acc, item) => {
      const category = item.category || 'Unknown';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    return Object.entries(counts)
      .map(([name, value]) => ({ name, value }))
      .filter(item => item.value > 0)
      .sort((a, b) => b.value - a.value);
  }, [data]);

  const totalRecords = data.length;

  if (loading && totalRecords === 0) {
    return (
      <div className="pd-glass-card">
        <div className="pd-card-title">🎯 Risk Distribution</div>
        <LoadingSkeleton height={300} />
      </div>
    );
  }

  return (
    <div className="pd-glass-card">
      <div className="pd-card-title">🎯 Risk Distribution</div>
      <div className="risk-distribution-content">
        <div className="total-count">
          <strong>Total: {totalRecords} records</strong>
        </div>
        
        {pieData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={85}
                innerRadius={30}
                paddingAngle={2}
                label={({ name, value, percent }) => 
                  `${name}: ${value} (${(percent * 100).toFixed(1)}%)`
                }
                labelLine={false}
              >
                {pieData.map((entry, index) => (
                  <Cell 
                    key={`cell-${index}`} 
                    fill={RISK_COLORS[entry.name] || RISK_COLORS.Unknown}
                    stroke="var(--glass-border-primary)"
                    strokeWidth={1}
                  />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--glass-bg-primary)',
                  border: '1px solid var(--glass-border-primary)',
                  borderRadius: '12px',
                  backdropFilter: 'blur(16px)',
                  color: 'var(--text-primary)'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="no-pie-data">
            <p>📊 No risk data to display</p>
            <small>Distribution will appear when data is loaded</small>
          </div>
        )}
        
        <div className="risk-legend">
          {pieData.map((item) => (
            <div key={item.name} className="legend-item">
              <div 
                className="legend-color" 
                style={{ backgroundColor: RISK_COLORS[item.name] }}
              />
              <span className="legend-label">
                {item.name}: {item.value}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
});

export default RiskDistribution;
