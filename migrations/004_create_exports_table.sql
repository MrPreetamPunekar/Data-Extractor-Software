-- migrations/004_create_exports_table.sql
-- Create exports table migration

-- Create exports table
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