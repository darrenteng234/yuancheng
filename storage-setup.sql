-- Run this in the NEW Supabase project's SQL Editor (Storage bucket + policies).
-- Must run AFTER supabase-schema.sql (the ADD COLUMN statements need those tables).

-- Public bucket for evidence/media. Bucket-level caps must be >= the app's caps
-- (src/app/api/upload/route.ts enforces per-type: images 5MB, video 50MB).
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'believer',
  'believer',
  true,
  52428800, -- 50MB (largest allowed = video; the API enforces 5MB for images)
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg',
        'video/mp4', 'video/webm', 'video/quicktime']
)
ON CONFLICT (id) DO UPDATE
  SET file_size_limit   = EXCLUDED.file_size_limit,
      allowed_mime_types = EXCLUDED.allowed_mime_types,
      public             = EXCLUDED.public;

-- Access model:
--   * Reads: public. Evidence is served via getPublicUrl(); paths are unguessable
--     (timestamp + random). Anyone WITH the URL can view — acceptable for V1.
--   * Writes: performed ONLY by /api/upload using the SERVICE ROLE key, which
--     BYPASSES RLS. So we deliberately create NO insert/update policy for the
--     anon/authenticated (browser) roles — the public anon key cannot write to
--     storage directly. This closes the direct-upload bypass of requireStaff().
DROP POLICY IF EXISTS "Public read access" ON storage.objects;
DROP POLICY IF EXISTS "Allow uploads" ON storage.objects;
DROP POLICY IF EXISTS "Allow updates" ON storage.objects;

CREATE POLICY "believer_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'believer');

-- photos columns used by the temple-era catalog pages (needs supabase-schema.sql).
ALTER TABLE temples  ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}';
ALTER TABLE products ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}';
ALTER TABLE packages ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}';
