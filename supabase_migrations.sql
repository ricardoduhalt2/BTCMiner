-- BTCMiner Advanced Frontend - Supabase Database Schema
-- Execute this SQL in your Supabase SQL Editor

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Create custom types/enums
CREATE TYPE wallet_type AS ENUM ('metamask', 'phantom', 'walletconnect', 'internet-identity');
CREATE TYPE transaction_type AS ENUM ('transfer', 'bridge', 'swap', 'liquidity', 'mint', 'burn');
CREATE TYPE transaction_status AS ENUM ('pending', 'processing', 'completed', 'failed', 'cancelled');
CREATE TYPE notification_type AS ENUM ('price', 'transaction', 'security', 'liquidity', 'system');
CREATE TYPE notification_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE alert_condition AS ENUM ('above', 'below', 'change');
CREATE TYPE warning_level AS ENUM ('normal', 'low', 'critical');
CREATE TYPE trading_type AS ENUM ('buy', 'sell', 'swap');
CREATE TYPE bridge_status AS ENUM ('pending', 'processing', 'completed', 'failed');

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    wallet_address TEXT UNIQUE,
    internet_identity_principal TEXT UNIQUE,
    email TEXT UNIQUE,
    preferences JSONB DEFAULT '{
        "defaultChain": "ethereum",
        "currency": "USD",
        "language": "en",
        "timezone": "UTC",
        "notifications": {
            "email": false,
            "push": true,
            "sms": false,
            "priceAlerts": true,
            "transactionUpdates": true,
            "liquidityWarnings": true,
            "securityAlerts": true
        },
        "privacy": {
            "shareAnalytics": true,
            "shareUsageData": false,
            "publicProfile": false
        }
    }'::jsonb,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    last_active_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Connected wallets table
CREATE TABLE connected_wallets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    wallet_type wallet_type NOT NULL,
    address TEXT NOT NULL,
    chain_id INTEGER NOT NULL,
    chain_name TEXT NOT NULL,
    balance TEXT DEFAULT '0',
    public_key TEXT,
    principal TEXT,
    is_active BOOLEAN DEFAULT true,
    connected_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, wallet_type, address, chain_id)
);

-- Transactions table
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    hash TEXT NOT NULL,
    type transaction_type NOT NULL,
    status transaction_status DEFAULT 'pending',
    from_chain TEXT NOT NULL,
    to_chain TEXT,
    from_address TEXT NOT NULL,
    to_address TEXT NOT NULL,
    amount TEXT NOT NULL,
    token_address TEXT NOT NULL,
    token_symbol TEXT NOT NULL,
    token_name TEXT NOT NULL,
    token_decimals INTEGER NOT NULL DEFAULT 18,
    gas_used TEXT,
    gas_price TEXT,
    fee TEXT NOT NULL,
    block_number BIGINT,
    confirmations INTEGER DEFAULT 0,
    estimated_time INTEGER,
    actual_time INTEGER,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Price data table
CREATE TABLE price_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    symbol TEXT NOT NULL,
    chain_id INTEGER NOT NULL,
    price DECIMAL(20, 8) NOT NULL,
    volume_24h DECIMAL(20, 8) DEFAULT 0,
    market_cap DECIMAL(20, 2) DEFAULT 0,
    change_1h DECIMAL(10, 4) DEFAULT 0,
    change_24h DECIMAL(10, 4) DEFAULT 0,
    change_7d DECIMAL(10, 4) DEFAULT 0,
    source TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Price alerts table
CREATE TABLE price_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    condition alert_condition NOT NULL,
    target_price DECIMAL(20, 8),
    change_percentage DECIMAL(10, 4),
    is_active BOOLEAN DEFAULT true,
    triggered_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Liquidity positions table
