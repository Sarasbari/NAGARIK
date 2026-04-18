-- Create the 'incident-images' bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('incident-images', 'incident-images', true)
ON CONFLICT (id) DO NOTHING;

-- Policy to allow anyone to select/view the images (public)
CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'incident-images');

-- Policy to allow authenticated citizens to insert/upload images
CREATE POLICY "Auth Insert" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'incident-images' AND auth.role() = 'authenticated');
