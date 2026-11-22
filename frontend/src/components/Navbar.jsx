import React from 'react';

export default function Navbar({ onScrollToSection }) {
  const handleNav = (sectionId) => {
    if (onScrollToSection) {
      onScrollToSection(sectionId);
    } else {
      const el = document.getElementById(sectionId);
      if (el) el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-md bg-blue-700 flex items-center justify-center text-white font-bold text-sm shadow-sm">
            CIQ
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-900 tracking-tight text-base leading-none">
              ContractIQ
            </span>
            <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase mt-1">
              Privacy-First Legal Tech
            </span>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="hidden md:flex items-center gap-6 text-sm text-slate-600 font-medium">
          <button
            type="button"
            onClick={() => handleNav('how-it-works')}
            className="hover:text-slate-900 transition-colors"
          >
            How It Works
          </button>
          <button
            type="button"
            onClick={() => handleNav('privacy-architecture')}
            className="hover:text-slate-900 transition-colors"
          >
            Privacy Architecture
          </button>
          <button
            type="button"
            onClick={() => handleNav('features')}
            className="hover:text-slate-900 transition-colors"
          >
            Features
          </button>
        </nav>

        {/* Right side Status pill & CTA */}
        <div className="flex items-center gap-3">
          <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-100 border border-slate-200 text-xs text-slate-700 font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-600" />
            Stateless Engine
          </div>
          <button
            type="button"
            onClick={() => handleNav('upload-section')}
            className="btn-primary text-xs sm:text-sm"
          >
            Analyze Contract
          </button>
        </div>
      </div>
    </header>
  );
}