CREATE TABLE liquidity_positions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    chain_id INTEGER NOT NULL,
    pool_address TEXT NOT NULL,
    token_a TEXT NOT NULL,
    token_b TEXT NOT NULL,
    liquidity TEXT NOT NULL,
    share DECIMAL(10, 6) NOT NULL,
    apy DECIMAL(10, 4) NOT NULL,
    rewards TEXT DEFAULT '0',
    impermanent_loss DECIMAL(10, 4) DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Liquidity pools table
CREATE TABLE liquidity_pools (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    chain_id INTEGER NOT NULL,
    address TEXT NOT NULL,
    name TEXT NOT NULL,
    token_a TEXT NOT NULL,
    token_b TEXT NOT NULL,
    total_liquidity TEXT NOT NULL,
    available_liquidity TEXT NOT NULL,
    utilization_rate DECIMAL(10, 4) NOT NULL,
    apy DECIMAL(10, 4) NOT NULL,
    health_score DECIMAL(5, 2) NOT NULL,
    warning_level warning_level DEFAULT 'normal',
    last_rebalance TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(chain_id, address)
);

-- Notifications table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    priority notification_priority NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    action_url TEXT,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Portfolio snapshots table
CREATE TABLE portfolio_snapshots (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    total_value DECIMAL(20, 2) NOT NULL,
    total_value_change DECIMAL(10, 4) NOT NULL,
    total_tokens DECIMAL(20, 8) NOT NULL,
    token_change DECIMAL(10, 4) NOT NULL,
    active_chains INTEGER NOT NULL,
    connected_wallets INTEGER NOT NULL,
    liquidity_value DECIMAL(20, 2) NOT NULL,
    liquidity_positions INTEGER NOT NULL,
    chain_balances JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trading history table
CREATE TABLE trading_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    symbol TEXT NOT NULL,
    type trading_type NOT NULL,
    amount TEXT NOT NULL,
    price DECIMAL(20, 8) NOT NULL,
    total_value DECIMAL(20, 2) NOT NULL,
    fee TEXT NOT NULL,
    status transaction_status DEFAULT 'pending',
    chain_id INTEGER NOT NULL,
    transaction_hash TEXT,
    pnl DECIMAL(20, 2),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Bridge transfers table
CREATE TABLE bridge_transfers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    from_chain INTEGER NOT NULL,
    to_chain INTEGER NOT NULL,
    from_address TEXT NOT NULL,
    to_address TEXT NOT NULL,
    amount TEXT NOT NULL,
    token_symbol TEXT NOT NULL,
    status bridge_status DEFAULT 'pending',
    source_tx_hash TEXT,
    destination_tx_hash TEXT,
    fee TEXT NOT NULL,
    estimated_time INTEGER,
    actual_time INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Analytics events table
CREATE TABLE analytics_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    event_type TEXT NOT NULL,
    event_data JSONB NOT NULL,
    session_id TEXT,
    user_agent TEXT,
    ip_address INET,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_wallet_address ON users(wallet_address);
CREATE INDEX idx_users_internet_identity ON users(internet_identity_principal);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_last_active ON users(last_active_at);

CREATE INDEX idx_connected_wallets_user_id ON connected_wallets(user_id);
CREATE INDEX idx_connected_wallets_address ON connected_wallets(address);
CREATE INDEX idx_connected_wallets_chain_id ON connected_wallets(chain_id);
CREATE INDEX idx_connected_wallets_is_active ON connected_wallets(is_active);

CREATE INDEX idx_transactions_user_id ON transactions(user_id);
CREATE INDEX idx_transactions_hash ON transactions(hash);
CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_type ON transactions(type);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);
CREATE INDEX idx_transactions_from_address ON transactions(from_address);
CREATE INDEX idx_transactions_to_address ON transactions(to_address);

CREATE INDEX idx_price_data_symbol ON price_data(symbol);
CREATE INDEX idx_price_data_chain_id ON price_data(chain_id);
CREATE INDEX idx_price_data_created_at ON price_data(created_at);
CREATE INDEX idx_price_data_symbol_chain_created ON price_data(symbol, chain_id, created_at);

