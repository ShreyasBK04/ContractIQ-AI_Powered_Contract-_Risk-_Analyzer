import React, { useState } from 'react';
import RiskBadge from './RiskBadge';
import ClauseCard from './ClauseCard';
import RiskScoreChart from './RiskScoreChart';
import api from '../api/axios';

export default function ReportDashboard({ report, onReset }) {
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  if (!report) return null;

  const clauses = report.clauses || [];

  const filteredClauses = clauses.filter((c) => {
    const matchesLevel = filterLevel === 'ALL' || c.riskLevel === filterLevel;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !query ||
      (c.clauseType && c.clauseType.toLowerCase().includes(query)) ||
      (c.clauseText && c.clauseText.toLowerCase().includes(query)) ||
      (c.explanation && c.explanation.toLowerCase().includes(query)) ||
      (c.missingProtections && c.missingProtections.toLowerCase().includes(query));

    return matchesLevel && matchesSearch;
  });

  const handleExportPdf = async () => {
    setIsExporting(true);
    setExportError('');

    try {
      const response = await api.post('/api/reports/export', report, {
        responseType: 'blob',
      });

      const blob = new Blob([response.data], { type: 'application/pdf' });
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      const cleanName = report.originalFilename
        ? report.originalFilename.replace('.pdf', '')
        : 'contract';
      link.download = `${cleanName}-Risk-Report.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      setExportError('Failed to generate PDF report. Please try again.');
      console.error('Export error:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'text-red-600';
    if (score >= 40) return 'text-amber-600';
    return 'text-emerald-600';
  };

  const formatRiskTitle = (cat) => {
    if (cat === 'HIGH_RISK') return 'High Risk';
    if (cat === 'MODERATE_RISK') return 'Moderate Risk';
    return 'Low Risk';
  };

  return (
    <div className="w-full max-w-5xl mx-auto space-y-6 fade-in">
      {/* Top action toolbar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <span className="text-xs font-mono uppercase tracking-wider text-slate-500 font-medium">
            Contract Risk Assessment
          </span>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight break-all mt-0.5">
            {report.originalFilename || 'Contract Document'}
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Evaluated {report.totalClauses || clauses.length} discrete provisions · Ephemeral Memory Audit
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={onReset}
            className="btn-secondary text-xs sm:text-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Analyze Another Contract
          </button>

          <button
            type="button"
            onClick={handleExportPdf}
            disabled={isExporting}
            className="btn-primary text-xs sm:text-sm"
          >
            {isExporting ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Generating PDF...
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Download PDF Report
              </>
            )}
          </button>
        </div>
      </div>

      {exportError && (
        <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-3">
          {exportError}
        </div>
      )}

      {/* Primary KPI Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Overall score card */}
        <div className="card p-5 flex flex-col justify-between bg-white border border-slate-200 shadow-sm">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Overall Risk Score
            </span>
            <div className="flex items-baseline gap-2 mt-2">
              <span className={`text-3xl font-bold font-mono ${getScoreColor(report.overallScore)}`}>
                {report.overallScore}
              </span>
              <span className="text-xs text-slate-400 font-mono">/ 100</span>
            </div>
          </div>
          <div className="mt-3">
            <span
              className={`inline-block text-xs font-semibold px-2 py-0.5 rounded ${
                report.overallScore >= 70
                  ? 'bg-red-50 text-red-700 border border-red-200'
                  : report.overallScore >= 40
                  ? 'bg-amber-50 text-amber-800 border border-amber-200'
                  : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              }`}
            >
              {formatRiskTitle(report.riskCategory)}
            </span>
          </div>
        </div>

        {/* High Risk Clauses */}
        <div className="card p-5 border-l-4 border-l-red-500 bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            High Risk Clauses
          </span>
          <p className="text-3xl font-bold font-mono text-red-600 mt-2">
            {report.highRiskCount || 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">Requires legal review or redlining</p>
        </div>

        {/* Medium Risk Clauses */}
        <div className="card p-5 border-l-4 border-l-amber-500 bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Medium Risk Clauses
          </span>
          <p className="text-3xl font-bold font-mono text-amber-600 mt-2">
            {report.mediumRiskCount || 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">Commercial ambiguities or missing terms</p>
        </div>

        {/* Low Risk Clauses */}
        <div className="card p-5 border-l-4 border-l-emerald-500 bg-white border border-slate-200 shadow-sm">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Low Risk Clauses
          </span>
          <p className="text-3xl font-bold font-mono text-emerald-600 mt-2">
            {report.lowRiskCount || 0}
          </p>
          <p className="text-xs text-slate-500 mt-1">Standard language with balanced obligations</p>
        </div>
      </div>

      {/* Contract Executive Summary & Risk Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Executive summary */}
        <div className="lg:col-span-2 card p-6 bg-white border border-slate-200 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <svg className="w-4 h-4 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-sm font-semibold text-slate-800 uppercase tracking-wider">
              Executive Contract Summary
            </h3>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed">
            {report.contractSummary ||
              'The contract clauses have been segmented and evaluated for potential commercial liability, indemnification terms, and operational risks.'}
          </p>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Total provisions evaluated: {report.totalClauses || clauses.length}</span>
            <span className="font-mono text-slate-600">Model: Google Gemini 3.5 Flash-Lite</span>
          </div>
        </div>

        {/* Risk Distribution Chart */}
        <div className="card p-6 flex flex-col justify-between bg-white border border-slate-200 shadow-sm">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Risk Distribution
          </h3>
          <RiskScoreChart
            highRiskCount={report.highRiskCount || 0}
            mediumRiskCount={report.mediumRiskCount || 0}
            lowRiskCount={report.lowRiskCount || 0}
            overallScore={report.overallScore || 0}
          />
          <div className="flex items-center justify-center gap-4 text-xs text-slate-600 mt-2 font-medium">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500" /> High
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Medium
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Low
            </span>
          </div>
        </div>
      </div>

      {/* Clause-by-Clause Explorer */}
      <div className="space-y-4 pt-2">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-slate-900">
              Clause-by-Clause Analysis
            </h3>
            <p className="text-xs text-slate-500">
              Showing {filteredClauses.length} of {clauses.length} evaluated provisions
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Filter buttons */}
            <div className="inline-flex rounded-lg p-0.5 bg-slate-100 border border-slate-200">
              {['ALL', 'HIGH', 'MEDIUM', 'LOW'].map((lvl) => (
                <button
                  key={lvl}
                  type="button"
                  onClick={() => setFilterLevel(lvl)}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${
                    filterLevel === lvl
                      ? 'bg-white text-slate-900 shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {lvl === 'ALL' ? 'All' : lvl}
                </button>
              ))}
            </div>

            {/* Search filter */}
            <div className="relative">
              <input
                type="text"
                placeholder="Search clauses..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="input-field py-1 px-2.5 text-xs w-40 sm:w-48 bg-white border-slate-200 text-slate-900"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1.5 text-xs text-slate-400 hover:text-slate-600"
                >
                  ✕
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Clause List */}
        {filteredClauses.length === 0 ? (
          <div className="card p-12 text-center text-slate-500 text-sm bg-white border border-slate-200">
            <svg className="w-8 h-8 text-slate-400 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            No clauses found matching your filter criteria.
          </div>
        ) : (
          <div className="space-y-3">
            {filteredClauses.map((clause, idx) => (
              <ClauseCard
                key={clause.id || idx}
                clauseIndex={clause.clauseIndex != null ? clause.clauseIndex : idx}
                clauseType={clause.clauseType}
                riskLevel={clause.riskLevel}
                riskScore={clause.riskScore}
                clauseText={clause.clauseText}
                explanation={clause.explanation}
                missingProtections={clause.missingProtections}
                suggestedRevision={clause.suggestedRevision}
              />
            ))}
          </div>
        )}
      </div>

      {/* Legal Advice Disclaimer Box */}
      <div className="card p-4 bg-amber-50 border border-amber-200 text-slate-700 flex items-start gap-3 mt-8">
        <svg className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <p className="text-xs text-slate-700 leading-relaxed">
          <strong className="text-slate-900">Legal Screening Disclaimer:</strong> This contract risk evaluation and suggested revisions are generated by an artificial intelligence model (Google Gemini) for informational screening purposes only. ContractIQ is not a law firm and does not provide legal advice. Always engage qualified legal counsel for binding contract review and negotiations.
        </p>
      </div>
    </div>
  );
}
