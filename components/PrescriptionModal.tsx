'use client';

import { useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { X, FileText, Loader2 } from 'lucide-react';

export default function PrescriptionModal({ appointmentId, onClose }: { appointmentId: string, onClose: () => void }) {
  const [medicines, setMedicines] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      alert('You must be logged in to save a prescription.');
      setLoading(false);
      return;
    }

    // Fetch patient_id from the appointment to ensure data integrity
    const { data: appointment } = await supabase
      .from('appointments')
      .select('patient_id')
      .eq('id', appointmentId)
      .single();

    const { error } = await supabase
      .from('prescriptions')
      .insert({
        appointment_id: appointmentId,
        doctor_id: user.id,
        patient_id: appointment?.patient_id,
        medicines,
        notes,
        encrypted_data: 'N/A' // Placeholder to satisfy the database constraint
      });

    if (error) {
      alert('Failed to save prescription: ' + error.message);
    } else {
      // Optionally mark appointment as completed
      await supabase.from('appointments').update({ status: 'completed' }).eq('id', appointmentId);
      onClose();
      window.location.reload();
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 shadow-xl">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <FileText className="text-blue-600" /> Write Prescription
          </h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Medicines</label>
            <textarea
              required
              rows={4}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="e.g. Paracetamol 500mg - 1 tab after food (3 days)"
              value={medicines}
              onChange={(e) => setMedicines(e.target.value)}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              rows={2}
              className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              placeholder="Additional instructions..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Cancel</button>
            <button type="submit" disabled={loading} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium flex items-center gap-2">{loading && <Loader2 className="animate-spin" size={16} />} Save Prescription</button>
          </div>
        </form>
      </div>
    </div>
  );
}