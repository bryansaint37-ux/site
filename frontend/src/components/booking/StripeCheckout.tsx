'use client';

import { useState } from 'react';
import { CardElement, Elements, useElements, useStripe } from '@stripe/react-stripe-js';
import { loadStripe } from '@stripe/stripe-js';
import { Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import toast from 'react-hot-toast';
import api from '@/lib/api';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

function StripeForm({ bookingId, onSuccess }: { bookingId: string; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const pay = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    try {
      const { data } = await api.post('/payments/stripe/intent', { booking_id: bookingId });
      const r = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: elements.getElement(CardElement)! },
      });
      if (r.error) throw new Error(r.error.message);
      if (r.paymentIntent?.status === 'succeeded') onSuccess();
    } catch (e: any) {
      toast.error(e.message || 'Paiement échoué');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border border-[#E5E7EB] rounded-xl p-4 bg-[#F9FAFB]">
        <CardElement options={{ style: { base: { fontSize: '15px', color: '#111827', fontFamily: 'Inter, sans-serif', '::placeholder': { color: '#9CA3AF' } } } }} />
      </div>
      <motion.button onClick={pay} disabled={loading} whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.98 }} className="btn btn-gold btn-lg w-full">
        <Lock className="w-4 h-4" />
        {loading ? 'Traitement en cours…' : 'Payer par carte'}
      </motion.button>
    </div>
  );
}

export default function StripeCheckout({ bookingId, onSuccess }: { bookingId: string; onSuccess: () => void }) {
  return (
    <Elements stripe={stripePromise}>
      <StripeForm bookingId={bookingId} onSuccess={onSuccess} />
    </Elements>
  );
}
