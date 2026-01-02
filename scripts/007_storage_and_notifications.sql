-- ==========================================================
-- STORAGE BUCKETS AND RLS POLICIES - FIXED VERSION
-- Run this in Supabase SQL Editor
-- ==========================================================

-- Create deposit-proofs bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('deposit-proofs', 'deposit-proofs', true)
ON CONFLICT (id) DO NOTHING;

-- Create kyc-documents bucket (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('kyc-documents', 'kyc-documents', false)
ON CONFLICT (id) DO NOTHING;

-- ==========================================================
-- RLS POLICIES FOR DEPOSIT PROOFS BUCKET
-- ==========================================================

-- Allow authenticated users to upload to deposit-proofs bucket
CREATE POLICY "Users can upload deposit proofs"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'deposit-proofs');

-- Allow public read access to deposit proofs
CREATE POLICY "Anyone can view deposit proofs"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'deposit-proofs');

-- ==========================================================
-- RLS POLICIES FOR KYC DOCUMENTS BUCKET
-- ==========================================================

-- Allow authenticated users to upload to their own folder
CREATE POLICY "Users can upload their KYC documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'kyc-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow users to view their own KYC documents
CREATE POLICY "Users can view their own KYC documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'kyc-documents' AND
    (storage.foldername(name))[1] = auth.uid()::text
);

-- Allow admins to view all KYC documents
CREATE POLICY "Admins can view all KYC documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
    bucket_id = 'kyc-documents' AND
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- ==========================================================
-- CRYPTO ADDRESSES TABLE
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.crypto_addresses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    crypto_symbol TEXT NOT NULL UNIQUE,
    crypto_name TEXT NOT NULL,
    wallet_address TEXT NOT NULL,
    network TEXT NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.crypto_addresses ENABLE ROW LEVEL SECURITY;

-- Everyone can view active addresses
CREATE POLICY "Anyone can view active crypto addresses"
ON public.crypto_addresses FOR SELECT
TO authenticated
USING (is_active = true);

-- Admins can manage addresses (all operations)
CREATE POLICY "Admins can insert crypto addresses"
ON public.crypto_addresses FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

CREATE POLICY "Admins can update crypto addresses"
ON public.crypto_addresses FOR UPDATE
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

CREATE POLICY "Admins can delete crypto addresses"
ON public.crypto_addresses FOR DELETE
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- ==========================================================
-- NOTIFICATIONS TABLE (FIXED - no admin_id reference)
-- ==========================================================

CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    is_admin_notification BOOLEAN DEFAULT false,
    type TEXT NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Users can view their own notifications
CREATE POLICY "Users can view their notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (user_id = auth.uid() AND is_admin_notification = false);

-- Users can update their notifications (mark as read)
CREATE POLICY "Users can update their notifications"
ON public.notifications FOR UPDATE
TO authenticated
USING (user_id = auth.uid());

-- Admins can view admin notifications
CREATE POLICY "Admins can view admin notifications"
ON public.notifications FOR SELECT
TO authenticated
USING (
    is_admin_notification = true AND
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- System can insert notifications
CREATE POLICY "Authenticated can insert notifications"
ON public.notifications FOR INSERT
TO authenticated
WITH CHECK (true);

-- ==========================================================
-- INVESTMENT PLANS RLS POLICIES (FIX FOR ADMIN UPDATES)
-- ==========================================================

-- Drop existing restrictive policies if any
DROP POLICY IF EXISTS "Admins can manage investment plans" ON public.investment_plans;

-- Allow all authenticated to view active plans
CREATE POLICY "Anyone can view active investment plans"
ON public.investment_plans FOR SELECT
TO authenticated
USING (is_active = true);

-- Admins can view ALL plans (including inactive)
CREATE POLICY "Admins can view all investment plans"
ON public.investment_plans FOR SELECT
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- Admins can INSERT plans
CREATE POLICY "Admins can insert investment plans"
ON public.investment_plans FOR INSERT
TO authenticated
WITH CHECK (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- Admins can UPDATE plans
CREATE POLICY "Admins can update investment plans"
ON public.investment_plans FOR UPDATE
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- Admins can DELETE plans
CREATE POLICY "Admins can delete investment plans"
ON public.investment_plans FOR DELETE
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- ==========================================================
-- INVESTMENTS TABLE RLS (for admin to update current_return)
-- ==========================================================

-- Admins can update investments (for profit adjustments)
CREATE POLICY "Admins can update investments"
ON public.investments FOR UPDATE
TO authenticated
USING (
    EXISTS (SELECT 1 FROM public.admin_users WHERE id = auth.uid())
);

-- ==========================================================
-- ADD MISSING COLUMNS TO USERS TABLE
-- ==========================================================

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'kyc_status') THEN
        ALTER TABLE public.users ADD COLUMN kyc_status TEXT DEFAULT 'pending';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'kyc_document_type') THEN
        ALTER TABLE public.users ADD COLUMN kyc_document_type TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'kyc_document_url') THEN
        ALTER TABLE public.users ADD COLUMN kyc_document_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'kyc_selfie_url') THEN
        ALTER TABLE public.users ADD COLUMN kyc_selfie_url TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'kyc_submitted_at') THEN
        ALTER TABLE public.users ADD COLUMN kyc_submitted_at TIMESTAMPTZ;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'tax_code') THEN
        ALTER TABLE public.users ADD COLUMN tax_code TEXT;
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'users' AND column_name = 'mfi_code') THEN
        ALTER TABLE public.users ADD COLUMN mfi_code TEXT;
    END IF;
END $$;
