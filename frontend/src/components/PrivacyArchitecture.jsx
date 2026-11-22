import React from 'react';

export default function PrivacyArchitecture() {
  const pillars = [
    {
      title: 'Zero Permanent Storage',
      description:
        'ContractIQ is built without a database. Uploaded contracts and analysis results are never saved to a database, cloud storage bucket, or persistent server directories.',
      icon: (
        <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      title: 'In-Memory Processing & Cleanup',
      description:
        'Uploads under 2MB are processed in volatile RAM. Files above 2MB are temporarily buffered by the servlet container and deleted automatically upon request completion. Streams and PDFBox handles are closed via try-with-resources.',
      icon: (
        <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
    {
      title: 'External AI Transmission',
      description:
        'Extracted contract clauses are transmitted via HTTPS to Google Gemini API (gemini-3.5-flash-lite) for risk evaluation. AI processing is subject to Google Cloud terms and privacy policies.',
      icon: (
        <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      title: 'Zero Browser Persistence',
      description:
        'Neither contracts, tokens, nor analysis reports are stored in browser localStorage or sessionStorage. All client state is held solely in React component memory and cleared upon page refresh or reset.',
      icon: (
        <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
        </svg>
      ),
    },
  ];

  return (
    <section id="privacy-architecture" className="py-16 border-t border-slate-200 bg-white">
      <div className="max-w-6xl mx-auto px-6">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-mono uppercase tracking-wider text-blue-600 font-semibold">
            Privacy Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-semibold text-slate-900 tracking-tight mt-2">
            Transparent, Zero-Persistence Architecture
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            ContractIQ operates statelessly to protect confidentiality. Here is how your data is handled at every stage of the pipeline.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pillars.map((pillar, idx) => (
            <div key={idx} className="card p-6 flex gap-4 items-start bg-slate-50/70 border border-slate-200">
              <div className="p-2.5 rounded-lg bg-white border border-slate-200 shadow-sm shrink-0">
                {pillar.icon}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-slate-900 mb-1">
                  {pillar.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {pillar.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* Explicit Disclosure Banner */}
        <div className="mt-8 border border-blue-200 bg-blue-50/70 rounded-lg p-5">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-xs text-slate-700 leading-relaxed">
              <strong className="text-slate-900">Important Privacy & AI Notice:</strong> While ContractIQ maintains zero persistent internal storage, analysis is performed by Google Gemini AI. Document text is transmitted securely over TLS to Google servers for clause evaluation. Users should ensure they possess appropriate authorization prior to analyzing proprietary or sensitive commercial agreements. External AI processing and data retention are governed by Google's terms and privacy policies.
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
