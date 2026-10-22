'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Video, FileText } from 'lucide-react';
import PrescriptionModal from './PrescriptionModal';
import AppointmentCancelButton from './AppointmentCancelButton';

export default function DoctorActions({ appointmentId, status }: { appointmentId: string, status: string }) {
  const [showPrescriptionModal, setShowPrescriptionModal] = useState(false);

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {status === 'scheduled' && (
        <>
          <Link 
            href={`/room/${appointmentId}`}
            className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition font-medium"
          >
            <Video size={18} /> Join Call
          </Link>
          <AppointmentCancelButton appointmentId={appointmentId} />
        </>
      )}
      
      <button
        onClick={() => setShowPrescriptionModal(true)}
        className="flex items-center justify-center gap-2 px-4 py-2 border border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
      >
        <FileText size={18} /> Prescription
      </button>

      {showPrescriptionModal && (
        <PrescriptionModal 
          appointmentId={appointmentId} 
          onClose={() => setShowPrescriptionModal(false)} 
        />
      )}
    </div>
  );
}
