import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { PredictionCard } from '../components/PredictionCard';
import { TransparencyDashboard } from '../components/TransparencyDashboard';
import { SubscriptionModal } from '../components/SubscriptionModal';
import { useAuth } from '../hooks/useAuth';
import { initializePayment, getPlanPrice } from '../lib/paystack';
import type { Database } from '../lib/database.types';
import { Filter } from 'lucide-react';

type Prediction = Database['public']['Tables']['predictions']['Row'];

export function Home() {
  const { user, isSubscribed } = useAuth();
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [filter, setFilter] = useState<'all' | 'free' | 'premium'>('all');

  useEffect(() => {
    fetchPredictions();

    const subscription = supabase
      .channel('predictions-updates')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'predictions' },
        () => {
          fetchPredictions();
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const fetchPredictions = async () => {
    const { data } = await supabase
      .from('predictions')
      .select('*')
      .gte('kickoff_time', new Date().toISOString())
      .order('confidence_rating', { ascending: false })
      .order('kickoff_time', { ascending: true });

    if (data) {
      setPredictions(data);
    }
  };

  const handleSubscribe = async (plan: 'daily' | 'weekly' | 'monthly') => {
    if (!user) {
      alert('Please sign in to subscribe');
      return;
    }

    const amount = getPlanPrice(plan);

    await initializePayment({
      email: user.email!,
      amount,
      currency: 'GHS',
      subscriptionType: plan,
      userId: user.id,
    });

    setShowSubscriptionModal(false);
  };

  const filteredPredictions = predictions.filter((prediction) => {
    if (filter === 'free') return !prediction.is_premium;
    if (filter === 'premium') return prediction.is_premium;
    return true;
  });

  return (
    <div className="min-h-screen">
      <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Akorapa
          </h1>
          <p className="text-xl text-text-secondary">
            Professional Sports Intelligence Platform
          </p>
        </header>

        <TransparencyDashboard />

        <div className="bg-surface-glass backdrop-blur-glass border border-border-subtle rounded-lg p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-display font-bold">Today's Predictions</h2>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-text-secondary" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as 'all' | 'free' | 'premium')}
                className="px-4 py-2 bg-bg-core border border-border-subtle rounded-lg focus:outline-none focus:border-accent-primary"
              >
                <option value="all">All Tips</option>
                <option value="free">Free Tips</option>
                <option value="premium">Premium Tips</option>
              </select>
            </div>
          </div>

          <div className="space-y-4">
            {filteredPredictions.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-text-secondary">No predictions available</p>
              </div>
            ) : (
              filteredPredictions.map((prediction) => (
                <PredictionCard
                  key={prediction.id}
                  prediction={prediction}
                  isUnlocked={!prediction.is_premium || isSubscribed}
                  onUnlock={() => setShowSubscriptionModal(true)}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        onSubscribe={handleSubscribe}
      />
    </div>
  );
}
