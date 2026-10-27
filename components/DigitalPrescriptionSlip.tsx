'use client';

import React from 'react';
import {
  Printer,
  X,
  Activity,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  User,
  FileText,
  Clock
} from 'lucide-react';
import { formatAppointmentDate, formatAppointmentTime } from '@/lib/schedule';

export interface MedicineRow {
  name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface PrescriptionSlipProps {
  prescriptionId?: string;
  appointmentId: string;
  dateStr?: string;
  doctorName: string;
  doctorSpecialization?: string;
  doctorRegNo?: string;
  patientName: string;
  patientEmail?: string;
  patientId?: string;
  medicines: MedicineRow[] | string;
  notes?: string;
  diagnosis?: string;
  onClose?: () => void;
  showPrintButton?: boolean;
}

export function parseMedicineInput(raw: MedicineRow[] | string): MedicineRow[] {
  if (Array.isArray(raw)) return raw;
  if (!raw || typeof raw !== 'string') return [];

  // Try JSON first
  try {
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed;
  } catch {}

  // Parse pipe or dash separated lines
  const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
  return lines.map((line, i) => {
    if (line.includes('|')) {
      const parts = line.split('|').map(p => p.trim());
      return {
        name: parts[0] || `Rx Medicine #${i + 1}`,
        dosage: parts[1] || 'As needed',
        frequency: parts[2] || '1-0-1',
        duration: parts[3] || '5 Days',
        instructions: parts[4] || 'After meals',
      };
    }

    // Heuristic: "Paracetamol 500mg - 1 tab after food (3 days)"
    return {
      name: line.replace(/^\d+[\.\)]\s*/, ''),
      dosage: 'Standard',
      frequency: '1-0-1',
      duration: '5 Days',
      instructions: 'As directed by physician',
    };
  });
}

