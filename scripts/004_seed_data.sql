-- Insert default investment plans
INSERT INTO public.investment_plans (name, plan_type, min_amount, max_amount, roi_percentage, duration_days, description, features) VALUES
('Basic Plan', 'basic', 100.00, 999.99, 5.00, 7, 'Perfect for beginners starting their investment journey', '["24/7 Support", "Basic Analytics", "Mobile App Access"]'::jsonb),
('Silver Plan', 'silver', 1000.00, 4999.99, 10.00, 14, 'Enhanced returns for growing investors', '["Priority Support", "Advanced Analytics", "Copy Trading Access", "Mobile App Access"]'::jsonb),
('Gold Plan', 'gold', 5000.00, 14999.99, 15.00, 21, 'Premium features for serious investors', '["VIP Support", "Pro Analytics", "Copy Trading Access", "Signal Alerts", "Dedicated Account Manager"]'::jsonb),
('Platinum Plan', 'platinum', 15000.00, 49999.99, 20.00, 30, 'Elite investment experience', '["24/7 VIP Support", "Professional Analytics", "Unlimited Copy Trading", "Premium Signals", "Personal Account Manager", "Tax Optimization"]'::jsonb),
('Diamond Plan', 'diamond', 50000.00, 999999.99, 30.00, 45, 'Ultimate investment package for high net worth individuals', '["Concierge Support", "Institutional Grade Analytics", "Private Signal Room", "Custom Trading Strategies", "Executive Account Team", "Legal & Tax Services"]'::jsonb)
ON CONFLICT DO NOTHING;

-- Insert default payment methods
INSERT INTO public.payment_methods (name, type, details) VALUES
('Bitcoin (BTC)', 'crypto', '{"symbol": "BTC", "network": "Bitcoin", "address": "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh"}'::jsonb),
('Ethereum (ETH)', 'crypto', '{"symbol": "ETH", "network": "Ethereum", "address": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"}'::jsonb),
('Tether (USDT)', 'crypto', '{"symbol": "USDT", "network": "TRC20", "address": "TYASr3QxxxxxxxxxxxxxxxxxxxxxxxxxX"}'::jsonb),
('Solana (SOL)', 'crypto', '{"symbol": "SOL", "network": "Solana", "address": "7dHbWXmcixxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"}'::jsonb)
ON CONFLICT DO NOTHING;

-- Insert default system settings
INSERT INTO public.system_settings (key, value, description) VALUES
('referral_bonus', '{"enabled": true, "percentage": 5, "min_deposit": 100}'::jsonb, 'Referral program settings'),
('withdrawal_settings', '{"min_amount": 50, "max_daily": 10000, "processing_time": 24}'::jsonb, 'Withdrawal configuration'),
('trading_settings', '{"min_trade_amount": 10, "max_leverage": 100, "default_leverage": 10}'::jsonb, 'Trading configuration'),
('maintenance_mode', '{"enabled": false, "message": "System maintenance in progress"}'::jsonb, 'Maintenance mode toggle')
ON CONFLICT DO NOTHING;
