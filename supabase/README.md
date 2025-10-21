# Supabase Configuration

This folder contains all Supabase-related configuration and migration files.

## Structure

```
supabase/
├── migrations/           # SQL migration files (applied in sequence)
│   ├── 001_initial_schema.sql
│   ├── 002_fix_decimal_types.sql
│   └── README.md
└── README.md            # This file
```

## Quick Links

- **Migrations**: See `migrations/README.md` for database schema changes
- **Setup Guide**: See `../SUPABASE_SETUP.md` for initial setup instructions
- **Integration Guide**: See `../SUPABASE_README.md` for API usage and integration details

## Applied Migrations

| Migration | Status | Date Applied |
|-----------|--------|--------------|
| 001_initial_schema.sql | ✅ Applied | 2025-10-21 |
| 002_fix_decimal_types.sql | ✅ Applied | 2025-10-21 |
| 003_simplify_sessions_schema.sql | ⏳ **PENDING** | **APPLY NOW** |

## Environment Variables

Your `.env` file should contain:

```env
EXPO_PUBLIC_SUPABASE_URL=your_supabase_project_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

Get these values from: **Supabase Dashboard** → **Settings** → **API**

## Database Schema Version

**⚠️ Action Required**: Apply migration 003
- Target version: **003**
- Current version: **002**
- See `migrations/APPLY_MIGRATION_003.md` for instructions

## Support

For issues or questions:
1. Check the migration README: `migrations/README.md`
2. Review setup guide: `../SUPABASE_SETUP.md`
3. Check Supabase logs in the dashboard