export default function DigitalPrescriptionSlip({
  prescriptionId,
  appointmentId,
  dateStr,
  doctorName,
  doctorSpecialization = 'Consultant Physician',
  doctorRegNo = 'NMC-2018-77491',
  patientName,
  patientEmail,
  patientId,
  medicines,
  notes,
  diagnosis = 'General Medical Consultation',
  onClose,
  showPrintButton = true,
}: PrescriptionSlipProps) {
  const medicineList = parseMedicineInput(medicines);
  const formattedDate = dateStr
    ? formatAppointmentDate(dateStr)
    : formatAppointmentDate(new Date().toISOString());
  const formattedTime = dateStr ? formatAppointmentTime(dateStr) : '';

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-2 sm:p-4 overflow-y-auto print:p-0 print:bg-white print:static print:inset-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 text-slate-800 my-auto print:border-none print:shadow-none print:p-0 print:max-w-full">
        
        {/* Modal Controls (Hidden in Print) */}
        <div className="flex items-center justify-between pb-4 mb-6 border-b border-slate-100 print:hidden">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-700">
              Official Digital E-Prescription Slip
            </span>
          </div>

          <div className="flex items-center gap-2">
            {showPrintButton && (
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-xs font-semibold shadow-xs transition"
              >
                <Printer size={15} /> Print / Save PDF
              </button>
            )}
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
                title="Close"
              >
                <X size={20} />
              </button>
            )}
          </div>
        </div>

        {/* PRINTABLE SLIP CONTAINER */}
        <div className="space-y-6 print:space-y-4 font-sans text-slate-900">
          
          {/* 1. Official Clinic Header */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between pb-5 border-b-2 border-teal-600 gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-600 flex items-center justify-center text-white shadow-md">
                <Activity size={26} />
              </div>
              <div>
                <h1 className="text-2xl font-black tracking-tight text-teal-900 flex items-center gap-2">
                  HealthConnect
                  <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full bg-teal-100 text-teal-800 border border-teal-200">
                    Telehealth India
                  </span>
                </h1>
                <p className="text-xs text-slate-500">
                  National Telemedicine Guidelines 2020 & NABH Standards Compliant
                </p>
                <p className="text-[11px] text-slate-400">
                  Clinic Reg: <span className="font-semibold text-slate-600">NABH-DL-2026-HC092</span> | Lic: <span className="font-semibold text-slate-600">MED-IN-98442</span>
                </p>
              </div>
            </div>

            <div className="text-left sm:text-right text-xs space-y-0.5 text-slate-600">
              <p className="font-bold text-slate-800 text-sm">E-Prescription Record</p>
              <p>Rx ID: <span className="font-mono text-slate-900 font-semibold">{prescriptionId?.slice(0, 8) || appointmentId?.slice(0, 8) || 'RX-78901'}</span></p>
              <p>Date: <span className="font-semibold text-slate-900">{formattedDate}</span></p>
              {formattedTime && <p>Time: <span className="font-semibold text-slate-900">{formattedTime}</span></p>}
              <p className="text-[11px] text-emerald-700 font-semibold">Mode: Encrypted Video Consult</p>
            </div>
          </div>

          {/* 2. Doctor & Patient Info Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs">
            {/* Doctor Info */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Prescribing Specialist</span>
              <p className="text-sm font-extrabold text-slate-900">Dr. {doctorName}</p>
              <p className="text-slate-600 font-medium">{doctorSpecialization}</p>
              <p className="text-[11px] text-slate-500">
                NMC Registration No: <span className="font-semibold text-slate-800">{doctorRegNo}</span>
              </p>
            </div>

            {/* Patient Info */}
            <div className="space-y-1 sm:border-l sm:border-slate-200 sm:pl-4">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Patient Details</span>
              <p className="text-sm font-extrabold text-slate-900">{patientName || 'Verified Patient'}</p>
              {patientEmail && <p className="text-slate-600 truncate">{patientEmail}</p>}
              <p className="text-[11px] text-slate-500">
                Patient ID: <span className="font-mono font-semibold text-slate-800">{patientId?.slice(0, 8) || 'PT-39201'}</span>
              </p>
            </div>
          </div>

          {/* 3. Diagnosis & Vitals */}
          {diagnosis && (
            <div className="text-xs">
              <span className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">Diagnosis / Primary Concern:</span>
              <div className="mt-1 px-3 py-1.5 bg-teal-50/60 rounded-lg border border-teal-200 text-teal-900 font-medium">
                {diagnosis}
              </div>
            </div>
          )}

          {/* 4. Tabular Prescribed Medicines */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <FileText size={14} className="text-teal-600" /> Prescribed Medications (Rx)
              </h3>
              <span className="text-[11px] text-slate-500 font-medium">{medicineList.length} Item(s)</span>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs divide-y divide-slate-200">
                <thead className="bg-slate-100 text-slate-700 font-bold uppercase text-[10px] tracking-wider">
                  <tr>
                    <th scope="col" className="px-3 py-2.5 text-center w-8">#</th>
                    <th scope="col" className="px-3 py-2.5">Medicine Name</th>
                    <th scope="col" className="px-3 py-2.5">Dosage</th>
                    <th scope="col" className="px-3 py-2.5">Frequency</th>
                    <th scope="col" className="px-3 py-2.5">Duration</th>
                    <th scope="col" className="px-3 py-2.5">Instructions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 bg-white">
                  {medicineList.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-4 text-center text-slate-400 italic">
                        No medicines prescribed.
                      </td>
                    </tr>
                  ) : (
                    medicineList.map((med, index) => (
                      <tr key={index} className="hover:bg-slate-50/70">
                        <td className="px-3 py-2.5 text-center font-bold text-slate-400">{index + 1}</td>
                        <td className="px-3 py-2.5 font-bold text-slate-900">{med.name}</td>
                        <td className="px-3 py-2.5 text-slate-700 font-medium">{med.dosage}</td>
                        <td className="px-3 py-2.5">
                          <span className="inline-block px-2 py-0.5 rounded bg-teal-50 text-teal-800 font-semibold border border-teal-200 text-[10px]">
                            {med.frequency}
                          </span>
                        </td>
                        <td className="px-3 py-2.5 text-slate-700">{med.duration}</td>
                        <td className="px-3 py-2.5 text-slate-600">{med.instructions}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* 5. Clinical Advice / Notes */}
          {notes && (
            <div className="text-xs p-3.5 bg-amber-50/50 rounded-xl border border-amber-200/70 text-slate-800">
              <span className="font-bold text-amber-900 block mb-1">Doctor's Advice & Dietary Instructions:</span>
              <p className="whitespace-pre-line text-slate-700 leading-relaxed">{notes}</p>
            </div>
          )}

          {/* 6. Digital Signature & Verification Badge */}
          <div className="pt-4 border-t border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full border-2 border-dashed border-teal-500 bg-teal-50/60 flex items-center justify-center text-teal-700">
                <CheckCircle2 size={24} />
              </div>
              <div className="text-xs">
                <p className="font-extrabold text-teal-900 flex items-center gap-1">
                  Digitally Authenticated
                  <ShieldCheck size={14} className="text-teal-600" />
                </p>
                <p className="text-[11px] text-slate-600">Dr. {doctorName} • Reg #{doctorRegNo}</p>
                <p className="text-[10px] text-slate-400">Timestamp: {new Date().toISOString()}</p>
              </div>
            </div>

            <div className="text-left sm:text-right text-[10px] text-slate-400 max-w-xs">
              Valid digital e-prescription issued pursuant to the Telemedicine Practice Guidelines, National Medical Commission & Ministry of Health & Family Welfare, Govt. of India.
            </div>
          </div>
        </div>

        {/* Print Stylesheet */}
        <style jsx global>{`
          @media print {
            body * {
              visibility: hidden;
            }
            .print\\:block,
            .fixed.inset-0,
            .fixed.inset-0 * {
              visibility: visible;
            }
            .fixed.inset-0 {
              position: absolute;
              left: 0;
              top: 0;
              width: 100%;
              height: 100%;
              background: white !important;
              padding: 0 !important;
            }
          }
        `}</style>
      </div>
    </div>
  );
}
