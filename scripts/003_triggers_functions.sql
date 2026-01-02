-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at trigger to tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON public.users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_admin_users_updated_at BEFORE UPDATE ON public.admin_users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_investment_plans_updated_at BEFORE UPDATE ON public.investment_plans
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON public.transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_trades_updated_at BEFORE UPDATE ON public.trades
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_blog_posts_updated_at BEFORE UPDATE ON public.blog_posts
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists BOOLEAN := true;
BEGIN
    WHILE exists LOOP
        code := upper(substring(md5(random()::text) from 1 for 8));
        SELECT EXISTS(SELECT 1 FROM public.users WHERE referral_code = code) INTO exists;
    END LOOP;
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Trigger to create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (
        id,
        full_name,
        email,
        phone_number,
        country,
        currency,
        referral_code,
        referred_by
    )
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'User'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'phone_number', NULL),
        COALESCE(NEW.raw_user_meta_data->>'country', 'US'),
        COALESCE(NEW.raw_user_meta_data->>'currency', 'USD'),
        generate_referral_code(),
        (NEW.raw_user_meta_data->>'referred_by')::UUID
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- Trigger to create admin profile on admin signup
CREATE OR REPLACE FUNCTION handle_new_admin()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.raw_user_meta_data->>'role' = 'admin' THEN
        INSERT INTO public.admin_users (
            id,
            full_name,
            email
        )
        VALUES (
            NEW.id,
            COALESCE(NEW.raw_user_meta_data->>'full_name', 'Admin'),
            NEW.email
        );
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_admin_created ON auth.users;
CREATE TRIGGER on_auth_admin_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_admin();

-- Function to update investment progress
CREATE OR REPLACE FUNCTION calculate_investment_return(investment_id UUID)
RETURNS VOID AS $$
DECLARE
    inv RECORD;
    days_elapsed INTEGER;
    daily_return DECIMAL;
BEGIN
    SELECT i.*, p.roi_percentage, p.duration_days
    INTO inv
    FROM public.investments i
    JOIN public.investment_plans p ON i.plan_id = p.id
    WHERE i.id = investment_id;
    
    IF inv.status = 'active' THEN
        days_elapsed := EXTRACT(DAY FROM NOW() - inv.start_date);
        
        IF days_elapsed >= inv.duration_days THEN
            -- Investment completed
            UPDATE public.investments
            SET current_return = expected_return,
                status = 'completed',
                completed_at = NOW()
            WHERE id = investment_id;
            
            -- Add return to user profit balance
            UPDATE public.users
            SET balance_profit = balance_profit + inv.expected_return
            WHERE id = inv.user_id;
        ELSE
            -- Calculate partial return
            daily_return := inv.expected_return / inv.duration_days;
            UPDATE public.investments
            SET current_return = daily_return * days_elapsed
            WHERE id = investment_id;
        END IF;
    END IF;
END;
$$ LANGUAGE plpgsql;
