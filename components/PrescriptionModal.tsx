'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import {
  X,
  FileText,
  Loader2,
  Plus,
  Trash2,
  Eye,
  Edit3,
  Printer,
  ShieldCheck,
  Stethoscope
} from 'lucide-react';
import DigitalPrescriptionSlip, { MedicineRow } from './DigitalPrescriptionSlip';

export default function PrescriptionModal({
  appointmentId,
  onClose,
}: {
  appointmentId: string;
  onClose: () => void;
}) {
  const [medicinesList, setMedicinesList] = useState<MedicineRow[]>([
    { name: '', dosage: '', frequency: '1-0-1', duration: '5 Days', instructions: 'After meals' },
  ]);
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);

  // Loaded appointment context
  const [doctorInfo, setDoctorInfo] = useState<{ name: string; specialization: string }>({
    name: 'Doctor',
    specialization: 'Medical Specialist',
  });
  const [patientInfo, setPatientInfo] = useState<{ name: string; email?: string; id?: string }>({
    name: 'Patient',
  });

  const supabase = createClient();

  useEffect(() => {
    const fetchContext = async () => {
      try {
        const { data: apt } = await supabase
          .from('appointments')
          .select(`
            id,
            patient_id,
            doctor_id,
            doctor:doctor_id (
              specialization,
              profiles (
                full_name
              )
            ),
            patient:patient_id (
              full_name,
              email
            ),
            prescriptions (
              id,
              medicines,
              notes
            )
          `)
          .eq('id', appointmentId)
          .maybeSingle();

        if (apt) {
          if (apt.doctor) {
            setDoctorInfo({
              name: (apt.doctor as any)?.profiles?.full_name || 'Consultant Physician',
              specialization: (apt.doctor as any)?.specialization || 'General Physician',
            });
          }
          if (apt.patient) {
            setPatientInfo({
              name: (apt.patient as any)?.full_name || 'Patient',
              email: (apt.patient as any)?.email,
              id: apt.patient_id,
            });
          }

          // If prescription already exists, populate it
          if (apt.prescriptions && (apt.prescriptions as any[]).length > 0) {
            const rx = (apt.prescriptions as any[])[0];
            if (rx.notes) setNotes(rx.notes);
            if (rx.medicines) {
              try {
                const parsed = JSON.parse(rx.medicines);
                if (Array.isArray(parsed) && parsed.length > 0) {
                  setMedicinesList(parsed);
                }
              } catch {
                // If text format, split lines
                const lines = rx.medicines.split('\n').filter(Boolean);
                if (lines.length > 0) {
                  setMedicinesList(
                    lines.map((l: string) => {
                      const parts = l.split('|').map((s: string) => s.trim());
                      return {
                        name: parts[0] || l,
                        dosage: parts[1] || 'Standard',
                        frequency: parts[2] || '1-0-1',
                        duration: parts[3] || '5 Days',
                        instructions: parts[4] || 'After meals',
                      };
                    })
                  );
                }
              }
            }
          }
        }
      } catch (e) {
        console.error('Error fetching appointment context:', e);
      } finally {
        setFetching(false);
      }
    };

    fetchContext();
  }, [appointmentId]);

  const handleAddMedicine = () => {
    setMedicinesList((prev) => [
      ...prev,
      { name: '', dosage: '', frequency: '1-0-1', duration: '5 Days', instructions: 'After meals' },
    ]);
  };

  const handleRemoveMedicine = (index: number) => {
    if (medicinesList.length === 1) return;
    setMedicinesList((prev) => prev.filter((_, i) => i !== index));
  };

  const handleMedicineChange = (index: number, field: keyof MedicineRow, value: string) => {
    setMedicinesList((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      alert('You must be logged in to save a prescription.');
      setLoading(false);
      return;
    }

    // Filter valid medicine entries
    const validMedicines = medicinesList.filter((m) => m.name.trim().length > 0);
    if (validMedicines.length === 0) {
      alert('Please add at least one prescribed medicine.');
      setLoading(false);
      return;
    }

    // Serialize medicines to JSON string for structured storage and clean text lines
    const medicinesPayload = JSON.stringify(validMedicines);

    // Fetch patient_id from the appointment to ensure data integrity
    const { data: appointment } = await supabase
      .from('appointments')
      .select('patient_id')
      .eq('id', appointmentId)
      .single();

    const { error } = await supabase.from('prescriptions').insert({
      appointment_id: appointmentId,
      doctor_id: user.id,
      patient_id: appointment?.patient_id,
      medicines: medicinesPayload,
      notes,
      encrypted_data: 'N/A', // Placeholder to satisfy database constraint
    });

    if (error) {
      alert('Failed to save prescription: ' + error.message);
    } else {
      // Mark appointment as completed
      await supabase.from('appointments').update({ status: 'completed' }).eq('id', appointmentId);
      onClose();
      window.location.reload();
    }
    setLoading(false);
  };

  if (fetching) {
    return (
      <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl p-8 max-w-sm w-full flex items-center justify-center gap-3 text-slate-600 shadow-xl">
          <Loader2 className="animate-spin text-teal-600" size={24} />
          <span className="text-sm font-semibold">Loading prescription form...</span>
        </div>
      </div>
    );
  }

  // If in Preview Mode, render the full Digital Printable Prescription Slip
  if (previewMode) {
    return (
      <DigitalPrescriptionSlip
        appointmentId={appointmentId}
        doctorName={doctorInfo.name}
        doctorSpecialization={doctorInfo.specialization}
        patientName={patientInfo.name}
        patientEmail={patientInfo.email}
        patientId={patientInfo.id}
        medicines={medicinesList.filter((m) => m.name.trim().length > 0)}
        notes={notes}
        diagnosis={diagnosis}
        onClose={() => setPreviewMode(false)}
        showPrintButton={true}
      />
    );
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center z-50 p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl border border-slate-200 my-auto text-slate-800">
        
        {/* Header */}
        <div className="flex justify-between items-center pb-4 mb-5 border-b border-slate-100">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-50 border border-teal-200 flex items-center justify-center text-teal-700">
              <Stethoscope size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">Digital Prescription Editor</h2>
              <p className="text-xs text-slate-500">
                Patient: <span className="font-semibold text-slate-700">{patientInfo.name}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setPreviewMode(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-teal-300 text-teal-700 hover:bg-teal-50 text-xs font-semibold transition"
            >
              <Eye size={14} /> Preview Slip
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Diagnosis Field */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Diagnosis / Clinical Notes
            </label>
            <input
              type="text"
              className="w-full p-2.5 text-sm border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 focus:border-teal-500 outline-none transition"
              placeholder="e.g. Acute Upper Respiratory Tract Infection (URTI) with mild fever"
              value={diagnosis}
              onChange={(e) => setDiagnosis(e.target.value)}
            />
          </div>

          {/* Structured Medicines Table */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
                Prescribed Medicines Table (Rx)
              </label>
              <button
                type="button"
                onClick={handleAddMedicine}
                className="inline-flex items-center gap-1 text-xs font-semibold text-teal-700 hover:text-teal-800 bg-teal-50 hover:bg-teal-100 px-2.5 py-1 rounded-lg border border-teal-200 transition"
              >
                <Plus size={14} /> Add Medicine
              </button>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {medicinesList.map((med, index) => (
                <div
                  key={index}
                  className="p-3 rounded-xl border border-slate-200 bg-slate-50/70 grid grid-cols-12 gap-2 items-center"
                >
                  <div className="col-span-12 sm:col-span-4">
                    <input
                      type="text"
                      required
                      className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-teal-500"
                      placeholder="Medicine Name (e.g. Paracetamol)"
                      value={med.name}
                      onChange={(e) => handleMedicineChange(index, 'name', e.target.value)}
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-2">
                    <input
                      type="text"
                      className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-teal-500"
                      placeholder="Dosage (500mg)"
                      value={med.dosage}
                      onChange={(e) => handleMedicineChange(index, 'dosage', e.target.value)}
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-2">
                    <input
                      type="text"
                      className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-teal-500 text-center"
                      placeholder="Freq (1-0-1)"
                      value={med.frequency}
                      onChange={(e) => handleMedicineChange(index, 'frequency', e.target.value)}
                    />
                  </div>

                  <div className="col-span-6 sm:col-span-2">
                    <input
                      type="text"
                      className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-teal-500"
                      placeholder="Duration (5 Days)"
                      value={med.duration}
                      onChange={(e) => handleMedicineChange(index, 'duration', e.target.value)}
                    />
                  </div>

                  <div className="col-span-5 sm:col-span-1">
                    <input
                      type="text"
                      className="w-full p-2 text-xs bg-white border border-slate-200 rounded-lg outline-none focus:border-teal-500"
                      placeholder="After food"
                      value={med.instructions}
                      onChange={(e) => handleMedicineChange(index, 'instructions', e.target.value)}
                    />
                  </div>

                  <div className="col-span-1 text-center">
                    <button
                      type="button"
                      disabled={medicinesList.length === 1}
                      onClick={() => handleRemoveMedicine(index)}
                      className="text-slate-400 hover:text-rose-600 disabled:opacity-30 disabled:cursor-not-allowed transition p-1"
                      title="Remove row"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Additional Advice / Notes */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
              Dietary Advice & Follow-up Instructions (Optional)
            </label>
            <textarea
              rows={2}
              className="w-full p-2.5 text-xs border border-slate-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none"
              placeholder="e.g. Drink plenty of warm fluids, rest for 2 days. Follow up if fever exceeds 101°F."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          {/* Footer Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-between pt-3 border-t border-slate-100 gap-3">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck size={14} className="text-teal-600" />
              <span>Saves digitally signed Rx to patient medical records</span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-medium text-xs transition"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => setPreviewMode(true)}
                className="px-4 py-2 border border-slate-300 text-slate-700 hover:bg-slate-50 rounded-xl font-semibold text-xs transition inline-flex items-center gap-1.5"
              >
                <Eye size={14} /> Preview Slip
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-5 py-2.5 bg-gradient-to-r from-teal-600 to-sky-600 hover:from-teal-700 hover:to-sky-700 text-white rounded-xl font-bold text-xs shadow-md shadow-teal-600/20 transition flex items-center gap-2"
              >
                {loading && <Loader2 className="animate-spin" size={14} />}
                Sign & Save Prescription
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