CREATE INDEX idx_price_alerts_user_id ON price_alerts(user_id);
CREATE INDEX idx_price_alerts_symbol ON price_alerts(symbol);
CREATE INDEX idx_price_alerts_is_active ON price_alerts(is_active);

CREATE INDEX idx_liquidity_positions_user_id ON liquidity_positions(user_id);
CREATE INDEX idx_liquidity_positions_chain_id ON liquidity_positions(chain_id);
CREATE INDEX idx_liquidity_positions_is_active ON liquidity_positions(is_active);

CREATE INDEX idx_liquidity_pools_chain_id ON liquidity_pools(chain_id);
CREATE INDEX idx_liquidity_pools_address ON liquidity_pools(address);
CREATE INDEX idx_liquidity_pools_apy ON liquidity_pools(apy);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_type ON notifications(type);
CREATE INDEX idx_notifications_priority ON notifications(priority);
CREATE INDEX idx_notifications_is_read ON notifications(is_read);
CREATE INDEX idx_notifications_created_at ON notifications(created_at);

CREATE INDEX idx_portfolio_snapshots_user_id ON portfolio_snapshots(user_id);
CREATE INDEX idx_portfolio_snapshots_created_at ON portfolio_snapshots(created_at);

CREATE INDEX idx_trading_history_user_id ON trading_history(user_id);
CREATE INDEX idx_trading_history_symbol ON trading_history(symbol);
CREATE INDEX idx_trading_history_type ON trading_history(type);
CREATE INDEX idx_trading_history_created_at ON trading_history(created_at);

CREATE INDEX idx_bridge_transfers_user_id ON bridge_transfers(user_id);
CREATE INDEX idx_bridge_transfers_status ON bridge_transfers(status);
CREATE INDEX idx_bridge_transfers_created_at ON bridge_transfers(created_at);

CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_events_created_at ON analytics_events(created_at);

-- Create triggers for updated_at timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_connected_wallets_updated_at BEFORE UPDATE ON connected_wallets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_price_alerts_updated_at BEFORE UPDATE ON price_alerts FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_liquidity_positions_updated_at BEFORE UPDATE ON liquidity_positions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_liquidity_pools_updated_at BEFORE UPDATE ON liquidity_pools FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_trading_history_updated_at BEFORE UPDATE ON trading_history FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_bridge_transfers_updated_at BEFORE UPDATE ON bridge_transfers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) policies
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE connected_wallets ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE price_alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE liquidity_positions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE portfolio_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE trading_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE bridge_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Users can only access their own data
CREATE POLICY "Users can view own profile" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can view own wallets" ON connected_wallets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own wallets" ON connected_wallets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own wallets" ON connected_wallets FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own wallets" ON connected_wallets FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own transactions" ON transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own transactions" ON transactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own transactions" ON transactions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own price alerts" ON price_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own price alerts" ON price_alerts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own price alerts" ON price_alerts FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own price alerts" ON price_alerts FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own liquidity positions" ON liquidity_positions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own liquidity positions" ON liquidity_positions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own liquidity positions" ON liquidity_positions FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own notifications" ON notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own notifications" ON notifications FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own notifications" ON notifications FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own notifications" ON notifications FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own portfolio snapshots" ON portfolio_snapshots FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own portfolio snapshots" ON portfolio_snapshots FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own trading history" ON trading_history FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own trading history" ON trading_history FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own trading history" ON trading_history FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own bridge transfers" ON bridge_transfers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own bridge transfers" ON bridge_transfers FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own bridge transfers" ON bridge_transfers FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can view own analytics events" ON analytics_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own analytics events" ON analytics_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Public read access for price data and liquidity pools
ALTER TABLE price_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE liquidity_pools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view price data" ON price_data FOR SELECT USING (true);
CREATE POLICY "Anyone can view liquidity pools" ON liquidity_pools FOR SELECT USING (true);

