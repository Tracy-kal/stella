# StellaOne Capitals - Investment & Trading Platform

A modern, full-stack investment and trading platform built with Next.js 16 and Supabase.

## Features

### Public Features
- Modern landing pages (Home, About, Services, FAQ, Contact)
- Real-time market ticker
- Investment plan showcase
- TradingView integration
- Blog/news section
- Responsive design with light/dark mode

### User Dashboard
- Portfolio overview with balance tracking
- Trading interface with real-time data
- Investment management
- Crypto deposits (BTC, ETH, USDT, SOL)
- Copy trading system
- Signal subscriptions
- Account settings
- Notification center

### Admin Dashboard
- Comprehensive user management
- Balance and permission controls
- Deposit/withdrawal approval system
- Investment and trade monitoring
- KYC verification system
- Support ticket management
- Blog content management
- System settings configuration

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Styling**: Tailwind CSS v4
- **UI Components**: shadcn/ui
- **Type Safety**: TypeScript
- **State Management**: React Server Components + SWR

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up environment variables (already configured via Supabase integration)

4. Run database migrations:
   - Navigate to the scripts folder
   - Execute SQL scripts in order (001, 002, 003, 004)

5. Start the development server:
   ```bash
   npm run dev
   ```

6. Open [http://localhost:3000](http://localhost:3000)

## Database Schema

The platform uses a comprehensive database schema with:
- User management (auth integration)
- Investment plans and user investments
- Trading system with positions tracking
- Transaction management (deposits/withdrawals)
- Copy trading and signal providers
- KYC document storage
- Support ticket system
- Notifications
- Blog/content management

All tables are protected with Row Level Security (RLS) policies.

## Authentication

- **User Login**: `/auth/login`
- **User Signup**: `/auth/signup`
- **Admin Login**: `/auth/admin/login`

## Key Routes

### Public
- `/` - Home page
- `/about` - About us
- `/services` - Services
- `/faq` - FAQ
- `/contact` - Contact

### User Dashboard
- `/dashboard` - Overview
- `/dashboard/trade` - Trading
- `/dashboard/portfolio` - Investments
- `/dashboard/deposits` - Make deposits
- `/dashboard/copy-trading` - Copy experts
- `/dashboard/signals` - Trading signals
- `/dashboard/settings` - Account settings

### Admin Panel
- `/admin` - Admin dashboard
- `/admin/users` - User management
- `/admin/users/[id]` - Edit user
- `/admin/investments` - Investment management
- `/admin/trades` - Trade monitoring
- `/admin/deposits` - Deposit approvals
- `/admin/withdrawals` - Withdrawal approvals
- `/admin/kyc` - KYC verification
- `/admin/support` - Support tickets
- `/admin/settings` - System settings

## Security Features

- Row Level Security (RLS) on all tables
- Admin-only routes protected by middleware
- Secure password hashing
- Email verification for new accounts
- Trading restrictions until account activation
- Withdrawal codes for additional security

## Production Deployment

This platform is production-ready and can be deployed to Vercel:

1. Push to GitHub repository
2. Import to Vercel
3. Supabase integration is already configured
4. Deploy

## License

Proprietary - All rights reserved
