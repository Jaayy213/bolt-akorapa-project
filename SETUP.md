# Akorapa Setup Guide

## Quick Setup Steps

### 1. Environment Configuration

After cloning the repository, create a `.env` file with your credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your-key-here
```

### 2. Supabase Setup

The database schema is already configured. To set up a new Supabase project:

1. Go to [supabase.com](https://supabase.com) and create a new project
2. The migration has already been applied with these tables:
   - predictions
   - users
   - ledger
   - transactions

3. Copy your project URL and anon key from Settings > API

### 3. Paystack Setup

1. Create a Paystack account at [paystack.com](https://paystack.com)
2. Get your public key from Settings > API Keys & Webhooks
3. Set up a webhook endpoint for payment verification (optional for MVP)
   - URL: `https://your-domain.com/api/webhook/paystack`
   - Events: `charge.success`

### 4. Install Dependencies

```bash
npm install
```

### 5. Run Development Server

```bash
npm run dev
```

Visit `http://localhost:5173` to see the application.

### 6. Create Admin Account

1. Navigate to `/auth`
2. Sign up with your email and password
3. This creates both an auth user and a profile in the users table

### 7. Add Sample Data (Optional)

Use the Admin Dashboard to create some sample predictions to test the UI.

## Deployment

### Build for Production

```bash
npm run build
```

The build output will be in the `dist/` directory.

### Deploy to Hosting

The application can be deployed to any static hosting service:
- Vercel
- Netlify
- Cloudflare Pages
- AWS S3 + CloudFront

Make sure to set environment variables in your hosting platform's dashboard.

## Troubleshooting

### Issue: "Missing Supabase environment variables"

**Solution**: Ensure your `.env` file is in the root directory and contains valid values.

### Issue: Paystack modal not opening

**Solution**:
1. Check that VITE_PAYSTACK_PUBLIC_KEY is set
2. Verify the Paystack inline script is loaded in index.html
3. Check browser console for errors

### Issue: Database connection errors

**Solution**:
1. Verify Supabase URL and anon key are correct
2. Check that RLS policies are properly configured
3. Ensure your Supabase project is active

## Feature Checklist

- [x] Database schema with all tables
- [x] User authentication (sign up/sign in)
- [x] Prediction card component with accordion
- [x] Transparency dashboard with chart
- [x] Premium content gating with blur
- [x] Admin control panel
- [x] Result resolution interface
- [x] Paystack payment integration
- [x] Real-time updates via Supabase subscriptions
- [x] Responsive mobile-first design

## Next Steps

1. Populate the database with real predictions
2. Set up automated result resolution (can integrate with sports API)
3. Configure email notifications for subscription expiry
4. Add analytics tracking
5. Implement progressive web app (PWA) features
6. Set up automated backups

## Production Checklist

Before going live:

- [ ] Update VITE_PAYSTACK_PUBLIC_KEY to live key (not test)
- [ ] Configure custom domain
- [ ] Set up SSL certificate (usually automatic with modern hosting)
- [ ] Test payment flow end-to-end
- [ ] Verify RLS policies are secure
- [ ] Set up database backups
- [ ] Configure monitoring and alerts
- [ ] Test on multiple mobile devices
- [ ] Optimize images and assets
- [ ] Set up error tracking (e.g., Sentry)

## Support

For questions or issues, refer to:
- Supabase docs: https://supabase.com/docs
- Paystack docs: https://paystack.com/docs
- React Router docs: https://reactrouter.com
- Tailwind CSS docs: https://tailwindcss.com
