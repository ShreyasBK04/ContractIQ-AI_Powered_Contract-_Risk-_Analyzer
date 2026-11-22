import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

const RISK_COLORS = {
  HIGH: '#dc2626',
  MEDIUM: '#d97706',
  LOW: '#16a34a',
};

function CustomTooltip({ active, payload }) {
  if (active && payload && payload.length) {
    const { name, value, percent } = payload[0].payload;
    return (
      <div className="bg-white border border-slate-200 rounded-md px-3 py-1.5 shadow-md text-xs">
        <p className="font-semibold text-slate-800">{name}</p>
        <p className="text-slate-600 mt-0.5">
          {value} clause{value !== 1 ? 's' : ''} ({Math.round((percent || 0) * 100)}%)
        </p>
      </div>
    );
  }
  return null;
}

export default function RiskScoreChart({
  highRiskCount = 0,
  mediumRiskCount = 0,
  lowRiskCount = 0,
  overallScore = 0,
}) {
  const total = highRiskCount + mediumRiskCount + lowRiskCount;

  const data = [
    { name: 'High Risk', value: highRiskCount, color: RISK_COLORS.HIGH, percent: total > 0 ? highRiskCount / total : 0 },
    { name: 'Medium Risk', value: mediumRiskCount, color: RISK_COLORS.MEDIUM, percent: total > 0 ? mediumRiskCount / total : 0 },
    { name: 'Low Risk', value: lowRiskCount, color: RISK_COLORS.LOW, percent: total > 0 ? lowRiskCount / total : 0 },
  ].filter((item) => item.value > 0);

  const fallbackData = [{ name: 'No Data', value: 1, color: '#e2e8f0', percent: 1 }];
  const chartData = data.length > 0 ? data : fallbackData;

  const scoreColor =
    overallScore >= 70
      ? 'text-red-600'
      : overallScore >= 40
      ? 'text-amber-600'
      : 'text-emerald-600';

  const riskLabel =
    overallScore >= 70 ? 'High Risk' : overallScore >= 40 ? 'Moderate Risk' : 'Low Risk';

  return (
    <div className="flex flex-col items-center justify-center relative w-full min-w-0 h-48">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={75}
            paddingAngle={chartData.length > 1 ? 3 : 0}
            dataKey="value"
            stroke="#ffffff"
            strokeWidth={2}
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Centered label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className={`text-2xl font-bold font-mono ${scoreColor}`}>
          {overallScore}
        </span>
        <span className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">
          {riskLabel}
        </span>
      </div>
    </div>
  );
}
