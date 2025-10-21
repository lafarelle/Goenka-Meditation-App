# Apply Migration 003: Simplify Sessions Schema

This migration simplifies the database schema to only track essential session information and fixes all data type issues.

## ⚠️ Important Notes

- This migration will **DROP and RECREATE** the `meditation_sessions` table
- **All existing session data will be lost**
- Since you're just getting started, this is fine
- User data in the `users` table will NOT be affected

## Steps to Apply

### 1. Go to Supabase Dashboard

Navigate to: https://supabase.com/dashboard

### 2. Open SQL Editor

- Click on **SQL Editor** in the left sidebar
- Click **New Query**

### 3. Copy and Run the Migration

Copy the **entire contents** of `003_simplify_sessions_schema.sql` and paste into the SQL editor.

Then click **Run** or press Cmd/Ctrl + Enter.

### 4. Verify the Changes

After running the migration:

1. Go to **Table Editor** → **meditation_sessions**
2. You should see the simplified schema with these columns:
   - `id` (TEXT)
   - `user_id` (UUID)
   - `created_at` (TIMESTAMPTZ)
   - `started_at` (TIMESTAMPTZ)
   - `ended_at` (TIMESTAMPTZ)
   - `total_duration_minutes` (INTEGER)
   - `actual_duration_minutes` (REAL)
   - `completed` (BOOLEAN)
   - `completion_percentage` (REAL)
   - `audio_ids` (TEXT[])
   - `metadata` (JSONB)

### 5. Restart Your App

```bash
# Stop your dev server (Ctrl+C)
npm start
```

### 6. Test

Complete a meditation session and verify:
- No errors in the console
- Session appears in Supabase **Table Editor** → **meditation_sessions**

## What This Migration Does

### Removed Fields
- ❌ `stopped_at` - Removed (not needed, caused type errors)
- ❌ `preferences` - Removed (too complex, not essential)
- ❌ `segments` - Removed (too complex, not essential)
- ❌ `calculated_durations` - Removed (too complex, not essential)
- ❌ `playback_sequence` - Removed (too complex, not essential)

### Simplified Fields
- ✅ `id` - Changed from UUID to TEXT (matches app-generated IDs)
- ✅ `actual_duration_minutes` - Stores actual time in minutes (REAL for decimals)
- ✅ `audio_ids` - Simple array of audio IDs used (TEXT[])
- ✅ `metadata` - Optional JSONB for future flexibility

### Benefits
- ✅ No more type conversion errors
- ✅ Works offline with sync queue
- ✅ Simpler, more reliable
- ✅ Only tracks what matters: when, how long, completion rate, audios

## Offline-First Features Added

The app now includes:

1. **Sync Queue**: Sessions are queued when offline
2. **Auto-Sync**: When internet returns, queued sessions sync automatically
3. **Network Listener**: Detects connectivity changes
4. **No Errors**: App works perfectly offline, syncs when possible

## Troubleshooting

### Migration fails with "table does not exist"

This is fine - it means you don't have any data yet. The migration creates the table fresh.

### Still getting sync errors

1. Make sure you applied migration 003
2. Restart your app completely
3. Check Supabase logs: **Dashboard** → **Logs** → **Postgres Logs**

### Want to verify migration was applied

Run this in Supabase SQL Editor:

```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'meditation_sessions'
ORDER BY ordinal_position;
```

You should see the simplified schema.

---

## Next Steps

After applying this migration:

1. ✅ Update `supabase/MIGRATION_STATUS.md` to mark migration 003 as applied
2. ✅ Update `supabase/README.md` to show version 003
3. ✅ Test the app offline and online
4. ✅ Verify sessions sync to Supabase

Enjoy your working offline-first meditation app! 🧘‍♂️
