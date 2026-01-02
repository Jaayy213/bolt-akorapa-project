export interface Database {
  public: {
    Tables: {
      predictions: {
        Row: {
          id: string;
          league: string;
          home_team: string;
          away_team: string;
          bet_type: string;
          odds: number;
          confidence_rating: number;
          booking_codes: Record<string, string>;
          is_premium: boolean;
          kickoff_time: string;
          analysis: string | null;
          status: 'pending' | 'won' | 'lost' | 'void';
          created_at: string;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          league: string;
          home_team: string;
          away_team: string;
          bet_type: string;
          odds: number;
          confidence_rating: number;
          booking_codes?: Record<string, string>;
          is_premium?: boolean;
          kickoff_time: string;
          analysis?: string | null;
          status?: 'pending' | 'won' | 'lost' | 'void';
          created_at?: string;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          league?: string;
          home_team?: string;
          away_team?: string;
          bet_type?: string;
          odds?: number;
          confidence_rating?: number;
          booking_codes?: Record<string, string>;
          is_premium?: boolean;
          kickoff_time?: string;
          analysis?: string | null;
          status?: 'pending' | 'won' | 'lost' | 'void';
          created_at?: string;
          resolved_at?: string | null;
        };
      };
      users: {
        Row: {
          id: string;
          email: string;
          subscription_tier: 'free' | 'daily' | 'weekly' | 'monthly';
          subscription_expires_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          subscription_tier?: 'free' | 'daily' | 'weekly' | 'monthly';
          subscription_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          subscription_tier?: 'free' | 'daily' | 'weekly' | 'monthly';
          subscription_expires_at?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      ledger: {
        Row: {
          id: string;
          date: string;
          net_units: number;
          total_tips: number;
          wins: number;
          losses: number;
          win_rate: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          date: string;
          net_units?: number;
          total_tips?: number;
          wins?: number;
          losses?: number;
          win_rate?: number;
          created_at?: string;
        };
        Update: {
          id?: string;
          date?: string;
          net_units?: number;
          total_tips?: number;
          wins?: number;
          losses?: number;
          win_rate?: number;
          created_at?: string;
        };
      };
      transactions: {
        Row: {
          id: string;
          user_id: string | null;
          paystack_reference: string;
          amount: number;
          currency: string;
          subscription_type: 'daily' | 'weekly' | 'monthly';
          status: 'pending' | 'success' | 'failed';
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          paystack_reference: string;
          amount: number;
          currency?: string;
          subscription_type: 'daily' | 'weekly' | 'monthly';
          status?: 'pending' | 'success' | 'failed';
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          paystack_reference?: string;
          amount?: number;
          currency?: string;
          subscription_type?: 'daily' | 'weekly' | 'monthly';
          status?: 'pending' | 'success' | 'failed';
          created_at?: string;
        };
      };
    };
  };
}
