import { useState } from 'react';
import { Copy, ChevronDown, ChevronUp } from 'lucide-react';
import type { Database } from '../lib/database.types';

type Prediction = Database['public']['Tables']['predictions']['Row'];

interface PredictionCardProps {
  prediction: Prediction;
  isUnlocked: boolean;
  onUnlock: () => void;
}

export function PredictionCard({ prediction, isUnlocked, onUnlock }: PredictionCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopyBookingCode = async (code: string) => {
    await navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    if (navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const renderConfidenceStars = (rating: number) => {
    return (
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <div
            key={i}
            className={`w-2 h-2 rounded-full ${
              i < rating ? 'bg-signal-success' : 'bg-border-subtle'
            }`}
          />
        ))}
      </div>
    );
  };

  const formatKickoffTime = (time: string) => {
    const date = new Date(time);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const isPremiumLocked = prediction.is_premium && !isUnlocked;

  return (
    <div className="bg-surface-glass backdrop-blur-glass border border-border-subtle rounded-lg overflow-hidden transition-all duration-300 hover:border-accent-primary/30">
      <div
        className="p-4 cursor-pointer"
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex justify-between items-start mb-3">
          <div className="flex items-center gap-2">
            <span className="text-text-secondary text-sm">{prediction.league}</span>
            <span className="text-text-secondary text-sm font-mono">
              {formatKickoffTime(prediction.kickoff_time)}
            </span>
          </div>
          {renderConfidenceStars(prediction.confidence_rating)}
        </div>

        <div className="mb-4">
          <div className="text-center">
            <div className="text-lg font-display font-bold mb-1">
              {prediction.home_team}
            </div>
            <div className="text-text-secondary text-sm mb-1">vs</div>
            <div className="text-lg font-display font-bold">
              {prediction.away_team}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-4">
          <div
            className={`flex-1 px-4 py-2 rounded-full text-center text-sm font-medium transition-all ${
              isPremiumLocked
                ? 'bg-border-subtle text-text-secondary blur-sm select-none'
                : 'bg-accent-primary/20 text-accent-primary'
            }`}
          >
            {isPremiumLocked ? 'Premium Tip' : prediction.bet_type}
          </div>

          <div
            className={`font-mono text-lg font-medium ${
              isPremiumLocked ? 'blur-sm' : 'text-text-primary'
            }`}
          >
            @ {prediction.odds.toFixed(2)}
          </div>

          {!isPremiumLocked && Object.keys(prediction.booking_codes).length > 0 && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                const firstCode = Object.values(prediction.booking_codes)[0];
                handleCopyBookingCode(firstCode);
              }}
              className="p-2 bg-accent-primary/20 rounded-lg hover:bg-accent-primary/30 transition-colors"
            >
              <Copy className={`w-4 h-4 ${copied ? 'text-signal-success' : 'text-accent-primary'}`} />
            </button>
          )}

          {isPremiumLocked && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onUnlock();
              }}
              className="px-4 py-2 bg-accent-primary rounded-lg text-sm font-medium hover:bg-accent-primary/80 transition-colors"
            >
              Unlock
            </button>
          )}
        </div>

        {prediction.status !== 'pending' && (
          <div className="mt-3 pt-3 border-t border-border-subtle">
            <div
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium ${
                prediction.status === 'won'
                  ? 'bg-signal-success/20 text-signal-success'
                  : prediction.status === 'lost'
                  ? 'bg-signal-danger/20 text-signal-danger'
                  : 'bg-border-subtle text-text-secondary'
              }`}
            >
              {prediction.status === 'won' && '✓'}
              {prediction.status === 'lost' && '✗'}
              {prediction.status.toUpperCase()}
            </div>
          </div>
        )}

        <div className="flex justify-center mt-2">
          {isExpanded ? (
            <ChevronUp className="w-5 h-5 text-text-secondary" />
          ) : (
            <ChevronDown className="w-5 h-5 text-text-secondary" />
          )}
        </div>
      </div>

      {isExpanded && !isPremiumLocked && prediction.analysis && (
        <div className="px-4 pb-4 border-t border-border-subtle">
          <div className="pt-4">
            <h4 className="text-sm font-display font-bold mb-2">Analysis</h4>
            <p className="text-sm text-text-secondary leading-relaxed">
              {prediction.analysis}
            </p>
          </div>

          {Object.keys(prediction.booking_codes).length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-display font-bold mb-2">Booking Codes</h4>
              <div className="space-y-2">
                {Object.entries(prediction.booking_codes).map(([bookmaker, code]) => (
                  <div
                    key={bookmaker}
                    className="flex justify-between items-center p-2 bg-bg-core rounded-lg"
                  >
                    <span className="text-sm text-text-secondary">{bookmaker}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-mono text-text-primary">{code}</span>
                      <button
                        onClick={() => handleCopyBookingCode(code)}
                        className="p-1 hover:bg-surface-glass rounded transition-colors"
                      >
                        <Copy className="w-3 h-3 text-text-secondary" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {isExpanded && isPremiumLocked && (
        <div className="px-4 pb-4 border-t border-border-subtle">
          <div className="pt-4 text-center">
            <p className="text-sm text-text-secondary mb-4">
              Unlock premium content to view detailed analysis and booking codes
            </p>
            <button
              onClick={onUnlock}
              className="px-6 py-3 bg-accent-primary rounded-lg font-medium hover:bg-accent-primary/80 transition-colors"
            >
              Subscribe Now
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
