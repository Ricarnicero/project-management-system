-- Migration: Remove Projects and restructure to Cliente -> Requerimiento
-- This migration removes the projects table and updates documentation and alerts to reference requirements

-- Step 1: Validate that all requirements have a client_id
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM requirements WHERE client_id IS NULL) THEN
        RAISE EXCEPTION 'Cannot proceed: Some requirements do not have a client_id';
    END IF;
END $$;

-- Step 2: Drop existing documentation and alerts data (cannot be migrated without project context)
DELETE FROM documentation;
DELETE FROM alerts;

-- Step 3-5: Update documentation table
ALTER TABLE documentation DROP CONSTRAINT IF EXISTS documentation_project_id_fkey;
ALTER TABLE documentation ADD COLUMN requirement_id uuid REFERENCES requirements(id) ON DELETE CASCADE;
ALTER TABLE documentation DROP COLUMN project_id;
ALTER TABLE documentation ALTER COLUMN requirement_id SET NOT NULL;

-- Step 6-8: Update alerts table
ALTER TABLE alerts DROP CONSTRAINT IF EXISTS alerts_project_id_fkey;
ALTER TABLE alerts ADD COLUMN requirement_id uuid REFERENCES requirements(id) ON DELETE CASCADE;
ALTER TABLE alerts DROP COLUMN project_id;
ALTER TABLE alerts ALTER COLUMN requirement_id SET NOT NULL;

-- Step 9-11: Update requirements table
ALTER TABLE requirements DROP CONSTRAINT IF EXISTS requirements_project_id_fkey;
ALTER TABLE requirements DROP COLUMN project_id;
ALTER TABLE requirements ALTER COLUMN client_id SET NOT NULL;

-- Step 12: Drop projects table
DROP TABLE IF EXISTS projects CASCADE;

-- Step 13: Drop project_status enum type
DROP TYPE IF EXISTS project_status;
