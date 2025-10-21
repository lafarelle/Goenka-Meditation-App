# Migration Status

Track which migrations have been applied to your Supabase database.

## Current Database Version: 003 (pending application)

---

## Migration History

### ✅ Migration 001: Initial Schema
- **File**: `001_initial_schema.sql`
- **Status**: Applied
- **Date Applied**: October 21, 2025
- **Applied By**: You
- **Description**: Created initial database schema with users and meditation_sessions tables
- **Tables Created**:
  - `users` - Anonymous user profiles
  - `meditation_sessions` - Session history and tracking

---

### ✅ Migration 002: Fix Decimal Types
- **File**: `002_fix_decimal_types.sql`
- **Status**: Applied
- **Date Applied**: October 21, 2025
- **Applied By**: You
- **Description**: Fixed data type mismatches for decimal values
- **Changes**:
  - `stopped_at`: INTEGER → REAL
  - `actual_duration_sec`: INTEGER → REAL
  - `completion_percentage`: INTEGER → REAL
- **Reason**: App was sending decimal values (e.g., 8.893) to integer columns

---

## How to Use This File

Mark each migration as applied by updating its status and date:

```markdown
### ✅ Migration XXX: Name
- **File**: `XXX_description.sql`
- **Status**: Applied
- **Date Applied**: YYYY-MM-DD
```

For pending migrations, use:

```markdown
### ⏳ Migration XXX: Name
- **File**: `XXX_description.sql`
- **Status**: Pending
- **Date Applied**: Not yet applied
```

For failed migrations, use:

```markdown
### ❌ Migration XXX: Name
- **File**: `XXX_description.sql`
- **Status**: Failed
- **Error**: Description of error
- **Date Attempted**: YYYY-MM-DD
```

---

### ⏳ Migration 003: Simplify Sessions Schema (PENDING - APPLY THIS NOW)
- **File**: `003_simplify_sessions_schema.sql`
- **Status**: Pending - **NEEDS TO BE APPLIED**
- **Instructions**: See `APPLY_MIGRATION_003.md` for step-by-step guide
- **Description**: Simplifies session tracking to essential data only
- **Why**: Fixes type errors and enables offline-first sync
- **Changes**:
  - Drops and recreates `meditation_sessions` table
  - Changes `id` from UUID to TEXT (matches app IDs)
  - Removes complex JSONB fields (`preferences`, `segments`, `playback_sequence`)
  - Adds simple `audio_ids` array (TEXT[])
  - Changes `actual_duration_sec` → `actual_duration_minutes` (REAL)
  - Removes `stopped_at` field (not needed)
- **Impact**: All existing session data will be lost (user data preserved)

---

## Next Steps

When you need to create a new migration:

1. Create file: `supabase/migrations/003_your_description.sql`
2. Write your SQL changes
3. Test in Supabase SQL Editor
4. Apply the migration
5. Update this file with the new migration status
6. Update `supabase/README.md` with the new version number

---

## Rollback History

No rollbacks have been performed yet.

If you need to rollback, create a new migration that reverses the changes, don't delete existing migrations.
