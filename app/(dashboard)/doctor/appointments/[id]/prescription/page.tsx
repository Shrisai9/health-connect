import { createClient } from '@/lib/supabase/server';
import { submitPrescription } from '@/app/actions/prescriptions';
import { redirect } from 'next/navigation';
import { FileText, Save } from 'lucide-react';

export default async function PrescriptionPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch appointment details to verify ownership
  const { data: appointment } = await supabase
    .from('appointments')
    .select('*, profiles:patient_id(full_name)')
    .eq('id', params.id)
    .single();

  if (!appointment) return <div>Appointment not found</div>;

  return (
    <div className="max-w-3xl mx-auto p-8 bg-gray-50 min-h-screen">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200">
        <div className="flex items-center gap-3 mb-6 border-b pb-4">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <FileText size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Write Prescription</h1>
            <p className="text-gray-500">Patient: {appointment.profiles.full_name}</p>
          </div>
        </div>

        <form action={submitPrescription} className="space-y-6">
          <input type="hidden" name="appointment_id" value={appointment.id} />
          <input type="hidden" name="patient_id" value={appointment.patient_id} />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Diagnosis</label>
            <input 
              name="diagnosis"
              type="text" 
              required
              placeholder="e.g. Acute Bronchitis"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Medicines & Dosage</label>
            <textarea 
              name="medicines"
              required
              rows={4}
              placeholder="e.g. Amoxicillin 500mg - 1 tablet every 8 hours for 5 days"
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Additional Notes</label>
            <textarea 
              name="notes"
              rows={3}
              placeholder="Advice on diet, rest, or follow-up."
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>

          <div className="pt-4">
            <button 
              type="submit" 
              className="w-full flex items-center justify-center gap-2 bg-blue-600 text-white py-3 rounded-lg font-medium hover:bg-blue-700 transition"
            >
              <Save size={18} /> Encrypt & Save Prescription
            </button>
            <p className="text-xs text-center text-gray-400 mt-3">
              Data is encrypted with AES-256 before storage. Only you and the patient can read this.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
