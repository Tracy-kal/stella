-- RLS Policies for users table
CREATE POLICY "users_select_own" ON public.users
    FOR SELECT USING (auth.uid() = id);

CREATE POLICY "users_update_own" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for admin_users table
CREATE POLICY "admin_users_select_own" ON public.admin_users
    FOR SELECT USING (auth.uid() = id);

-- RLS Policies for investment_plans (public read)
CREATE POLICY "investment_plans_select_all" ON public.investment_plans
    FOR SELECT USING (is_active = true);

-- RLS Policies for investments
CREATE POLICY "investments_select_own" ON public.investments
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "investments_insert_own" ON public.investments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for transactions
CREATE POLICY "transactions_select_own" ON public.transactions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "transactions_insert_own" ON public.transactions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for trades
CREATE POLICY "trades_select_own" ON public.trades
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "trades_insert_own" ON public.trades
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for copy_experts (public read)
CREATE POLICY "copy_experts_select_all" ON public.copy_experts
    FOR SELECT USING (is_active = true);

-- RLS Policies for copy_subscriptions
CREATE POLICY "copy_subscriptions_select_own" ON public.copy_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "copy_subscriptions_insert_own" ON public.copy_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "copy_subscriptions_delete_own" ON public.copy_subscriptions
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for signal_providers (public read)
CREATE POLICY "signal_providers_select_all" ON public.signal_providers
    FOR SELECT USING (is_active = true);

-- RLS Policies for signals (public read for active signals)
CREATE POLICY "signals_select_active" ON public.signals
    FOR SELECT USING (is_active = true);

-- RLS Policies for signal_subscriptions
CREATE POLICY "signal_subscriptions_select_own" ON public.signal_subscriptions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "signal_subscriptions_insert_own" ON public.signal_subscriptions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "signal_subscriptions_delete_own" ON public.signal_subscriptions
    FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for notifications
CREATE POLICY "notifications_select_own" ON public.notifications
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "notifications_update_own" ON public.notifications
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for support_tickets
CREATE POLICY "support_tickets_select_own" ON public.support_tickets
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "support_tickets_insert_own" ON public.support_tickets
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "support_tickets_update_own" ON public.support_tickets
    FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for kyc_documents
CREATE POLICY "kyc_documents_select_own" ON public.kyc_documents
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "kyc_documents_insert_own" ON public.kyc_documents
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for payment_methods (public read for active)
CREATE POLICY "payment_methods_select_active" ON public.payment_methods
    FOR SELECT USING (is_active = true);

-- RLS Policies for blog_posts (public read for published)
CREATE POLICY "blog_posts_select_published" ON public.blog_posts
    FOR SELECT USING (is_published = true);

-- RLS Policies for system_settings (public read)
CREATE POLICY "system_settings_select_all" ON public.system_settings
    FOR SELECT USING (true);
