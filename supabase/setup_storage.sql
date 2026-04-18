-- setup_storage.sql
-- Run this in the Supabase SQL Editor to create the report-images bucket
-- and open storage policies for hackathon.

-- 1. Create the bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('report-images', 'report-images', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow anyone to upload images
CREATE POLICY "Anyone can upload report images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'report-images');

-- 3. Allow anyone to read images (public bucket)
CREATE POLICY "Anyone can view report images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'report-images');

-- 4. Allow anyone to delete their uploads (for rejected images)
CREATE POLICY "Anyone can delete report images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'report-images');
