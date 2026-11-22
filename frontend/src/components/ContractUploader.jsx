import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

export default function ContractUploader({
  onAnalyze,
  loading = false,
  progressStage = '',
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [consentGiven, setConsentGiven] = useState(false);
  const [validationError, setValidationError] = useState('');

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const onDrop = useCallback((acceptedFiles, fileRejections) => {
    setValidationError('');

    if (fileRejections && fileRejections.length > 0) {
      const rejection = fileRejections[0];
      if (rejection.errors[0]?.code === 'file-too-large') {
        setValidationError('File size exceeds 20MB limit. Please upload a smaller contract.');
      } else {
        setValidationError('Invalid file format. Please upload a valid PDF contract (.pdf).');
      }
      return;
    }

    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      if (!file.name.toLowerCase().endsWith('.pdf')) {
        setValidationError('Only PDF documents are supported.');
        return;
      }
      setSelectedFile(file);
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive, open } = useDropzone({
    onDrop,
    accept: { 'application/pdf': ['.pdf'] },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
    noClick: !!selectedFile,
  });

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    setValidationError('');
  };

  const handleStartAnalysis = () => {
    if (!selectedFile) {
      setValidationError('Please select a PDF contract to begin analysis.');
      return;
    }
    if (!consentGiven) {
      setValidationError('Please acknowledge the external AI processing disclosure below.');
      return;
    }
    setValidationError('');
    onAnalyze(selectedFile, consentGiven);
  };

  return (
    <div id="upload-section" className="w-full max-w-xl mx-auto">
      <div className="card p-5 sm:p-6 space-y-4 bg-white border border-slate-200 shadow-md">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-base sm:text-lg font-semibold text-slate-900 tracking-tight">
              Analyze Contract Risk
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Upload an agreement or NDA for clause-level triage.
            </p>
          </div>
          <span className="text-[11px] font-mono text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded font-medium">
            In-Memory Only
          </span>
        </div>

        {/* Dropzone container */}
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-lg p-5 sm:p-6 text-center transition-all duration-150 ${
            isDragActive
              ? 'border-blue-500 bg-blue-50/50'
              : selectedFile
              ? 'border-emerald-500 bg-emerald-50/30'
              : 'border-slate-300 hover:border-blue-400 bg-slate-50/60 hover:bg-blue-50/20 cursor-pointer'
          }`}
        >
          <input {...getInputProps()} />

          {selectedFile ? (
            <div className="flex flex-col items-center gap-2.5">
              <div className="w-10 h-10 rounded-lg bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>

              <div className="text-center max-w-full px-2">
                <p className="text-sm font-semibold text-slate-900 truncate max-w-xs sm:max-w-sm mx-auto">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-slate-500 mt-0.5 font-mono">
                  {formatFileSize(selectedFile.size)} · PDF Document
                </p>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <button
                  type="button"
                  onClick={open}
                  disabled={loading}
                  className="btn-outline text-xs px-2.5 py-1"
                >
                  Change File
                </button>
                <button
                  type="button"
                  onClick={handleRemoveFile}
                  disabled={loading}
                  className="text-xs text-red-600 hover:text-red-700 font-medium px-2.5 py-1 transition-colors"
                >
                  Remove
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <div
                className={`w-10 h-10 rounded-lg border flex items-center justify-center transition-colors ${
                  isDragActive
                    ? 'bg-blue-100 border-blue-300 text-blue-600'
                    : 'bg-white border-slate-200 text-slate-500 shadow-xs'
                }`}
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>

              <div>
                <p className="text-xs sm:text-sm font-medium text-slate-800">
                  {isDragActive ? 'Drop PDF contract here' : 'Click to select or drag & drop PDF'}
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5 font-mono">
                  Supported: PDF up to 20 MB
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Validation error display */}
        {validationError && (
          <div className="text-xs text-red-700 bg-red-50 border border-red-200 rounded p-2.5 flex items-start gap-2">
            <svg className="w-4 h-4 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <span>{validationError}</span>
          </div>
        )}

        {/* Privacy Notice & Mandatory Consent */}
        <div className="border border-slate-200 bg-slate-50/80 rounded-md p-3 space-y-2">
          <div className="flex items-start gap-2">
            <svg className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              <strong className="text-slate-800">Stateless Disclosure:</strong> Contracts are analyzed temporarily in RAM and transmitted via TLS to Google Gemini AI. No documents or reports are permanently retained.
            </p>
          </div>

          <label className="flex items-start gap-2.5 cursor-pointer pt-1.5 border-t border-slate-200">
            <input
              type="checkbox"
              checked={consentGiven}
              onChange={(e) => {
                setConsentGiven(e.target.checked);
                if (e.target.checked) setValidationError('');
              }}
              disabled={loading}
              className="mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-0 focus:ring-offset-0 cursor-pointer"
            />
            <span className="text-[11px] text-slate-700 select-none font-medium leading-tight">
              I authorize sending contract text to Google Gemini AI for risk evaluation.
            </span>
          </label>
        </div>

        {/* Action Button / Progress */}
        {loading ? (
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
            <div className="flex items-center justify-center gap-2.5">
              <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-slate-800">
                {progressStage || 'Processing contract in memory...'}
              </span>
            </div>

            {/* Stage Progress indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 pt-1">
              {[
                '1. In-Memory PDF',
                '2. Clauses',
                '3. Gemini AI',
                '4. Risk Audit',
              ].map((stage, idx) => (
                <div
                  key={idx}
                  className="text-center p-1.5 rounded bg-white border border-slate-200 text-[10px] text-slate-600 font-medium truncate"
                >
                  {stage}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleStartAnalysis}
            disabled={!selectedFile || !consentGiven}
            className="w-full btn-primary py-2.5 text-xs sm:text-sm font-semibold disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Analyze Contract
          </button>
        )}
      </div>
    </div>
  );
}
