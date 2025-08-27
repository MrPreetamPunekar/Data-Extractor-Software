-- migrations/005_create_raw_data_table.sql
-- Create raw_data table migration

-- Create raw_data table
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