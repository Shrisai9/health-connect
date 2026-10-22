'use client';

import { useState } from 'react';
import { cancelAppointmentAction } from '@/app/actions/appointments';
import { XCircle, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

interface Props {
  appointmentId: string;
  onCancelled?: () => void;
  className?: string;
}

export default function AppointmentCancelButton({ appointmentId, onCancelled, className }: Props) {
  const [cancelling, setCancelling] = useState(false);
  const router = useRouter();

  const handleCancel = async () => {
    const confirmCancel = window.confirm(
      'Are you sure you want to cancel this appointment? This action cannot be undone.'
    );
    if (!confirmCancel) return;

    setCancelling(true);
    try {
      const res = await cancelAppointmentAction(appointmentId);
      if (res.success) {
        if (onCancelled) {
          onCancelled();
        } else {
          router.refresh();
        }
      } else {
        alert(res.message);
      }
    } catch (err: any) {
      alert('Error cancelling appointment: ' + (err.message || 'Unknown error'));
    } finally {
      setCancelling(false);
    }
  };

  return (
    <button
      onClick={handleCancel}
      disabled={cancelling}
      className={
        className ||
        'flex items-center justify-center gap-1.5 px-3 py-2 text-sm font-medium text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 rounded-lg transition disabled:opacity-50'
      }
      title="Cancel this appointment"
    >
      {cancelling ? (
        <>
          <Loader2 size={16} className="animate-spin" />
          <span>Cancelling...</span>
        </>
      ) : (
        <>
          <XCircle size={16} />
          <span>Cancel</span>
        </>
      )}
    </button>
  );
}
