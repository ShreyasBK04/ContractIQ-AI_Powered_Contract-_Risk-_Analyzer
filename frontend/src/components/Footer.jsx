import React from 'react';

export default function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white mt-20 text-slate-600 text-xs py-10">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-6 h-6 rounded bg-blue-700 flex items-center justify-center text-white font-bold text-xs">
                CIQ
              </div>
              <span className="font-semibold text-slate-900 text-sm">ContractIQ</span>
            </div>
            <p className="text-slate-600 leading-relaxed text-xs">
              Contract risk assessment platform built with a stateless, privacy-conscious architecture.
              Uploads are processed temporarily and are not persistently stored by the application.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-3">
              Privacy Architecture
            </h4>
            <ul className="space-y-1.5 text-xs text-slate-600">
              <li>• No user accounts, logins, or tracking cookies</li>
              <li>• No persistent contract or report database</li>
              <li>• Temporary in-memory text extraction</li>
              <li>• Servlet temp files automatically deleted upon request end</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-slate-900 text-xs uppercase tracking-wider mb-3">
              External AI Disclosure
            </h4>
            <p className="text-slate-600 leading-relaxed text-xs">
              Extracted contract clauses are transmitted via encrypted HTTPS to Google Gemini API
              for legal risk evaluation. Processing is subject to Google's terms and privacy policies.
            </p>
          </div>
        </div>

        {/* Disclaimer box */}
        <div className="border border-slate-200 bg-slate-50 rounded-lg p-4 mb-6">
          <p className="text-[11px] text-slate-600 leading-relaxed">
            <strong className="text-slate-800">Legal Disclaimer:</strong> ContractIQ is an automated
            software tool for preliminary contract risk screening. It does NOT provide legal advice, establish
            an attorney-client relationship, or substitute for consultation with a qualified legal professional.
            Always consult qualified commercial legal counsel before executing binding legal agreements.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between text-slate-500 pt-4 border-t border-slate-100 text-[11px]">
          <p>© {new Date().getFullYear()} ContractIQ. Built with Java Spring Boot & React.</p>
          <p className="mt-2 sm:mt-0 font-mono">Google Gemini 3.5 Flash-Lite</p>
        </div>
      </div>
    </footer>
  );
}
