import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { Check, X, Ban } from 'lucide-react';

type Prediction = Database['public']['Tables']['predictions']['Row'];

export function ResultResolution() {
  const [pendingPredictions, setPendingPredictions] = useState<Prediction[]>([]);

  useEffect(() => {
    fetchPendingPredictions();
  }, []);

  const fetchPendingPredictions = async () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    yesterday.setHours(0, 0, 0, 0);

    const { data } = await supabase
      .from('predictions')
      .select('*')
      .eq('status', 'pending')
      .lt('kickoff_time', new Date().toISOString())
      .order('kickoff_time', { ascending: false });

    if (data) {
      setPendingPredictions(data);
    }
  };

  const handleResolve = async (predictionId: string, status: 'won' | 'lost' | 'void') => {
    const { error } = await supabase
      .from('predictions')
      .update({
        status,
        resolved_at: new Date().toISOString(),
      })
      .eq('id', predictionId);

    if (!error) {
      setPendingPredictions(pendingPredictions.filter((p) => p.id !== predictionId));
    }
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-display font-bold mb-2">Result Resolution</h1>
          <p className="text-text-secondary">
            Resolve pending predictions from previous matches
          </p>
        </div>

        {pendingPredictions.length === 0 ? (
          <div className="text-center py-12 bg-surface-glass backdrop-blur-glass border border-border-subtle rounded-lg">
            <p className="text-text-secondary">No pending predictions to resolve</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingPredictions.map((prediction) => (
              <div
                key={prediction.id}
                className="p-6 bg-surface-glass backdrop-blur-glass border border-border-subtle rounded-lg"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className="px-3 py-1 bg-bg-core rounded-full text-xs font-medium text-text-secondary">
                        {prediction.league}
                      </span>
                      <span className="text-sm text-text-secondary font-mono">
                        {new Date(prediction.kickoff_time).toLocaleString()}
                      </span>
                    </div>

                    <div className="text-lg font-display font-bold mb-3">
                      {prediction.home_team} vs {prediction.away_team}
                    </div>

                    <div className="flex items-center gap-4 text-sm">
                      <span className="px-3 py-1 bg-accent-primary/20 text-accent-primary rounded-full">
                        {prediction.bet_type}
                      </span>
                      <span className="font-mono text-text-primary">
                        @ {prediction.odds.toFixed(2)}
                      </span>
                      <span className="text-text-secondary">
                        Confidence: {prediction.confidence_rating}/5
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleResolve(prediction.id, 'won')}
                      className="flex items-center gap-2 px-6 py-3 bg-signal-success/20 text-signal-success rounded-lg hover:bg-signal-success/30 transition-colors"
                      title="Mark as Won"
                    >
                      <Check className="w-5 h-5" />
                      <span className="font-medium">Won</span>
                    </button>

                    <button
                      onClick={() => handleResolve(prediction.id, 'lost')}
                      className="flex items-center gap-2 px-6 py-3 bg-signal-danger/20 text-signal-danger rounded-lg hover:bg-signal-danger/30 transition-colors"
                      title="Mark as Lost"
                    >
                      <X className="w-5 h-5" />
                      <span className="font-medium">Lost</span>
                    </button>

                    <button
                      onClick={() => handleResolve(prediction.id, 'void')}
                      className="flex items-center gap-2 px-6 py-3 bg-border-subtle text-text-secondary rounded-lg hover:bg-border-subtle/80 transition-colors"
                      title="Mark as Void"
                    >
                      <Ban className="w-5 h-5" />
                      <span className="font-medium">Void</span>
                    </button>
                  </div>
                </div>

                {prediction.analysis && (
                  <div className="mt-4 pt-4 border-t border-border-subtle">
                    <p className="text-sm text-text-secondary">{prediction.analysis}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
