# Akorapa - Professional Sports Intelligence Platform

A mobile-first sports prediction platform with a premium "Midnight Terminal" aesthetic. Akorapa is designed to professionalize the sports prediction market with automated performance verification, transparent public ledger, and instant automated subscriptions via Paystack.

## Features

### Frontend
- **Smart Card Predictions Feed**: Mobile-first card-based UI with accordion expansion
- **Transparency Dashboard**: Live chart tracking net units won over 30 days with scrolling ticker
- **Premium Content Gating**: Blur effect on locked content with instant unlock after payment
- **Responsive Design**: Optimized for mobile devices (320px+)
- **Dark Mode Interface**: "Midnight Terminal" aesthetic with glassmorphism effects

### Backend
- **Admin Control Panel**: Mobile-responsive dashboard for managing predictions
- **Result Resolution Interface**: Quick WON/LOST/VOID buttons for batch updates
- **Automated Performance Tracking**: Automatic ledger updates via database triggers
- **Paystack Integration**: Secure payment processing for subscriptions

### Technical Stack
- React 18 with TypeScript
- Vite for blazing-fast builds
- Tailwind CSS for styling
- Supabase (PostgreSQL) for database and auth
- React Router v6 for routing
- Recharts for data visualization
- Paystack for payments

## Getting Started

### Prerequisites
- Node.js 16+ and npm
- Supabase account
- Paystack account (for payment processing)

### Installation

1. Clone the repository and install dependencies:
```bash
npm install
```

2. Create a `.env` file in the root directory:
```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_PAYSTACK_PUBLIC_KEY=your_paystack_public_key
```

3. The database schema has already been created via migrations. The schema includes:
   - `predictions` - Sports predictions with full metadata
   - `users` - User accounts and subscription status
   - `ledger` - Performance tracking for transparency
   - `transactions` - Payment transaction records

4. Run the development server:
```bash
npm run dev
```

5. Build for production:
```bash
npm run build
```

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Navigation.tsx
│   ├── PredictionCard.tsx
│   ├── SubscriptionModal.tsx
│   └── TransparencyDashboard.tsx
├── hooks/              # Custom React hooks
│   └── useAuth.tsx
├── lib/                # Utilities and configurations
│   ├── database.types.ts
│   ├── paystack.ts
│   └── supabase.ts
├── pages/              # Route pages
│   ├── AdminDashboard.tsx
│   ├── Auth.tsx
│   ├── Home.tsx
│   └── ResultResolution.tsx
├── App.tsx
├── index.css
└── main.tsx
```

## Design System

### Color Palette
- **bg-core**: #0F1115 (Primary background)
- **surface-glass**: rgba(255, 255, 255, 0.05) (Card backgrounds with blur)
- **accent-primary**: #3B82F6 (Electric blue for actions)
- **signal-success**: #00FF94 (Neon mint for wins)
- **signal-danger**: #FF4B4B (Soft red for losses)
- **text-primary**: #F8FAFC (High legibility headings)
- **text-secondary**: #94A3B8 (Metadata labels)

### Typography
- **Headings**: Montserrat (700, 800)
- **Data/Odds**: JetBrains Mono (400, 500)

## Usage Guide

### For Administrators

1. **Sign In**: Navigate to `/auth` and sign in with your admin account

2. **Create Predictions**:
   - Go to Admin Dashboard
   - Click "New Prediction"
   - Fill in match details, odds, confidence rating
   - Add booking codes for different bookmakers
   - Mark as Premium if it should be locked for subscribers
   - Add detailed analysis and H2H statistics

3. **Resolve Results**:
   - Go to Result Resolution page
   - Review pending predictions from previous matches
   - Click WON (green), LOST (red), or VOID (gray)
   - The ledger updates automatically

### For Users

1. **View Predictions**: Homepage displays all upcoming predictions sorted by confidence
2. **Filter Content**: Use the filter dropdown to view Free, Premium, or All tips
3. **Subscribe**: Click "Unlock" on premium predictions to open subscription modal
4. **Payment**: Choose a plan (Daily/Weekly/Monthly) and complete payment via Paystack
5. **Access Content**: Premium content unlocks instantly after successful payment

## Subscription Plans

- **Daily Pass**: GHS 5 (24 hours access)
- **Weekly Access**: GHS 20 (7 days access)
- **Monthly Pro**: GHS 50 (30 days access)

## Security Features

- Row Level Security (RLS) enabled on all tables
- Authenticated-only access for admin functions
- Users can only view their own transactions
- Public read access to predictions and ledger (transparency)
- Secure password authentication via Supabase Auth

## Performance Optimization

- Server-side rendering ready
- Code splitting via dynamic imports
- Optimized bundle size
- Responsive images and lazy loading
- Real-time updates via Supabase subscriptions

## Browser Support

- Chrome/Edge (latest 2 versions)
- Firefox (latest 2 versions)
- Safari (latest 2 versions)
- Mobile browsers (iOS Safari, Chrome Mobile)

## License

Proprietary - All rights reserved

## Support

For technical support or questions, please contact the development team.
