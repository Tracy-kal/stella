-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enum types
CREATE TYPE user_role AS ENUM ('user', 'admin');
CREATE TYPE account_status AS ENUM ('active', 'blocked', 'pending');
CREATE TYPE kyc_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE transaction_type AS ENUM ('deposit', 'withdrawal', 'profit', 'bonus', 'referral', 'investment');
CREATE TYPE transaction_status AS ENUM ('pending', 'approved', 'rejected', 'processing');
CREATE TYPE trade_status AS ENUM ('open', 'closed', 'pending');
CREATE TYPE investment_status AS ENUM ('active', 'completed', 'cancelled');
CREATE TYPE plan_type AS ENUM ('basic', 'silver', 'gold', 'platinum', 'diamond');

-- Users table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    phone_number TEXT,
    country TEXT NOT NULL,
    currency TEXT NOT NULL DEFAULT 'USD',
    role user_role DEFAULT 'user',
    account_status account_status DEFAULT 'active',
    kyc_status kyc_status DEFAULT 'pending',
    
    -- Balances
    balance_deposit DECIMAL(15, 2) DEFAULT 0.00,
    balance_profit DECIMAL(15, 2) DEFAULT 0.00,
    balance_bonus DECIMAL(15, 2) DEFAULT 0.00,
    
    -- Trading settings
    can_trade BOOLEAN DEFAULT false,
    can_withdraw BOOLEAN DEFAULT false,
    required_trades INTEGER DEFAULT 10,
    completed_trades INTEGER DEFAULT 0,
    withdrawal_code TEXT,
    
    -- Plan & Signal settings
    current_plan plan_type DEFAULT 'basic',
    is_signal_provider BOOLEAN DEFAULT false,
    is_copy_expert BOOLEAN DEFAULT false,
    
    -- Referral
    referral_code TEXT UNIQUE,
    referred_by UUID REFERENCES public.users(id),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Admin users table
CREATE TABLE IF NOT EXISTS public.admin_users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    role user_role DEFAULT 'admin',
    permissions JSONB DEFAULT '{"all": true}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Investment plans table
CREATE TABLE IF NOT EXISTS public.investment_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    plan_type plan_type NOT NULL,
    min_amount DECIMAL(15, 2) NOT NULL,
    max_amount DECIMAL(15, 2) NOT NULL,
    roi_percentage DECIMAL(5, 2) NOT NULL,
    duration_days INTEGER NOT NULL,
    description TEXT,
    features JSONB DEFAULT '[]'::jsonb,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User investments table
CREATE TABLE IF NOT EXISTS public.investments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    plan_id UUID NOT NULL REFERENCES public.investment_plans(id),
    amount DECIMAL(15, 2) NOT NULL,
    expected_return DECIMAL(15, 2) NOT NULL,
    current_return DECIMAL(15, 2) DEFAULT 0.00,
    status investment_status DEFAULT 'active',
    start_date TIMESTAMPTZ DEFAULT NOW(),
    end_date TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    type transaction_type NOT NULL,
    status transaction_status DEFAULT 'pending',
    amount DECIMAL(15, 2) NOT NULL,
    currency TEXT DEFAULT 'USD',
    
    -- For crypto deposits
    crypto_type TEXT,
    wallet_address TEXT,
    transaction_hash TEXT,
    
    -- Admin notes
    admin_notes TEXT,
    approved_by UUID REFERENCES public.admin_users(id),
    approved_at TIMESTAMPTZ,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trades table
CREATE TABLE IF NOT EXISTS public.trades (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    trade_type TEXT NOT NULL CHECK (trade_type IN ('buy', 'sell')),
    amount DECIMAL(15, 2) NOT NULL,
    leverage INTEGER DEFAULT 1,
    entry_price DECIMAL(15, 4) NOT NULL,
    exit_price DECIMAL(15, 4),
    profit_loss DECIMAL(15, 2) DEFAULT 0.00,
    status trade_status DEFAULT 'open',
    expiration TIMESTAMPTZ,
    closed_at TIMESTAMPTZ,
    
    -- Admin placed trade
    placed_by_admin UUID REFERENCES public.admin_users(id),
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Copy trading experts table
CREATE TABLE IF NOT EXISTS public.copy_experts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    bio TEXT,
    total_followers INTEGER DEFAULT 0,
    success_rate DECIMAL(5, 2) DEFAULT 0.00,
    total_profit DECIMAL(15, 2) DEFAULT 0.00,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Copy trading subscriptions
CREATE TABLE IF NOT EXISTS public.copy_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    expert_id UUID NOT NULL REFERENCES public.copy_experts(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, expert_id)
);

-- Signal providers table
CREATE TABLE IF NOT EXISTS public.signal_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    description TEXT,
    price DECIMAL(15, 2) NOT NULL,
    success_rate DECIMAL(5, 2) DEFAULT 0.00,
    total_signals INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Signals table
CREATE TABLE IF NOT EXISTS public.signals (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    provider_id UUID NOT NULL REFERENCES public.signal_providers(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    signal_type TEXT NOT NULL CHECK (signal_type IN ('buy', 'sell')),
    entry_price DECIMAL(15, 4) NOT NULL,
    take_profit DECIMAL(15, 4),
    stop_loss DECIMAL(15, 4),
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Signal subscriptions
CREATE TABLE IF NOT EXISTS public.signal_subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES public.signal_providers(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, provider_id)
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    type TEXT DEFAULT 'info',
    is_read BOOLEAN DEFAULT false,
    link TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Support tickets table
CREATE TABLE IF NOT EXISTS public.support_tickets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    status TEXT DEFAULT 'open' CHECK (status IN ('open', 'in_progress', 'closed')),
    priority TEXT DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    admin_response TEXT,
    responded_by UUID REFERENCES public.admin_users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- System settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    key TEXT UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- KYC documents table
CREATE TABLE IF NOT EXISTS public.kyc_documents (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    document_type TEXT NOT NULL,
    document_url TEXT NOT NULL,
    status kyc_status DEFAULT 'pending',
    admin_notes TEXT,
    reviewed_by UUID REFERENCES public.admin_users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payment methods table
CREATE TABLE IF NOT EXISTS public.payment_methods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('crypto', 'bank', 'card')),
    details JSONB NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS public.blog_posts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title TEXT NOT NULL,
    slug TEXT UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    image_url TEXT,
    author_id UUID REFERENCES public.admin_users(id),
    is_published BOOLEAN DEFAULT false,
    published_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investment_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trades ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copy_experts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copy_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signal_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.signal_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.kyc_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_methods ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX idx_users_email ON public.users(email);
CREATE INDEX idx_users_referral_code ON public.users(referral_code);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_status ON public.transactions(status);
CREATE INDEX idx_trades_user_id ON public.trades(user_id);
CREATE INDEX idx_trades_status ON public.trades(status);
CREATE INDEX idx_investments_user_id ON public.investments(user_id);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_blog_posts_slug ON public.blog_posts(slug);
