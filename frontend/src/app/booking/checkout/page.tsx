'use client';
import { useState } from 'react';
import { useCartStore } from '@/store/cartStore';
import { useAuthStore } from '@/store/authStore';
import { useMutation } from '@tanstack/react-query';
import api from '@/lib/api';
import Navbar from '@/components/ui/Navbar';
import { CreditCard, Smartphone, Wallet, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!);

type PaymentMethod = 'stripe' | 'paypal' | 'mobile_money';

function StripeForm({ bookingId, onSuccess }: { bookingId: string; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handlePay = async () => {
    if (!stripe || !elements) return;
    setLoading(true);
    try {
      const { data } = await api.post('/payments/stripe/intent', { booking_id: bookingId });
      const result = await stripe.confirmCardPayment(data.clientSecret, {
        payment_method: { card: elements.getElement(CardElement)! },
      });
      if (result.error) throw new Error(result.error.message);
      if (result.paymentIntent?.status === 'succeeded') onSuccess();
    } catch (err: any) {
      toast.error(err.message || 'Payment failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="border border-gray-300 rounded-lg p-4">
        <CardElement options={{ style: { base: { fontSize: '16px', color: '#374151' } } }} />
      </div>
      <button onClick={handlePay} disabled={loading} className="w-full btn-primary py-3 flex items-center justify-center gap-2">
        <Lock className="w-4 h-4" />
        {loading ? 'Processing...' : 'Pay with Card'}
      </button>
    </div>
  );
}

export default function CheckoutPage() {
  const { items, total, clearCart } = useCartStore();
  const { user } = useAuthStore();
  const router = useRouter();
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('stripe');
  const [mobilePhone, setMobilePhone] = useState('');
  const [mobileProvider, setMobileProvider] = useState('mtn');
  const [bookingId, setBookingId] = useState<string | null>(null);

  const createBookingMutation = useMutation({
    mutationFn: () => api.post('/bookings', {
      items: items.map(i => ({ ticket_category_id: i.ticket_category_id, quantity: i.quantity })),
    }),
    onSuccess: (res) => setBookingId(res.data.data.id),
    onError: (err: any) => toast.error(err.response?.data?.message || 'Failed to create booking'),
  });

  const paypalMutation = useMutation({
    mutationFn: () => api.post('/payments/paypal/order', { booking_id: bookingId }),
    onSuccess: (res) => { window.location.href = res.data.approvalUrl; },
    onError: () => toast.error('Failed to initiate PayPal'),
  });

  const mobileMutation = useMutation({
    mutationFn: () => api.post('/payments/mobile-money/initiate', {
      booking_id: bookingId, phone_number: mobilePhone, provider: mobileProvider,
    }),
    onSuccess: () => {
      toast.success('Payment request sent. Check your phone to approve.');
      setTimeout(() => router.push(`/booking/success?booking=${bookingId}`), 4000);
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Mobile money failed'),
  });

  const handleCreateBooking = () => createBookingMutation.mutate();

  const handlePaymentSuccess = () => {
    clearCart();
    router.push(`/booking/success?booking=${bookingId}`);
  };

  if (items.length === 0) {
    router.push('/booking/cart');
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-black mb-6">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left: Payment */}
          <div className="lg:col-span-2 space-y-6">
            {/* Step 1: Confirm booking */}
            {!bookingId && (
              <div className="card">
                <h2 className="font-bold text-lg mb-4">Step 1: Confirm Your Order</h2>
                <p className="text-sm text-gray-600 mb-4">Review your selections and confirm to proceed to payment.</p>
                <button
                  onClick={handleCreateBooking}
                  disabled={createBookingMutation.isPending}
                  className="btn-primary w-full py-3"
                >
                  {createBookingMutation.isPending ? 'Confirming...' : 'Confirm & Proceed to Payment'}
                </button>
              </div>
            )}

            {/* Step 2: Payment method */}
            {bookingId && (
              <div className="card">
                <h2 className="font-bold text-lg mb-4">Step 2: Select Payment Method</h2>
                <div className="grid grid-cols-3 gap-3 mb-6">
                  {([
                    { id: 'stripe', label: 'Credit Card', icon: CreditCard },
                    { id: 'paypal', label: 'PayPal', icon: Wallet },
                    { id: 'mobile_money', label: 'Mobile Money', icon: Smartphone },
                  ] as const).map(({ id, label, icon: Icon }) => (
                    <button
                      key={id}
                      onClick={() => setPaymentMethod(id)}
                      className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${paymentMethod === id ? 'border-primary-600 bg-primary-50' : 'border-gray-200 hover:border-gray-300'}`}
                    >
                      <Icon className={`w-6 h-6 ${paymentMethod === id ? 'text-primary-600' : 'text-gray-500'}`} />
                      <span className={`text-sm font-medium ${paymentMethod === id ? 'text-primary-700' : 'text-gray-700'}`}>{label}</span>
                    </button>
                  ))}
                </div>

                {paymentMethod === 'stripe' && (
                  <Elements stripe={stripePromise}>
                    <StripeForm bookingId={bookingId} onSuccess={handlePaymentSuccess} />
                  </Elements>
                )}

                {paymentMethod === 'paypal' && (
                  <button
                    onClick={() => paypalMutation.mutate()}
                    disabled={paypalMutation.isPending}
                    className="w-full bg-yellow-400 hover:bg-yellow-300 text-gray-900 font-bold py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Wallet className="w-5 h-5" />
                    {paypalMutation.isPending ? 'Redirecting...' : 'Pay with PayPal'}
                  </button>
                )}

                {paymentMethod === 'mobile_money' && (
                  <div className="space-y-4">
                    <select className="input" value={mobileProvider} onChange={e => setMobileProvider(e.target.value)}>
                      <option value="mtn">MTN Mobile Money</option>
                      <option value="airtel">Airtel Money</option>
                      <option value="mpesa">M-Pesa</option>
                      <option value="orange">Orange Money</option>
                    </select>
                    <input
                      type="tel" placeholder="+1234567890" className="input"
                      value={mobilePhone} onChange={e => setMobilePhone(e.target.value)}
                    />
                    <button
                      onClick={() => mobileMutation.mutate()}
                      disabled={mobileMutation.isPending || !mobilePhone}
                      className="w-full btn-primary py-3 flex items-center justify-center gap-2"
                    >
                      <Smartphone className="w-5 h-5" />
                      {mobileMutation.isPending ? 'Sending Request...' : 'Send Payment Request'}
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Right: Summary */}
          <div className="card h-fit">
            <h3 className="font-bold mb-4">Order Summary</h3>
            <div className="space-y-3 mb-4">
              {items.map(item => (
                <div key={item.ticket_category_id} className="text-sm">
                  <p className="font-medium">{item.home_team} vs {item.away_team}</p>
                  <p className="text-gray-500">{item.category_name} ×{item.quantity}</p>
                  <p className="text-primary-600 font-semibold">${(item.price * item.quantity).toLocaleString()}</p>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-200 pt-4 flex justify-between font-bold">
              <span>Total</span>
              <span className="text-primary-600">${total().toLocaleString()}</span>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-gray-500">
              <Lock className="w-3 h-3" /> Secured by 256-bit SSL encryption
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
