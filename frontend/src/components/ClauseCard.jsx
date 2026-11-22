import React, { useState } from 'react';
import RiskBadge from './RiskBadge';

const borderAccent = {
  HIGH: 'border-l-red-600',
  MEDIUM: 'border-l-amber-500',
  LOW: 'border-l-emerald-600',
};

const scoreBarColor = {
  HIGH: 'bg-red-600',
  MEDIUM: 'bg-amber-500',
  LOW: 'bg-emerald-600',
};

export default function ClauseCard({
  clauseIndex,
  clauseType,
  riskLevel,
  riskScore,
  clauseText,
  explanation,
  missingProtections,
  suggestedRevision,
}) {
  const [expanded, setExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const leftBorder = borderAccent[riskLevel] || borderAccent.LOW;
  const barColor = scoreBarColor[riskLevel] || scoreBarColor.LOW;

  const handleCopy = (e) => {
    e.stopPropagation();
    if (suggestedRevision) {
      navigator.clipboard.writeText(suggestedRevision);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div
      className={`card border-l-4 ${leftBorder} overflow-hidden transition-all duration-150`}
    >
      {/* Header bar */}
      <button
        type="button"
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between p-4 text-left hover:bg-slate-50 transition-colors"
        aria-expanded={expanded}
      >
        <div className="flex items-center gap-3 min-w-0">
          <span className="text-xs font-mono text-slate-500 w-6">
            #{clauseIndex != null ? clauseIndex + 1 : '—'}
          </span>
          <span className="text-sm font-semibold text-slate-900 truncate">
            {clauseType || 'Contract Clause'}
          </span>
          <RiskBadge level={riskLevel} />
        </div>

        <div className="flex items-center gap-4 shrink-0 ml-4">
          {/* Risk score bar */}
          <div className="hidden sm:flex items-center gap-2">
            <span className="text-xs text-slate-500">Score:</span>
            <div className="w-16 h-1.5 bg-slate-200 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${barColor}`}
                style={{ width: `${Math.min(100, Math.max(0, riskScore || 0))}%` }}
              />
            </div>
            <span className="text-xs font-mono font-medium text-slate-700 w-6 text-right">
              {riskScore || 0}
            </span>
          </div>

          {/* Chevron */}
          <svg
            className={`w-4 h-4 text-slate-500 transition-transform duration-200 ${
              expanded ? 'rotate-180' : ''
            }`}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Accordion content */}
      {expanded && (
        <div className="border-t border-slate-200 px-4 py-4 space-y-4 bg-slate-50/50 text-sm fade-in">
          {/* Original clause text */}
          {clauseText && (
            <div>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
                Original Clause Text
              </span>
              <div className="p-3 bg-white border border-slate-200 rounded text-xs font-mono text-slate-800 leading-relaxed whitespace-pre-wrap break-words">
                {clauseText}
              </div>
            </div>
          )}

          {/* Risk explanation */}
          {explanation && (
            <div>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1">
                Risk Analysis & Commercial Impact
              </span>
              <p className="text-slate-700 leading-relaxed text-xs sm:text-sm">
                {explanation}
              </p>
            </div>
          )}

          {/* Missing protections */}
          {missingProtections && (
            <div>
              <span className="text-xs font-semibold text-slate-600 uppercase tracking-wider block mb-1.5">
                Missing Safeguards / Key Protections
              </span>
              <div className="flex flex-wrap gap-1.5">
                {missingProtections.split(',').map((item, idx) => {
                  const trimmed = item.trim();
                  if (!trimmed) return null;
                  return (
                    <span
                      key={idx}
                      className="text-xs px-2 py-0.5 rounded bg-slate-200/80 text-slate-800 font-medium"
                    >
                      {trimmed}
                    </span>
                  );
                })}
              </div>
            </div>
          )}

          {/* Suggested revision */}
          {suggestedRevision && (
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <span className="text-xs font-semibold text-blue-800 uppercase tracking-wider">
                  Recommended Revision / Negotiation Position
                </span>
                <button
                  type="button"
                  onClick={handleCopy}
                  className="text-xs text-blue-700 hover:text-blue-900 transition-colors inline-flex items-center gap-1 font-medium"
                >
                  {copied ? (
                    <>
                      <svg className="w-3.5 h-3.5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-emerald-700 font-semibold">Copied</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <span>Copy Revision</span>
                    </>
                  )}
                </button>
              </div>
              <div className="p-3 bg-blue-50/80 border border-blue-200 rounded text-xs font-mono text-blue-950 leading-relaxed whitespace-pre-wrap break-words">
                {suggestedRevision}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
