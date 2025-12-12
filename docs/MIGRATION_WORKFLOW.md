# Database Migration Workflow

## Environment Overview

| Environment    | Supabase Project                          | Clerk Instance | Purpose           |
| -------------- | ----------------------------------------- | -------------- | ----------------- |
| **Local Dev**  | `cjbevtvvlthelhbjlqmp` (brrrr-loans-dev)  | `pk_test_*`    | Daily development |
| **Production** | `gsxggtsgqskhchcbrmhe` (brrrr-loans-prod) | `pk_live_*`    | Live users        |

## MCP Tool Reference

⚠️ **CRITICAL**: Know which MCP tools connect to which environment!

| MCP Tool Prefix                           | Connects To                               |
| ----------------------------------------- | ----------------------------------------- |
| `user-supabase-dev-*`                     | **DEVELOPMENT** - Safe for experiments    |
| `project-0-bl-1-lender-portal-supabase-*` | **PRODUCTION** - Use with extreme caution |

---

## Development Workflow

### 1. Feature Development (Daily Work)

```
Local Code → Dev Supabase → Test → PR → Merge → Deploy to Prod
```

1. **Write code locally** with `.env.local` pointing to DEV
2. **Create migrations** using `user-supabase-dev-apply_migration` (DEV MCP)
3. **Test thoroughly** on dev environment
4. **Create PR** with both code AND migration files
5. **Review & Merge** to main
6. **Deploy migrations to prod** ONLY after merge

### 2. Creating a New Migration

```bash
# Option A: Via Supabase CLI (preferred for complex migrations)
supabase migration new my_migration_name

# Option B: Via MCP Tool (for quick changes)
# Use: user-supabase-dev-apply_migration
# This applies to DEV and creates a migration record
```

### 3. Syncing Local Migration Files

After applying migrations via MCP, sync the SQL files locally:

```bash
# Pull remote migrations to local
supabase db pull --schema public

# Or manually create the .sql file matching what was applied
```

### 4. Deploying to Production

**NEVER** use `project-0-bl-1-lender-portal-supabase-apply_migration` directly!

Instead:

1. Ensure migration files are committed to git
2. Merge PR to main
3. Use Supabase CLI or Dashboard to apply:

```bash
# Link to production project
supabase link --project-ref gsxggtsgqskhchcbrmhe

# Push migrations
supabase db push
```

---

## Current State Recovery

### Issue: Production has migrations not in local files

**To sync local files with production:**

```bash
# 1. Link to production
supabase link --project-ref gsxggtsgqskhchcbrmhe

# 2. Pull the remote schema
supabase db pull

# 3. This creates migration files matching prod state
```

### Issue: Dev and Prod have diverged

If dev has experimental migrations that shouldn't go to prod:

1. Document which dev migrations are experimental
2. Reset dev branch if needed: `user-supabase-dev-reset_branch`
3. Re-apply only the migrations that should persist

---

## Best Practices

### ✅ DO:

- Always test migrations on DEV first
- Keep migration files in sync with what's applied
- Use descriptive migration names: `add_user_preferences_table`
- Include both UP and DOWN logic when possible
- Review migrations in PR before merging

### ❌ DON'T:

- Apply migrations directly to PROD via MCP
- Modify existing migration files after they're applied
- Skip testing on DEV
- Commit migrations without testing them

---

## Emergency Rollback

If a bad migration reaches production:

1. **Assess impact** - Is data at risk?
2. **Create a rollback migration** - Reverse the changes
3. **Test rollback on DEV** first
4. **Apply to PROD** via proper deployment

```sql
-- Example rollback migration
-- 20251212_rollback_bad_migration.sql

DROP TABLE IF EXISTS public.accidentally_created_table;

ALTER TABLE public.some_table
DROP COLUMN IF EXISTS accidentally_added_column;
```

---

## File Structure

```
supabase/
├── migrations/           # All migration SQL files (version controlled)
│   ├── 20251101_*.sql
│   └── 20251102_*.sql
├── seed.sql              # Test data for dev
└── config.toml           # Supabase CLI config
```

---

## Quick Reference Commands

```bash
# Check migration status
supabase migration list

# Create new migration
supabase migration new feature_name

# Apply pending migrations (to linked project)
supabase db push

# Pull remote schema changes
supabase db pull

# Reset local database
supabase db reset

# Generate TypeScript types
supabase gen types typescript --project-id <ref> > src/types/database.types.ts
```
