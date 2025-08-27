-- migrations/006_create_proxy_servers_table.sql
-- Create proxy_servers table migration

-- Create proxy_servers table
CREATE TABLE proxy_servers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    host VARCHAR(255) NOT NULL,
    port INTEGER NOT NULL,
    username VARCHAR(100),
    password VARCHAR(255),
    is_active BOOLEAN DEFAULT true,
    last_used TIMESTAMP WITH TIME ZONE,
    success_count INTEGER DEFAULT 0,
    fail_count INTEGER DEFAULT 0,
    avg_response_time INTEGER, -- In milliseconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for proxy_servers
CREATE INDEX idx_proxy_servers_is_active ON proxy_servers(is_active);
CREATE INDEX idx_proxy_servers_last_used ON proxy_servers(last_used);

-- Trigger to automatically update updated_at
CREATE TRIGGER update_proxy_servers_updated_at BEFORE UPDATE ON proxy_servers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();