import React from 'react';

const config = {
  HIGH: {
    label: 'High Risk',
    classes: 'bg-red-50 text-red-700 border-red-200',
    dot: 'bg-red-600',
  },
  MEDIUM: {
    label: 'Medium Risk',
    classes: 'bg-amber-50 text-amber-800 border-amber-200',
    dot: 'bg-amber-600',
  },
  LOW: {
    label: 'Low Risk',
    classes: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    dot: 'bg-emerald-600',
  },
};

export default function RiskBadge({ level, showLabel = true }) {
  const item = config[level] || config.LOW;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-medium border ${item.classes}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${item.dot}`} />
      {showLabel ? item.label : level}
    </span>
  );
}
