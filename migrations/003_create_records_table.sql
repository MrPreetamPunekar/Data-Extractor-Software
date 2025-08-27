-- migrations/003_create_records_table.sql
-- Create records table migration

-- Create records table
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

-- Trigger to automatically update updated_at
CREATE TRIGGER update_records_updated_at BEFORE UPDATE ON records FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();