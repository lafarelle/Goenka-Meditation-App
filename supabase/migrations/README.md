# Database Migrations

This folder contains SQL migration files for the Supabase database schema.

## Migration Files

Migrations are numbered sequentially and should be run in order:

### 001_initial_schema.sql
- **Status**: ✅ Applied
- **Date**: 2025-10-21
- **Description**: Initial database schema
- **Changes**:
  - Create `users` table for anonymous user tracking
  - Create `meditation_sessions` table for session history
  - Add indexes for performance
  - Set up Row Level Security (RLS) policies
  - Create auto-update trigger for `updated_at` column

### 002_fix_decimal_types.sql
- **Status**: ✅ Applied
- **Date**: 2025-10-21
- **Description**: Fix data types for decimal values
- **Changes**:
  - Change `stopped_at` from INTEGER to REAL
  - Change `actual_duration_sec` from INTEGER to REAL
  - Change `completion_percentage` from INTEGER to REAL

## How to Apply Migrations

### Method 1: Manual Application (Current Approach)

1. Go to your Supabase Dashboard
2. Navigate to **SQL Editor**
3. Click **New Query**
4. Copy the contents of the migration file
5. Click **Run**
6. Mark the migration as applied in this README

### Method 2: Supabase CLI (Future)

If you want to use the Supabase CLI for migrations:

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref your-project-ref

# Apply pending migrations
supabase db push
```

## Creating New Migrations

When you need to modify the database schema:

1. **Create a new migration file** with the next sequential number:
   ```
   003_your_migration_name.sql
   ```

2. **Add a header comment** describing the migration:
   ```sql
   -- Migration 003: Your Migration Name
   -- Created: YYYY-MM-DD
   -- Description: What this migration does
   ```

3. **Write your SQL changes** (ALTER TABLE, CREATE TABLE, etc.)

4. **Update this README** with the migration details

5. **Test locally** before applying to production

6. **Apply to Supabase** using SQL Editor

7. **Mark as applied** in this README

## Migration Best Practices

- ✅ Always use sequential numbering (001, 002, 003, ...)
- ✅ Never modify existing migration files after they've been applied
- ✅ Always test migrations on a development database first
- ✅ Include rollback instructions if the migration is complex
- ✅ Keep migrations small and focused on one change
- ✅ Document what each migration does and why
- ✅ Back up your database before running migrations on production

## Rollback Instructions

If you need to rollback a migration, create a new migration that reverses the changes.

### Example: Rollback 002_fix_decimal_types.sql

```sql
-- Migration 003: Rollback decimal type changes
ALTER TABLE meditation_sessions
  ALTER COLUMN stopped_at TYPE INTEGER;

ALTER TABLE meditation_sessions
  ALTER COLUMN actual_duration_sec TYPE INTEGER;

ALTER TABLE meditation_sessions
  ALTER COLUMN completion_percentage TYPE INTEGER;
```

## Database Schema Version

Current schema version: **002**

Last updated: 2025-10-21
