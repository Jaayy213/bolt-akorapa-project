import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';
import { Calendar, Plus } from 'lucide-react';

type Prediction = Database['public']['Tables']['predictions']['Row'];
type PredictionInsert = Database['public']['Tables']['predictions']['Insert'];

export function AdminDashboard() {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<PredictionInsert>>({
    league: '',
    home_team: '',
    away_team: '',
    bet_type: '',
    odds: 1.5,
    confidence_rating: 3,
    booking_codes: {},
    is_premium: false,
    kickoff_time: '',
    analysis: '',
  });

  useEffect(() => {
    fetchPredictions();
  }, []);

  const fetchPredictions = async () => {
    const { data } = await supabase
      .from('predictions')
      .select('*')
      .order('kickoff_time', { ascending: false })
      .limit(20);

    if (data) {
      setPredictions(data);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const { error } = await supabase.from('predictions').insert({
      league: formData.league!,
      home_team: formData.home_team!,
      away_team: formData.away_team!,
      bet_type: formData.bet_type!,
      odds: formData.odds!,
      confidence_rating: formData.confidence_rating!,
      booking_codes: formData.booking_codes || {},
      is_premium: formData.is_premium || false,
      kickoff_time: formData.kickoff_time!,
      analysis: formData.analysis || null,
    });

    if (!error) {
      setShowForm(false);
      setFormData({
        league: '',
        home_team: '',
        away_team: '',
        bet_type: '',
        odds: 1.5,
        confidence_rating: 3,
        booking_codes: {},
        is_premium: false,
        kickoff_time: '',
        analysis: '',
      });
      fetchPredictions();
    }
  };

  const handleBookingCodeChange = (bookmaker: string, code: string) => {
    setFormData({
      ...formData,
      booking_codes: {
        ...(formData.booking_codes || {}),
        [bookmaker]: code,
      },
    });
  };

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-display font-bold">Admin Control Panel</h1>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 px-6 py-3 bg-accent-primary rounded-lg hover:bg-accent-primary/80 transition-colors"
          >
            <Plus className="w-5 h-5" />
            New Prediction
          </button>
        </div>

        {showForm && (
          <div className="mb-8 p-6 bg-surface-glass backdrop-blur-glass border border-border-subtle rounded-lg">
            <h2 className="text-xl font-display font-bold mb-6">Create Prediction</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">League</label>
                  <input
                    type="text"
                    value={formData.league}
                    onChange={(e) => setFormData({ ...formData, league: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-core border border-border-subtle rounded-lg focus:outline-none focus:border-accent-primary"
                    placeholder="e.g., Premier League"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Kickoff Time</label>
                  <div className="relative">
                    <input
                      type="datetime-local"
                      value={formData.kickoff_time}
                      onChange={(e) => setFormData({ ...formData, kickoff_time: e.target.value })}
                      className="w-full px-4 py-2 bg-bg-core border border-border-subtle rounded-lg focus:outline-none focus:border-accent-primary"
                      required
                    />
                    <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-secondary pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Home Team</label>
                  <input
                    type="text"
                    value={formData.home_team}
                    onChange={(e) => setFormData({ ...formData, home_team: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-core border border-border-subtle rounded-lg focus:outline-none focus:border-accent-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Away Team</label>
                  <input
                    type="text"
                    value={formData.away_team}
                    onChange={(e) => setFormData({ ...formData, away_team: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-core border border-border-subtle rounded-lg focus:outline-none focus:border-accent-primary"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Bet Type / Tip</label>
                  <input
                    type="text"
                    value={formData.bet_type}
                    onChange={(e) => setFormData({ ...formData, bet_type: e.target.value })}
                    className="w-full px-4 py-2 bg-bg-core border border-border-subtle rounded-lg focus:outline-none focus:border-accent-primary"
                    placeholder="e.g., Over 2.5 Goals"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">Odds</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.odds}
                    onChange={(e) => setFormData({ ...formData, odds: parseFloat(e.target.value) })}
                    className="w-full px-4 py-2 bg-bg-core border border-border-subtle rounded-lg focus:outline-none focus:border-accent-primary font-mono"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium mb-2">
                    Confidence Rating: {formData.confidence_rating}/5
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="5"
                    value={formData.confidence_rating}
                    onChange={(e) => setFormData({ ...formData, confidence_rating: parseInt(e.target.value) })}
                    className="w-full"
                  />
                </div>

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.is_premium}
                      onChange={(e) => setFormData({ ...formData, is_premium: e.target.checked })}
                      className="w-5 h-5"
                    />
                    <span className="text-sm font-medium">Premium Content</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Booking Codes</label>
                <div className="grid md:grid-cols-2 gap-4">
                  {['Bet9ja', '1xBet', 'SportyBet', 'BetWay'].map((bookmaker) => (
                    <div key={bookmaker}>
                      <input
                        type="text"
                        placeholder={`${bookmaker} code`}
                        value={(formData.booking_codes as Record<string, string>)?.[bookmaker] || ''}
                        onChange={(e) => handleBookingCodeChange(bookmaker, e.target.value)}
                        className="w-full px-4 py-2 bg-bg-core border border-border-subtle rounded-lg focus:outline-none focus:border-accent-primary font-mono text-sm"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Analysis / Reasoning</label>
                <textarea
                  value={formData.analysis}
                  onChange={(e) => setFormData({ ...formData, analysis: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-2 bg-bg-core border border-border-subtle rounded-lg focus:outline-none focus:border-accent-primary resize-none"
                  placeholder="Provide detailed analysis and H2H statistics..."
                />
              </div>

              <div className="flex gap-4">
                <button
                  type="submit"
                  className="px-6 py-3 bg-accent-primary rounded-lg hover:bg-accent-primary/80 transition-colors"
                >
                  Create Prediction
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-6 py-3 bg-border-subtle rounded-lg hover:bg-border-subtle/80 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        <div className="bg-surface-glass backdrop-blur-glass border border-border-subtle rounded-lg">
          <div className="p-6 border-b border-border-subtle">
            <h2 className="text-xl font-display font-bold">Recent Predictions</h2>
          </div>
          <div className="divide-y divide-border-subtle">
            {predictions.map((prediction) => (
              <div key={prediction.id} className="p-4 hover:bg-border-subtle/30 transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium">
                      {prediction.home_team} vs {prediction.away_team}
                    </div>
                    <div className="text-sm text-text-secondary mt-1">
                      {prediction.league} • {prediction.bet_type} @ {prediction.odds}
                    </div>
                  </div>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-medium ${
                      prediction.status === 'pending'
                        ? 'bg-border-subtle text-text-secondary'
                        : prediction.status === 'won'
                        ? 'bg-signal-success/20 text-signal-success'
                        : prediction.status === 'lost'
                        ? 'bg-signal-danger/20 text-signal-danger'
                        : 'bg-border-subtle text-text-secondary'
                    }`}
                  >
                    {prediction.status.toUpperCase()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
