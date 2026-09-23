-- Canonical V1 · 10 · PRIVATE evidence/payment storage.
-- APPLY LAST — only after the signed-URL server code ships, because it removes
-- public read. Evidence + payment proofs then load via short-lived signed URLs
-- minted by the service role. Logical path prefixes: payment-proofs/ , fulfillment-evidence/.
update storage.buckets
   set public = false,
       allowed_mime_types = array['image/jpeg','image/png','image/webp','image/jpg',
                                  'video/mp4','video/webm','video/quicktime','application/pdf'],
       file_size_limit = 52428800
 where id = 'believer';

-- Remove public read; writes were already service-role only.
drop policy if exists "believer_public_read" ON storage.objects;
-- No anon SELECT policy → private. Service role bypasses RLS to upload and to
-- create signed URLs; nothing is publicly reachable by guessing a path.
