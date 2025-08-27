# Database Migrations

This directory contains the database migration files for the AI-Powered Business Data Extractor application. Each migration file is numbered sequentially to ensure they are applied in the correct order.

## Migration Files

1. `001_create_users_table.sql` - Creates the users table for authentication
2. `002_create_jobs_table.sql` - Creates the jobs table for tracking extraction jobs
3. `003_create_records_table.sql` - Creates the records table for storing extracted business data
4. `004_create_exports_table.sql` - Creates the exports table for tracking export files
5. `005_create_raw_data_table.sql` - Creates the raw_data table for storing original scraped content
6. `006_create_proxy_servers_table.sql` - Creates the proxy_servers table for managing scraping proxies
7. `007_create_audit_logs_table.sql` - Creates the audit_logs table for tracking user actions

## Applying Migrations

To apply these migrations to your PostgreSQL database, you can use one of the following methods:

### Method 1: Using psql

```bash
# Navigate to the migrations directory
cd migrations

# Apply each migration in order
psql -U your_username -d your_database -f 001_create_users_table.sql
psql -U your_username -d your_database -f 002_create_jobs_table.sql
psql -U your_username -d your_database -f 003_create_records_table.sql
psql -U your_username -d your_database -f 004_create_exports_table.sql
psql -U your_username -d your_database -f 005_create_raw_data_table.sql
psql -U your_username -d your_database -f 006_create_proxy_servers_table.sql
psql -U your_username -d your_database -f 007_create_audit_logs_table.sql
```

### Method 2: Using a migration tool

If you're using a migration tool like `node-pg-migrate` or similar, you can configure it to use these SQL files.

## Migration Order

It's important to apply these migrations in numerical order because some tables have foreign key relationships:

1. Users table must be created first (referenced by jobs)
2. Jobs table must be created before records and exports (referenced by both)
3. Other tables can be created in any order after their dependencies

## Rolling Back Migrations

To roll back migrations, you would need to create corresponding down migration files. These would typically contain `DROP TABLE` statements in reverse order.

## Adding New Migrations

When adding new migrations:

1. Create a new file with the next sequential number
2. Name it descriptively (e.g., `008_add_indexes_to_records.sql`)
3. Include both up and down migration logic if possible
4. Test the migration on a development database before applying to production

## Sample Data

The main database schema file (`database-schema.sql`) includes sample data for testing purposes. This is not included in the individual migration files to keep them focused on schema changes only.