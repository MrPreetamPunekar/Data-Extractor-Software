-- database-schema.sql
-- PostgreSQL database schema for AI-Powered Business Data Extractor

-- Create database
CREATE DATABASE data_extractor;

-- Connect to the database
\c data_extractor;

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on email for faster lookups
CREATE INDEX idx_users_email ON users(email);

-- Jobs table
CREATE TABLE jobs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    keyword VARCHAR(255),
    location VARCHAR(255),
    source VARCHAR(50) NOT NULL, -- 'web_search', 'file_upload', 'api'
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    total_records INTEGER DEFAULT 0,
    processed_records INTEGER DEFAULT 0,
    failed_records INTEGER DEFAULT 0,
    progress INTEGER DEFAULT 0, -- Percentage 0-100
    started_at TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for jobs
CREATE INDEX idx_jobs_user_id ON jobs(user_id);
CREATE INDEX idx_jobs_status ON jobs(status);
CREATE INDEX idx_jobs_created_at ON jobs(created_at);

-- Records table
CREATE TABLE records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    business_name VARCHAR(255),
    email VARCHAR(255),
    phone VARCHAR(50),
    address TEXT,
    website VARCHAR(255),
    source_url TEXT,
    confidence NUMERIC(3,2), -- 0.00 to 1.00
    is_duplicate BOOLEAN DEFAULT false,
    email_valid BOOLEAN DEFAULT NULL, -- NULL = not checked, true = valid, false = invalid
    phone_valid BOOLEAN DEFAULT NULL, -- NULL = not checked, true = valid, false = invalid
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for records
CREATE INDEX idx_records_job_id ON records(job_id);
CREATE INDEX idx_records_email ON records(email);
CREATE INDEX idx_records_phone ON records(phone);
CREATE INDEX idx_records_business_name ON records(business_name);
CREATE INDEX idx_records_is_duplicate ON records(is_duplicate);
CREATE INDEX idx_records_confidence ON records(confidence);

-- Exports table
CREATE TABLE exports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    format VARCHAR(10) NOT NULL, -- 'csv', 'xlsx'
    filename VARCHAR(255) NOT NULL,
    record_count INTEGER NOT NULL,
    download_url VARCHAR(500),
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for exports
CREATE INDEX idx_exports_job_id ON exports(job_id);
CREATE INDEX idx_exports_created_at ON exports(created_at);
CREATE INDEX idx_exports_expires_at ON exports(expires_at);

-- Raw data table for storing original scraped content
CREATE TABLE raw_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    source_url TEXT NOT NULL,
    content TEXT, -- Raw HTML or JSON content
    content_type VARCHAR(50), -- 'html', 'json', 'text'
    http_status INTEGER,
    scrape_duration INTEGER, -- In milliseconds
    user_agent VARCHAR(255),
    ip_address VARCHAR(45),
    tos_compliant BOOLEAN DEFAULT true,
    requires_review BOOLEAN DEFAULT false,
    captcha_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for raw_data
CREATE INDEX idx_raw_data_job_id ON raw_data(job_id);
CREATE INDEX idx_raw_data_source_url ON raw_data(source_url);
CREATE INDEX idx_raw_data_requires_review ON raw_data(requires_review);

-- Proxy servers table for managing scraping proxies
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

-- Audit log table for tracking actions
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL, -- 'scrape', 'export', 'login', 'config_change'
    resource_type VARCHAR(50), -- 'job', 'record', 'export'
    resource_id UUID,
    details JSONB, -- Additional action details
    ip_address VARCHAR(45),
    user_agent VARCHAR(255),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for audit_logs
CREATE INDEX idx_audit_logs_user_id ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_action ON audit_logs(action);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers to automatically update updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_jobs_updated_at BEFORE UPDATE ON jobs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_records_updated_at BEFORE UPDATE ON records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_proxy_servers_updated_at BEFORE UPDATE ON proxy_servers FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Sample data for testing
-- Insert a test user (password_hash is 'password123' hashed with bcrypt)
INSERT INTO users (email, password_hash, first_name, last_name) VALUES 
('test@example.com', '$2b$10$8K1p/a0dhrxiowP.dnkgNORTWgdEDHn5L2/xjpEWuC.QQv4rKO9jO', 'Test', 'User');

-- Insert sample proxy server
INSERT INTO proxy_servers (host, port, is_active) VALUES 
('proxy.example.com', 8080, true);

-- Query examples

-- Get all jobs for a user with record counts
-- SELECT j.*, COUNT(r.id) as record_count 
-- FROM jobs j 
-- LEFT JOIN records r ON j.id = r.job_id 
-- WHERE j.user_id = 'user-uuid' 
-- GROUP BY j.id;

-- Get records for a job with filtering
-- SELECT * FROM records 
-- WHERE job_id = 'job-uuid' 
-- AND (email IS NOT NULL OR phone IS NOT NULL) 
-- AND is_duplicate = false 
-- ORDER BY confidence DESC;

-- Get export history for a job
-- SELECT * FROM exports 
-- WHERE job_id = 'job-uuid' 
-- ORDER BY created_at DESC;

-- Update job progress
-- UPDATE jobs 
-- SET progress = 50, processed_records = 100 
-- WHERE id = 'job-uuid';

-- Mark records as duplicates
-- UPDATE records 
-- SET is_duplicate = true 
-- WHERE job_id = 'job-uuid' 
-- AND email IN (
--   SELECT email 
--   FROM records 
--   WHERE job_id = 'job-uuid' 
--   GROUP BY email 
--   HAVING COUNT(*) > 1
-- );