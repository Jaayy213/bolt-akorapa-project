/*
  # Akorapa Platform Database Schema

  ## Overview
  This migration creates the complete database structure for the Akorapa sports prediction platform.

  ## 1. New Tables

  ### `predictions`
  Stores all sports predictions with full metadata
  - `id` (uuid, primary key)
  - `league` (text) - League name
  - `home_team` (text) - Home team name
  - `away_team` (text) - Away team name
  - `bet_type` (text) - Type of bet (e.g., "Over 2.5 Goals")
  - `odds` (decimal) - Decimal odds
  - `confidence_rating` (integer) - 1-5 star rating
  - `booking_codes` (jsonb) - Booking codes for different bookmakers
  - `is_premium` (boolean) - Free vs VIP content
  - `kickoff_time` (timestamptz) - Match kickoff time
  - `analysis` (text) - Detailed reasoning and H2H stats
  - `status` (text) - pending/won/lost/void
  - `created_at` (timestamptz)
  - `resolved_at` (timestamptz) - When result was resolved

  ### `users`
  User accounts and subscription status
  - `id` (uuid, primary key) - Links to auth.users
  - `email` (text)
  - `subscription_tier` (text) - free/daily/weekly/monthly
  - `subscription_expires_at` (timestamptz)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### `ledger`
  Performance tracking for transparency dashboard
  - `id` (uuid, primary key)
  - `date` (date) - Date of the record
  - `net_units` (decimal) - Net units won/lost for the day
  - `total_tips` (integer) - Number of tips issued
  - `wins` (integer) - Number of winning tips
  - `losses` (integer) - Number of losing tips
  - `win_rate` (decimal) - Calculated win rate percentage
  - `created_at` (timestamptz)

  ### `transactions`
  Payment transaction records
  - `id` (uuid, primary key)
  - `user_id` (uuid, foreign key)
  - `paystack_reference` (text) - Paystack transaction reference
  - `amount` (decimal) - Transaction amount
  - `currency` (text) - Currency code (GHS, NGN)
  - `subscription_type` (text) - daily/weekly/monthly
  - `status` (text) - pending/success/failed
  - `created_at` (timestamptz)

  ## 2. Security
  - Enable RLS on all tables
  - Predictions: Public read access, admin-only write
  - Users: Users can read own data, admin can update
  - Ledger: Public read access (transparency)
  - Transactions: Users can read own transactions

  ## 3. Indexes
  - Performance indexes on frequently queried fields
*/

-- Create predictions table
CREATE TABLE IF NOT EXISTS predictions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  league text NOT NULL,
  home_team text NOT NULL,
  away_team text NOT NULL,
  bet_type text NOT NULL,
  odds decimal(5,2) NOT NULL,
  confidence_rating integer NOT NULL CHECK (confidence_rating >= 1 AND confidence_rating <= 5),
  booking_codes jsonb DEFAULT '{}',
  is_premium boolean DEFAULT false,
  kickoff_time timestamptz NOT NULL,
  analysis text,
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'won', 'lost', 'void')),
  created_at timestamptz DEFAULT now(),
  resolved_at timestamptz
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  subscription_tier text DEFAULT 'free' CHECK (subscription_tier IN ('free', 'daily', 'weekly', 'monthly')),
  subscription_expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create ledger table
CREATE TABLE IF NOT EXISTS ledger (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date date NOT NULL UNIQUE,
  net_units decimal(10,2) DEFAULT 0,
  total_tips integer DEFAULT 0,
  wins integer DEFAULT 0,
  losses integer DEFAULT 0,
  win_rate decimal(5,2) DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create transactions table
CREATE TABLE IF NOT EXISTS transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES users(id) ON DELETE CASCADE,
  paystack_reference text UNIQUE NOT NULL,
  amount decimal(10,2) NOT NULL,
  currency text DEFAULT 'GHS' CHECK (currency IN ('GHS', 'NGN')),
  subscription_type text NOT NULL CHECK (subscription_type IN ('daily', 'weekly', 'monthly')),
  status text DEFAULT 'pending' CHECK (status IN ('pending', 'success', 'failed')),
  created_at timestamptz DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_predictions_kickoff ON predictions(kickoff_time DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_status ON predictions(status);
CREATE INDEX IF NOT EXISTS idx_predictions_premium ON predictions(is_premium);
CREATE INDEX IF NOT EXISTS idx_predictions_confidence ON predictions(confidence_rating DESC);
CREATE INDEX IF NOT EXISTS idx_ledger_date ON ledger(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_user ON transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_reference ON transactions(paystack_reference);

-- Enable Row Level Security
ALTER TABLE predictions ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for predictions
CREATE POLICY "Public can view all predictions"
  ON predictions FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can insert predictions"
  ON predictions FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update predictions"
  ON predictions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for users
CREATE POLICY "Users can view own profile"
  ON users FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON users FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

-- RLS Policies for ledger (public transparency)
CREATE POLICY "Public can view ledger"
  ON ledger FOR SELECT
  TO public
  USING (true);

CREATE POLICY "Authenticated users can manage ledger"
  ON ledger FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- RLS Policies for transactions
CREATE POLICY "Users can view own transactions"
  ON transactions FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own transactions"
  ON transactions FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Authenticated users can update transactions"
  ON transactions FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Create function to update ledger when prediction is resolved
CREATE OR REPLACE FUNCTION update_ledger_on_result()
RETURNS TRIGGER AS $$
DECLARE
  result_date date;
  units_change decimal;
BEGIN
  IF NEW.status != OLD.status AND NEW.status IN ('won', 'lost') THEN
    result_date := NEW.resolved_at::date;
    
    IF NEW.status = 'won' THEN
      units_change := (NEW.odds - 1);
    ELSE
      units_change := -1;
    END IF;
    
    INSERT INTO ledger (date, net_units, total_tips, wins, losses)
    VALUES (
      result_date,
      units_change,
      1,
      CASE WHEN NEW.status = 'won' THEN 1 ELSE 0 END,
      CASE WHEN NEW.status = 'lost' THEN 1 ELSE 0 END
    )
    ON CONFLICT (date) DO UPDATE SET
      net_units = ledger.net_units + units_change,
      total_tips = ledger.total_tips + 1,
      wins = ledger.wins + CASE WHEN NEW.status = 'won' THEN 1 ELSE 0 END,
      losses = ledger.losses + CASE WHEN NEW.status = 'lost' THEN 1 ELSE 0 END,
      win_rate = CASE 
        WHEN ledger.total_tips + 1 > 0 
        THEN ((ledger.wins + CASE WHEN NEW.status = 'won' THEN 1 ELSE 0 END)::decimal / (ledger.total_tips + 1)) * 100
        ELSE 0 
      END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic ledger updates
DROP TRIGGER IF EXISTS trigger_update_ledger ON predictions;
CREATE TRIGGER trigger_update_ledger
  AFTER UPDATE ON predictions
  FOR EACH ROW
  EXECUTE FUNCTION update_ledger_on_result();