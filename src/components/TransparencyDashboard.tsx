import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { supabase } from '../lib/supabase';
import type { Database } from '../lib/database.types';

type LedgerEntry = Database['public']['Tables']['ledger']['Row'];

interface WinningTip {
  bet_type: string;
  odds: number;
}

export function TransparencyDashboard() {
  const [ledgerData, setLedgerData] = useState<LedgerEntry[]>([]);
  const [recentWins, setRecentWins] = useState<WinningTip[]>([]);
  const [stats, setStats] = useState({
    totalUnits: 0,
    winRate: 0,
    winStreak: 0,
  });

  useEffect(() => {
    fetchLedgerData();
    fetchRecentWins();

    const ledgerSubscription = supabase
      .channel('ledger-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'ledger' },
        () => {
          fetchLedgerData();
        }
      )
      .subscribe();

    const predictionsSubscription = supabase
      .channel('predictions-changes')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'predictions' },
        (payload) => {
          if (payload.new.status === 'won') {
            fetchRecentWins();
          }
        }
      )
      .subscribe();

    return () => {
      ledgerSubscription.unsubscribe();
      predictionsSubscription.unsubscribe();
    };
  }, []);

  const fetchLedgerData = async () => {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const { data, error } = await supabase
      .from('ledger')
      .select('*')
      .gte('date', thirtyDaysAgo.toISOString().split('T')[0])
      .order('date', { ascending: true });

    if (data && !error) {
      setLedgerData(data);

      const totalUnits = data.reduce((sum, entry) => sum + entry.net_units, 0);
      const totalTips = data.reduce((sum, entry) => sum + entry.total_tips, 0);
      const totalWins = data.reduce((sum, entry) => sum + entry.wins, 0);
      const winRate = totalTips > 0 ? (totalWins / totalTips) * 100 : 0;

      let currentStreak = 0;
      for (let i = data.length - 1; i >= 0; i--) {
        if (data[i].net_units > 0) {
          currentStreak++;
        } else if (data[i].net_units < 0) {
          break;
        }
      }

      setStats({
        totalUnits,
        winRate,
        winStreak: currentStreak,
      });
    }
  };

  const fetchRecentWins = async () => {
    const { data, error } = await supabase
      .from('predictions')
      .select('bet_type, odds')
      .eq('status', 'won')
      .order('resolved_at', { ascending: false })
      .limit(10);

    if (data && !error) {
      setRecentWins(data);
    }
  };

  const chartData = ledgerData.map((entry) => ({
    date: new Date(entry.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
    units: parseFloat(entry.net_units.toFixed(2)),
  }));

  let cumulativeUnits = 0;
  const cumulativeChartData = chartData.map((entry) => {
    cumulativeUnits += entry.units;
    return {
      date: entry.date,
      units: parseFloat(cumulativeUnits.toFixed(2)),
    };
  });

  return (
    <div className="space-y-6">
      <div className="bg-surface-glass backdrop-blur-glass border border-border-subtle rounded-lg p-6">
        <h2 className="text-2xl font-display font-bold mb-6">The Ledger</h2>

        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="text-center p-4 bg-bg-core rounded-lg">
            <div className={`text-2xl font-mono font-bold ${stats.totalUnits >= 0 ? 'text-signal-success' : 'text-signal-danger'}`}>
              {stats.totalUnits >= 0 ? '+' : ''}{stats.totalUnits.toFixed(2)}
            </div>
            <div className="text-xs text-text-secondary mt-1">Net Units (30d)</div>
          </div>

          <div className="text-center p-4 bg-bg-core rounded-lg">
            <div className="text-2xl font-mono font-bold text-accent-primary">
              {stats.winRate.toFixed(0)}%
            </div>
            <div className="text-xs text-text-secondary mt-1">Win Rate</div>
          </div>

          <div className="text-center p-4 bg-bg-core rounded-lg">
            <div className="text-2xl font-mono font-bold text-signal-success">
              {stats.winStreak}
            </div>
            <div className="text-xs text-text-secondary mt-1">Win Streak</div>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={cumulativeChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.08)" />
              <XAxis
                dataKey="date"
                stroke="#94A3B8"
                style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}
              />
              <YAxis
                stroke="#94A3B8"
                style={{ fontSize: '12px', fontFamily: 'JetBrains Mono, monospace' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0F1115',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: '8px',
                  fontFamily: 'JetBrains Mono, monospace',
                }}
                labelStyle={{ color: '#F8FAFC' }}
                itemStyle={{ color: '#00FF94' }}
              />
              <Line
                type="monotone"
                dataKey="units"
                stroke="#00FF94"
                strokeWidth={2}
                dot={{ fill: '#00FF94', r: 3 }}
                activeDot={{ r: 5 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {recentWins.length > 0 && (
        <div className="bg-surface-glass backdrop-blur-glass border border-border-subtle rounded-lg overflow-hidden">
          <div className="p-4 border-b border-border-subtle">
            <h3 className="text-lg font-display font-bold">Recent Wins</h3>
          </div>
          <div className="relative overflow-hidden">
            <div className="animate-scroll whitespace-nowrap py-3">
              {[...recentWins, ...recentWins].map((win, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-2 mx-4 px-4 py-2 bg-signal-success/20 rounded-full text-sm"
                >
                  <span className="text-signal-success">✓</span>
                  <span className="text-text-primary">{win.bet_type}</span>
                  <span className="text-text-secondary font-mono">@ {win.odds.toFixed(2)}</span>
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
