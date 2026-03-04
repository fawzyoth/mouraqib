-- Clean up stale feature_flags rows for owner/manager roles
-- These rows survived the role migration (012_roles.sql) because
-- owner and manager existed in both old and new role systems.
-- The opt-out model defaults to enabled when no row exists,
-- so removing these stale enabled=false rows restores full access.

DELETE FROM feature_flags
WHERE role IN ('owner', 'manager') AND enabled = false;
