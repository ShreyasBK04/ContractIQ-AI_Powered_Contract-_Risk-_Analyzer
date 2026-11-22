import React from 'react';

export default function HowItWorks() {
  const steps = [
    {
      number: '01',
      title: 'Upload & In-Memory Parsing',
      description:
        'Upload your PDF contract. The document is received by the Spring Boot backend and parsed in memory using Apache PDFBox, extracting clause provisions without persistent database storage.',
      badge: 'Apache PDFBox',
    },
    {
      number: '02',
      title: 'Gemini AI Risk Assessment',
      description:
        'Identified clauses are transmitted via encrypted HTTPS to Google Gemini AI (3.5 Flash-Lite). The AI evaluates indemnities, liability caps, warranties, and termination terms against standard commercial practices.',
      badge: 'Google Gemini AI',
    },
    {
      number: '03',
      title: 'Audit Report & PDF Export',
      description:
        'Review an interactive scorecard displaying high, medium, and low-risk provisions alongside recommended revisions. Generate a downloadable PDF audit report, or start a new analysis to clear client state.',
      badge: 'iText7 Engine',
    },
  ];

  return (
    <section id="how-it-works" className="py-16 border-t border-slate-200">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-wider text-blue-700 font-semibold">
            Workflow Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-1">
            How ContractIQ Analyzes Agreements
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            A three-step stateless processing pipeline designed for rapid risk identification without long-term server retention.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="card p-6 relative flex flex-col justify-between hover:border-slate-300 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-2xl font-bold font-mono text-slate-400">
                    {step.number}
                  </span>
                  <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-700 font-medium">
                    {step.badge}
                  </span>
                </div>
                <h3 className="text-base font-semibold text-slate-900 mb-2">
                  {step.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {step.description}
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-100 flex items-center text-[11px] text-slate-500 font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-600 mr-2" />
                Stateless processing turn
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
