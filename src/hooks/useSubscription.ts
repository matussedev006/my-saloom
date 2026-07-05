import { useState, useEffect } from 'react';
import { supabase } from '../supabaseClient';

export function useSubscription(salonId: string) {
  const [isAccessAllowed, setIsAccessAllowed] = useState(true);
  const [status, setStatus] = useState<'trial' | 'active' | 'expired'>('trial');
  const [daysRemaining, setDaysRemaining] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function checkSubscription() {
      try {
        const { data, error } = await supabase
          .from('salons')
          .select('subscription_status, trial_ends_at')
          .eq('id', salonId)
          .single();

        if (error) throw error;

        if (data) {
          const now = new Date();
          const trialEnd = new Date(data.trial_ends_at);
          const currentStatus = data.subscription_status;

          // Calcular dias restantes de trial
          const diffTime = trialEnd.getTime() - now.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          
          if (currentStatus === 'active') {
            setStatus('active');
            setIsAccessAllowed(true);
          } else if (currentStatus === 'trial' && diffDays > 0) {
            setStatus('trial');
            setDaysRemaining(diffDays);
            setIsAccessAllowed(true);
          } else {
            setStatus('expired');
            setIsAccessAllowed(false);
          }
        }
      } catch (err) {
        console.error('Erro ao verificar subscrição:', err);
      } finally {
        setLoading(false);
      }
    }

    if (salonId) checkSubscription();
  }, [salonId]);

  return { isAccessAllowed, status, daysRemaining, loading };
}