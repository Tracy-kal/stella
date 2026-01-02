-- IMPROVED: Function to safely create user profile on signup
-- This version handles edge cases gracefully

-- First, drop the existing trigger to avoid conflicts
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Create a more robust user creation function
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
    new_referral_code TEXT;
    ref_user_id UUID := NULL;
BEGIN
    -- Generate a unique referral code
    new_referral_code := upper(substring(md5(random()::text || NEW.id::text) from 1 for 8));
    
    -- Safely handle referred_by - only set if valid
    IF NEW.raw_user_meta_data->>'referred_by' IS NOT NULL 
       AND NEW.raw_user_meta_data->>'referred_by' != '' 
       AND NEW.raw_user_meta_data->>'referred_by' != 'null' THEN
        BEGIN
            ref_user_id := (NEW.raw_user_meta_data->>'referred_by')::UUID;
            -- Verify the referrer exists
            IF NOT EXISTS (SELECT 1 FROM public.users WHERE id = ref_user_id) THEN
                ref_user_id := NULL;
            END IF;
        EXCEPTION WHEN OTHERS THEN
            ref_user_id := NULL;
        END;
    END IF;

    -- Insert the new user with safe defaults
    INSERT INTO public.users (
        id,
        full_name,
        email,
        phone_number,
        country,
        currency,
        referral_code,
        referred_by,
        role,
        account_status,
        kyc_status,
        balance_deposit,
        balance_profit,
        balance_bonus,
        can_trade,
        can_withdraw,
        required_trades,
        completed_trades,
        current_plan,
        is_signal_provider,
        is_copy_expert
    )
    VALUES (
        NEW.id,
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), 'User'),
        NEW.email,
        NULLIF(NEW.raw_user_meta_data->>'phone_number', ''),
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'country', ''), 'US'),
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'currency', ''), 'USD'),
        new_referral_code,
        ref_user_id,
        'user',
        'active',
        'pending',
        0.00,
        0.00,
        0.00,
        false,
        false,
        10,
        0,
        'basic',
        false,
        false
    )
    ON CONFLICT (id) DO NOTHING;
    
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    -- Log the error but don't fail the auth signup
    RAISE WARNING 'Error creating user profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO postgres, anon, authenticated, service_role;
GRANT ALL ON ALL TABLES IN SCHEMA public TO postgres, service_role;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO postgres, service_role;
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;
