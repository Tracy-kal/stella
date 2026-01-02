-- ==========================================================
-- ADMIN ACCOUNT SETUP SCRIPT
-- Run this in Supabase SQL Editor to create your admin account
-- ==========================================================

-- STEP 1: First, sign up as a regular user through the app
-- Go to /auth/signup and create an account with your admin email

-- STEP 2: After signup, run this SQL to promote that user to admin
-- Replace 'admin@stellaonecapitals.com' with your actual admin email

-- Get the user ID and create admin entry
INSERT INTO public.admin_users (id, full_name, email, role, permissions)
SELECT 
    id, 
    COALESCE(raw_user_meta_data->>'full_name', 'Admin'),
    email,
    'admin',
    '{"all": true}'::jsonb
FROM auth.users 
WHERE email = 'admin@stellaonecapitals.com'
ON CONFLICT (id) DO NOTHING;

-- Verify admin was created
SELECT * FROM public.admin_users WHERE email = 'admin@stellaonecapitals.com';

-- ==========================================================
-- ALTERNATIVE: Create admin directly (if email not yet registered)
-- ==========================================================

-- If you want to create a completely new admin without signing up first,
-- you can use Supabase Authentication UI in the dashboard:
-- 1. Go to Authentication > Users
-- 2. Click "Add User"
-- 3. Enter admin email and password
-- 4. Then run the INSERT above with that email

-- ==========================================================
-- GRANT STORAGE PERMISSIONS FOR DEPOSIT PROOFS
-- ==========================================================

-- Create storage bucket if it doesn't exist (run this separately)
-- INSERT INTO storage.buckets (id, name, public) 
-- VALUES ('deposit-proofs', 'deposit-proofs', true)
-- ON CONFLICT DO NOTHING;

-- Storage policy for deposit proofs (authenticated users can upload)
CREATE POLICY "Users can upload deposit proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'deposit-proofs');

CREATE POLICY "Anyone can view deposit proofs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'deposit-proofs');

-- ==========================================================
-- ADD MISSING COLUMNS TO COPY_SUBSCRIPTIONS TABLE
-- ==========================================================

-- Add amount_invested and current_profit columns if they don't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'copy_subscriptions' AND column_name = 'amount_invested') THEN
        ALTER TABLE public.copy_subscriptions ADD COLUMN amount_invested DECIMAL(15, 2) DEFAULT 0.00;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'copy_subscriptions' AND column_name = 'current_profit') THEN
        ALTER TABLE public.copy_subscriptions ADD COLUMN current_profit DECIMAL(15, 2) DEFAULT 0.00;
    END IF;
END $$;

-- ==========================================================
-- RLS POLICIES FOR COPY TRADING AND SIGNALS
-- ==========================================================

-- Allow authenticated users to view active copy experts
CREATE POLICY "Anyone can view active copy experts"
ON public.copy_experts FOR SELECT
TO authenticated
USING (is_active = true);

-- Allow admins to manage copy experts
CREATE POLICY "Admins can manage copy experts"
ON public.copy_experts FOR ALL
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- Allow authenticated users to view active signal providers
CREATE POLICY "Anyone can view active signal providers"
ON public.signal_providers FOR SELECT
TO authenticated
USING (is_active = true);

-- Allow admins to manage signal providers
CREATE POLICY "Admins can manage signal providers"
ON public.signal_providers FOR ALL
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- Allow users to view their own copy subscriptions
CREATE POLICY "Users can view their copy subscriptions"
ON public.copy_subscriptions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow users to create copy subscriptions
CREATE POLICY "Users can create copy subscriptions"
ON public.copy_subscriptions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Allow users to view their signal subscriptions
CREATE POLICY "Users can view their signal subscriptions"
ON public.signal_subscriptions FOR SELECT
TO authenticated
USING (user_id = auth.uid());

-- Allow users to create signal subscriptions
CREATE POLICY "Users can create signal subscriptions"
ON public.signal_subscriptions FOR INSERT
TO authenticated
WITH CHECK (user_id = auth.uid());

-- Allow users to view active signals from subscribed providers
CREATE POLICY "Users can view signals from subscribed providers"
ON public.signals FOR SELECT
TO authenticated
USING (
    is_active = true AND
    provider_id IN (
        SELECT provider_id FROM public.signal_subscriptions 
        WHERE user_id = auth.uid() AND is_active = true
    )
);

-- Allow admins to manage signals
CREATE POLICY "Admins can manage signals"
ON public.signals FOR ALL
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

COMMIT;
