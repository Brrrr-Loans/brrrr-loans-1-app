# Documentation

This directory contains all project documentation organized by purpose and relevance.

## 📁 Directory Structure

### `guides/` - Developer & User Guides

Reference documentation for developers and users working with specific features.

- **[BADGE_VARIANTS_GUIDE.md](guides/BADGE_VARIANTS_GUIDE.md)** - Badge component variants and usage
- **[LYTENYTE_QUICK_REFERENCE.md](guides/LYTENYTE_QUICK_REFERENCE.md)** - LyteNyte quick reference
- **[LYTENYTE_USAGE_GUIDE.md](guides/LYTENYTE_USAGE_GUIDE.md)** - Detailed LyteNyte usage guide
- **[TRANSACTION_REFACTORING_GUIDE.md](guides/TRANSACTION_REFACTORING_GUIDE.md)** - Transaction refactoring patterns
- **[UX_IMPROVEMENTS_GUIDE.md](guides/UX_IMPROVEMENTS_GUIDE.md)** - UX improvement guidelines

### `integrations/` - Third-Party Integration Documentation

Documentation for external service integrations (Brex, etc.).

- **[BREX_API_LIMITATIONS.md](integrations/BREX_API_LIMITATIONS.md)** - Known Brex API limitations
- **[BREX_COLUMN_RENAME_SUMMARY.md](integrations/BREX_COLUMN_RENAME_SUMMARY.md)** - Brex column naming changes
- **[BREX_STATUS_EXPLANATION.md](integrations/BREX_STATUS_EXPLANATION.md)** - Brex status code explanations
- **[BREX_SYNC_UPDATE_TESTING.md](integrations/BREX_SYNC_UPDATE_TESTING.md)** - Brex sync testing documentation

### `setup/` - Setup & Configuration

Contains current, actively maintained guides for setting up and configuring the project.

- **[SUPABASE_SETUP.md](setup/SUPABASE_SETUP.md)** - Supabase configuration and setup
- **[POSTGRES_UPGRADE_INSTRUCTIONS.md](setup/POSTGRES_UPGRADE_INSTRUCTIONS.md)** - PostgreSQL upgrade instructions

### `testing/` - Testing Documentation

Test reports, testing strategies, and QA documentation.

- **[TESTING_SUMMARY.md](testing/TESTING_SUMMARY.md)** - Testing strategy and summary
- **[DASHBOARD_TESTING_REPORT.md](testing/DASHBOARD_TESTING_REPORT.md)** - Dashboard testing report

### `progress/` - Feature Progress Tracking

Active feature development tracking and progress reports.

- **[TRANSFER_VENDOR_MATCHING_PROGRESS.md](progress/TRANSFER_VENDOR_MATCHING_PROGRESS.md)** - Transfer-vendor matching feature progress

### `summaries/` - Change Summaries

Documentation of significant changes, fixes, and completions.

- **[BADGE_FIX_SUMMARY.md](summaries/BADGE_FIX_SUMMARY.md)** - Badge component fix summary
- **[ENV_VARIABLE_CLEANUP_SUMMARY.md](summaries/ENV_VARIABLE_CLEANUP_SUMMARY.md)** - Environment variable cleanup
- **[SECURITY_FIX_SUMMARY.md](summaries/SECURITY_FIX_SUMMARY.md)** - Security fix summary
- **[TRANSACTIONS_TABLE_COMPLETE.md](summaries/TRANSACTIONS_TABLE_COMPLETE.md)** - Transactions table completion

### `reviews/` - Code Reviews & Analysis

Documentation from code reviews, audits, and analysis sessions.

- **[SUPABASE_CODE_REVIEW.md](reviews/SUPABASE_CODE_REVIEW.md)** - Supabase database schema and code review

### `historical/` - Past Issues & Resolutions (Archived)

Documentation of past problems and their solutions. Preserved for reference but represent issues that have been resolved.

- **[TABLE_NAME_FIX_SUMMARY.md](historical/TABLE_NAME_FIX_SUMMARY.md)** - Database table naming fixes (resolved)
- **[FINAL_EXECUTION_GUIDE.md](historical/FINAL_EXECUTION_GUIDE.md)** - Final database migration steps (completed)
- **[STEP_BY_STEP_EXECUTION_GUIDE.md](historical/STEP_BY_STEP_EXECUTION_GUIDE.md)** - Detailed database fix steps (completed)

⚠️ **Note**: Files in `historical/` document past issues that have been resolved. They are kept for institutional knowledge but should not be needed for normal project setup.

---

## 🎯 Quick Start

**New to the project?** Start with:
1. [`setup/SUPABASE_SETUP.md`](setup/SUPABASE_SETUP.md) - Supabase configuration
2. [`guides/`](guides/) - Feature-specific documentation

**Working on integrations?** Check:
- [`integrations/`](integrations/) - Third-party service documentation

**Need historical context?** Check:
- [`historical/`](historical/) - Past issues and resolutions

---

## 📝 Contributing to Documentation

When adding new documentation, place it in the appropriate directory:

| Type of Documentation | Directory |
|-----------------------|-----------|
| Feature/usage guides | `guides/` |
| External integrations | `integrations/` |
| Setup instructions | `setup/` |
| Test reports | `testing/` |
| Feature progress | `progress/` |
| Change summaries | `summaries/` |
| Code reviews | `reviews/` |
| Resolved issues | `historical/` |

Keep this README updated when adding new documentation.
