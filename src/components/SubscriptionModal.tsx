import { X } from 'lucide-react';

interface SubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubscribe: (plan: 'daily' | 'weekly' | 'monthly') => void;
}

const plans = [
  {
    id: 'daily' as const,
    name: 'Daily Pass',
    price: 'GHS 5',
    duration: '24 Hours',
    features: ['All Premium Tips', 'Booking Codes', 'Detailed Analysis', 'Valid for 1 Day'],
  },
  {
    id: 'weekly' as const,
    name: 'Weekly Access',
    price: 'GHS 20',
    duration: '7 Days',
    features: ['All Premium Tips', 'Booking Codes', 'Detailed Analysis', 'Priority Support', 'Valid for 7 Days'],
    popular: true,
  },
  {
    id: 'monthly' as const,
    name: 'Monthly Pro',
    price: 'GHS 50',
    duration: '30 Days',
    features: ['All Premium Tips', 'Booking Codes', 'Detailed Analysis', 'Priority Support', 'Performance Reports', 'Valid for 30 Days'],
  },
];

export function SubscriptionModal({ isOpen, onClose, onSubscribe }: SubscriptionModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <div className="relative w-full max-w-4xl bg-surface-glass backdrop-blur-glass border border-border-subtle rounded-xl overflow-hidden">
        <div className="flex justify-between items-center p-6 border-b border-border-subtle">
          <h2 className="text-2xl font-display font-bold">Choose Your Plan</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-border-subtle rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`relative p-6 rounded-lg border-2 transition-all hover:scale-105 ${
                  plan.popular
                    ? 'border-accent-primary bg-accent-primary/10'
                    : 'border-border-subtle bg-bg-core'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-accent-primary rounded-full text-xs font-bold">
                    POPULAR
                  </div>
                )}

                <div className="text-center mb-4">
                  <h3 className="text-lg font-display font-bold mb-2">{plan.name}</h3>
                  <div className="text-3xl font-mono font-bold text-accent-primary mb-1">
                    {plan.price}
                  </div>
                  <div className="text-sm text-text-secondary">{plan.duration}</div>
                </div>

                <ul className="space-y-3 mb-6">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <span className="text-signal-success mt-0.5">✓</span>
                      <span className="text-text-secondary">{feature}</span>
                    </li>
                  ))}
                </ul>

                <button
                  onClick={() => onSubscribe(plan.id)}
                  className={`w-full py-3 rounded-lg font-medium transition-colors ${
                    plan.popular
                      ? 'bg-accent-primary hover:bg-accent-primary/80'
                      : 'bg-border-subtle hover:bg-border-subtle/80'
                  }`}
                >
                  Subscribe Now
                </button>
              </div>
            ))}
          </div>

          <div className="mt-6 p-4 bg-bg-core rounded-lg border border-border-subtle">
            <p className="text-sm text-text-secondary text-center">
              Secure payment powered by Paystack. Supports Mobile Money, Cards, and Bank Transfer.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
