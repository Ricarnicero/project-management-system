-- Add position column to requirements table
ALTER TABLE public.requirements 
ADD COLUMN position INTEGER DEFAULT 0;

-- Update existing records to have a default position (optional, but good practice)
-- This simple update just gives them all 0, but they can be reordered later.
UPDATE public.requirements SET position = 0 WHERE position IS NULL;
