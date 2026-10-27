'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RefreshCw, Home, ShieldAlert } from 'lucide-react';

export default function PatientDashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Patient portal runtime error:', error);
  }, [error]);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-6 bg-slate-50">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200/90 p-8 text-center shadow-lg">
        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center mx-auto mb-4">
          <ShieldAlert size={28} />
        </div>

        <h2 className="text-xl font-extrabold text-slate-900 tracking-tight">
          Unable to Load Consultation Data
        </h2>

        <p className="text-xs text-slate-500 mt-2 leading-relaxed">
          A temporary network or server error occurred while retrieving your telemedicine records. Your consultation and prescription records remain safe and secure in the cloud.
        </p>

        {error?.digest && (
          <p className="text-[11px] font-mono text-slate-400 mt-2 bg-slate-50 p-2 rounded-lg border border-slate-100">
            Reference Code: {error.digest}
          </p>
        )}

        <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold transition shadow-xs"
          >
            <RefreshCw size={14} /> Try Again
          </button>

          <Link
            href="/patient"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold transition"
          >
            <Home size={14} /> My Dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
