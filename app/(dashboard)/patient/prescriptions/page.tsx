import { createClient } from '@/lib/supabase/server';
import { decryptData } from '@/lib/encryption';
import { redirect } from 'next/navigation';
import { FileText, Calendar, User } from 'lucide-react';

export default async function PatientPrescriptions() {
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/login');

  // Fetch prescriptions
  const { data: prescriptions } = await supabase
    .from('prescriptions')
    .select(`
      id,
      created_at,
      encrypted_data,
      iv,
      doctors:doctor_id (
        profiles:id (full_name)
      )
    `)
    .eq('patient_id', user.id)
    .order('created_at', { ascending: false });

  return (
    <div className="p-8 space-y-8 bg-gray-50 min-h-screen">
      <header>
        <h1 className="text-3xl font-bold text-gray-900">My Medical Records</h1>
        <p className="text-gray-500">Securely decrypted history of your prescriptions.</p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {prescriptions && prescriptions.length > 0 ? (
          prescriptions.map((script: any) => {
            // Decrypt Data
            let decrypted = { diagnosis: "Error", medicines: "", notes: "" };
            try {
              // Split the stored format "DATA:TAG"
              const [data, authTag] = script.encrypted_data.split(':');
              if (data && authTag) {
                const jsonString = decryptData(data, script.iv, authTag);
                decrypted = JSON.parse(jsonString);
              }
            } catch (e) {
              console.error("Decryption failed", e);
              decrypted.diagnosis = "Decryption Failed (Invalid Key)";
            }

            return (
              <div key={script.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 flex flex-col">
                <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                  <div className="flex items-center gap-2 text-gray-900 font-medium">
                    <User size={18} className="text-blue-600" />
                    Dr. {script.doctors.profiles.full_name}
                  </div>
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar size={12} />
                    {new Date(script.created_at).toLocaleDateString()}
                  </div>
                </div>

                <div className="space-y-4 flex-1">
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Diagnosis</p>
                    <p className="text-lg font-semibold text-gray-800">{decrypted.diagnosis}</p>
                  </div>
                  
                  <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Medicines</p>
                    <p className="text-sm text-gray-600 whitespace-pre-wrap bg-gray-50 p-3 rounded-md mt-1">
                      {decrypted.medicines}
                    </p>
                  </div>

                  {decrypted.notes && (
                    <div>
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Notes</p>
                      <p className="text-sm text-gray-500 italic">{decrypted.notes}</p>
                    </div>
                  )}
                </div>
                
                <div className="mt-6 pt-4 border-t border-gray-100 flex items-center gap-2 text-green-600 text-xs font-medium">
                  <FileText size={14} />
                  End-to-End Encrypted
                </div>
              </div>
            );
          })
        ) : (
          <div className="col-span-full text-center py-12 text-gray-500 bg-white rounded-xl border border-dashed">
            No prescriptions found.
          </div>
        )}
      </div>
    </div>
  );
}