-- Service role can insert/update price data and liquidity pools
CREATE POLICY "Service role can manage price data" ON price_data FOR ALL USING (auth.role() = 'service_role');
CREATE POLICY "Service role can manage liquidity pools" ON liquidity_pools FOR ALL USING (auth.role() = 'service_role');

-- Functions for common operations
CREATE OR REPLACE FUNCTION get_user_portfolio_summary(user_uuid UUID)
RETURNS TABLE (
    total_value DECIMAL,
    total_tokens DECIMAL,
    active_chains INTEGER,
    connected_wallets INTEGER,
    liquidity_value DECIMAL,
    liquidity_positions INTEGER
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COALESCE(ps.total_value, 0) as total_value,
        COALESCE(ps.total_tokens, 0) as total_tokens,
        COALESCE(ps.active_chains, 0) as active_chains,
        COALESCE(ps.connected_wallets, 0) as connected_wallets,
        COALESCE(ps.liquidity_value, 0) as liquidity_value,
        COALESCE(ps.liquidity_positions, 0) as liquidity_positions
    FROM portfolio_snapshots ps
    WHERE ps.user_id = user_uuid
    ORDER BY ps.created_at DESC
    LIMIT 1;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION get_user_unread_notifications_count(user_uuid UUID)
RETURNS INTEGER AS $$
DECLARE
    unread_count INTEGER;
BEGIN
    SELECT COUNT(*)
    INTO unread_count
    FROM notifications
    WHERE user_id = user_uuid AND is_read = false;
    
    RETURN COALESCE(unread_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to clean up old data
CREATE OR REPLACE FUNCTION cleanup_old_data()
RETURNS void AS $$
BEGIN
    -- Delete price data older than 1 year
    DELETE FROM price_data 
    WHERE created_at < NOW() - INTERVAL '1 year';
    
    -- Delete analytics events older than 6 months
    DELETE FROM analytics_events 
    WHERE created_at < NOW() - INTERVAL '6 months';
    
    -- Delete read notifications older than 3 months
    DELETE FROM notifications 
    WHERE is_read = true AND created_at < NOW() - INTERVAL '3 months';
    
    -- Delete portfolio snapshots older than 1 year (keep monthly snapshots)
    DELETE FROM portfolio_snapshots 
    WHERE created_at < NOW() - INTERVAL '1 year'
    AND id NOT IN (
        SELECT DISTINCT ON (DATE_TRUNC('month', created_at)) id
        FROM portfolio_snapshots
        WHERE created_at < NOW() - INTERVAL '1 year'
        ORDER BY DATE_TRUNC('month', created_at), created_at DESC
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a scheduled job to run cleanup (requires pg_cron extension)
-- SELECT cron.schedule('cleanup-old-data', '0 2 * * 0', 'SELECT cleanup_old_data();');

-- Insert some initial data
INSERT INTO liquidity_pools (chain_id, address, name, token_a, token_b, total_liquidity, available_liquidity, utilization_rate, apy, health_score) VALUES
(1, '0x1234567890123456789012345678901234567890', 'BTM/ETH Pool', 'BTM', 'ETH', '1000000', '800000', 80.0, 12.5, 95.0),
(56, '0x2345678901234567890123456789012345678901', 'BTM/BNB Pool', 'BTM', 'BNB', '500000', '400000', 80.0, 15.2, 92.0),
(8453, '0x3456789012345678901234567890123456789012', 'BTM/USDC Pool', 'BTM', 'USDC', '750000', '600000', 80.0, 10.8, 98.0);

-- Insert initial price data
INSERT INTO price_data (symbol, chain_id, price, volume_24h, market_cap, change_1h, change_24h, change_7d, source) VALUES
('BTM', 1, 0.0025, 150000, 2500000, 0.5, 2.3, -1.2, 'coingecko'),
('BTM', 56, 0.0024, 120000, 2400000, 0.3, 2.1, -1.5, 'pancakeswap'),
('BTM', 8453, 0.0025, 80000, 2500000, 0.4, 2.2, -1.1, 'uniswap');

COMMIT;