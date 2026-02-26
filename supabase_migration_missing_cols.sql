-- Run this in Supabase SQL Editor to add missing columns
-- These columns were added by the app but not in the original schema

-- Add motivation_letter to tailored_outputs
ALTER TABLE tailored_outputs
  ADD COLUMN IF NOT EXISTS motivation_letter text DEFAULT '',
  ADD COLUMN IF NOT EXISTS ats_score integer;

-- Note: resumes.template_id is NOT needed — template preference is stored inside resume_json
-- The app reads/writes resume_json which already contains all CV data including template selection

-- Verify the resumes table looks correct:
-- SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'resumes';
