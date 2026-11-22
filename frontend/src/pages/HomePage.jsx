import React, { useState } from 'react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ContractUploader from '../components/ContractUploader';
import ReportDashboard from '../components/ReportDashboard';
import HowItWorks from '../components/HowItWorks';
import PrivacyArchitecture from '../components/PrivacyArchitecture';
import api from '../api/axios';

export default function HomePage() {
  const [activeReport, setActiveReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [progressStage, setProgressStage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleScrollTo = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAnalyze = async (file, consentGiven) => {
    setLoading(true);
    setErrorMessage('');
    setProgressStage('Extracting text and structure in-memory...');

    const formData = new FormData();
    formData.append('file', file);
    formData.append('consent', consentGiven ? 'true' : 'false');

    // Sequential real-world progress stages
    const timer1 = setTimeout(() => {
      setProgressStage('Segmenting clauses and boundary detection...');
    }, 2500);

    const timer2 = setTimeout(() => {
      setProgressStage('Evaluating liability & indemnity risks via Gemini AI...');
    }, 6000);

    const timer3 = setTimeout(() => {
      setProgressStage('Compiling contract risk scorecard & audit recommendations...');
    }, 14000);

    try {
      const response = await api.post('/api/contracts/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      setActiveReport(response.data);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (err) {
      clearTimeout(timer1);
      clearTimeout(timer2);
      clearTimeout(timer3);

      console.error('Contract analysis failure:', err);
      const serverMessage =
        err.response?.data?.message ||
        err.message ||
        'Failed to analyze contract. Please verify your connection or Gemini API key.';
      setErrorMessage(serverMessage);
    } finally {
      setLoading(false);
      setProgressStage('');
    }
  };

  const handleResetAnalysis = () => {
    // Pure stateless reset: discard in-memory report completely
    setActiveReport(null);
    setErrorMessage('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="w-full min-h-screen flex flex-col bg-slate-50 text-slate-900 overflow-x-hidden">
      <Navbar onScrollToSection={handleScrollTo} />

      <main className="flex-1">
        {activeReport ? (
          // Active Analysis Results Dashboard
          <section className="py-10 px-6">
            <ReportDashboard
              report={activeReport}
              onReset={handleResetAnalysis}
            />
          </section>
        ) : (
          // Unified Full-Screen Landing & Upload Workspace
          <>
            <section className="bg-white border-b border-slate-200 min-h-[calc(100vh-4rem)] flex items-center py-8 lg:py-10 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto w-full">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                  {/* Left Column: Hero Narrative & Value Proposition */}
                  <div className="lg:col-span-7 space-y-5 text-left">
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-xs text-blue-700 font-medium">
                      <span className="w-2 h-2 rounded-full bg-blue-600" />
                      Stateless In-Memory Legal Intelligence
                    </div>

                    <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-slate-900 leading-[1.15]">
                      Contract Risk Analysis Without Persistent Document Storage
                    </h1>

                    <p className="text-sm sm:text-base text-slate-600 max-w-xl leading-relaxed">
                      Upload commercial agreements, vendor contracts, or NDAs for instant clause-by-clause
                      risk scoring and protective revisions powered by Google Gemini AI.
                    </p>

                    {/* 3 Key Trust Highlights */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                        <span className="text-xs font-semibold text-slate-900 block mb-0.5">Zero Database</span>
                        <span className="text-[11px] text-slate-500 leading-tight block">Zero contracts or reports saved to disk or DB</span>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                        <span className="text-xs font-semibold text-slate-900 block mb-0.5">Gemini 3.5 AI</span>
                        <span className="text-[11px] text-slate-500 leading-tight block">Deep legal risk severity & counter-proposals</span>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-50 border border-slate-200/80">
                        <span className="text-xs font-semibold text-slate-900 block mb-0.5">PDF Audit Export</span>
                        <span className="text-[11px] text-slate-500 leading-tight block">Instant executive summary PDF download</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-4 pt-1">
                      <button
                        onClick={() => handleScrollTo('how-it-works')}
                        className="text-xs font-medium text-slate-500 hover:text-slate-900 transition-colors inline-flex items-center gap-1.5"
                      >
                        <span>See How It Works</span>
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Upload Card (Above the fold) */}
                  <div className="lg:col-span-5">
                    {errorMessage && (
                      <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-xs text-red-700 flex items-start gap-2.5">
                        <svg className="w-4 h-4 shrink-0 text-red-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div>
                          <strong className="font-semibold block">Analysis Failed</strong>
                          <span>{errorMessage}</span>
                        </div>
                      </div>
                    )}

                    <ContractUploader
                      onAnalyze={handleAnalyze}
                      loading={loading}
                      progressStage={progressStage}
                    />
                  </div>
                </div>
              </div>
            </section>

            {/* Core Capabilities */}
            <section id="features" className="py-16 px-6 border-t border-slate-200 bg-slate-50">
              <div className="max-w-6xl mx-auto">
                <div className="text-center max-w-xl mx-auto mb-12">
                  <span className="text-xs font-mono uppercase tracking-wider text-blue-600 font-semibold">
                    Core Capabilities
                  </span>
                  <h2 className="text-2xl font-semibold text-slate-900 tracking-tight mt-1">
                    Engineered for Precision Legal Triage
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                  {[
                    {
                      title: 'Clause Segmentation',
                      desc: 'Parses complex multi-page contracts into discrete provisions (indemnity, termination, liability caps, warranties).',
                      tag: 'Apache PDFBox',
                    },
                    {
                      title: 'Risk Scoring (0–100)',
                      desc: 'Assigns calibrated HIGH, MEDIUM, or LOW severity ratings with transparent explanations of legal vulnerability.',
                      tag: 'Gemini AI',
                    },
                    {
                      title: 'Protective Revisions',
                      desc: 'Identifies omitted safeguards and drafts protective negotiation counter-language you can copy with one click.',
                      tag: 'Actionable Guidance',
                    },
                    {
                      title: 'Stateless PDF Export',
                      desc: 'Download clean, audit-ready PDF summary reports formatted for executive review and counsel markup.',
                      tag: 'iText7 Engine',
                    },
                  ].map((feat, idx) => (
                    <div key={idx} className="card p-5 space-y-2 bg-white border border-slate-200 shadow-sm">
                      <span className="text-[10px] font-mono text-blue-700 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded font-medium">
                        {feat.tag}
                      </span>
                      <h3 className="text-sm font-semibold text-slate-900 pt-1">
                        {feat.title}
                      </h3>
                      <p className="text-xs text-slate-600 leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* How It Works Section */}
            <HowItWorks />

            {/* Privacy Architecture Section */}
            <PrivacyArchitecture />
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
