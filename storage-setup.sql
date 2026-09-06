-- Run this in Supabase SQL Editor to create the storage bucket
-- https://supabase.com/dashboard/project/jizagahrnywfohhwcpoh/sql/new

-- Create public bucket for believer images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'believer',
  'believer',
  true,
  5242880, -- 5MB
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/jpg']
)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access
CREATE POLICY "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'believer');

-- Allow authenticated uploads
CREATE POLICY "Allow uploads" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'believer');

-- Allow updates
CREATE POLICY "Allow updates" ON storage.objects
  FOR UPDATE USING (bucket_id = 'believer');

-- Add photos column to temples if not exists
ALTER TABLE temples ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}';

-- Add photos column to products if not exists
ALTER TABLE products ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}';

-- Add photos column to packages if not exists
ALTER TABLE packages ADD COLUMN IF NOT EXISTS photos text[] DEFAULT '{}';
