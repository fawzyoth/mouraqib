-- New organizations should have all features disabled by default.
-- The opt-in model already returns false when no row exists,
-- so we just remove the trigger that was seeding enabled=true rows.

DROP TRIGGER IF EXISTS trg_seed_feature_flags ON organizations;
DROP FUNCTION IF EXISTS seed_org_feature_flags();
