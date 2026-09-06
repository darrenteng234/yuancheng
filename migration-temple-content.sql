-- Run this in Supabase SQL Editor to add temple content fields
-- File: migration-temple-content.sql

ALTER TABLE temples
  ADD COLUMN IF NOT EXISTS short_description TEXT,
  ADD COLUMN IF NOT EXISTS short_description_zh TEXT,
  ADD COLUMN IF NOT EXISTS prayer_tags TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS prayer_tags_zh TEXT[] DEFAULT '{}';

-- Seed Erawan Shrine content
UPDATE temples SET
  short_description = 'Four-Faced Brahma shrine in the heart of Bangkok. One of the most revered spiritual landmarks in Thailand, known for fulfilling prayers related to career, wealth, health, and relationships.',
  short_description_zh = '位于曼谷市中心的四面佛。泰国最受尊崇的灵验圣地之一，掌管事业、财富、健康与感情。',
  prayer_tags = ARRAY['Career', 'Wealth', 'Health', 'Relationships', 'Fulfillment'],
  prayer_tags_zh = ARRAY['事业', '财富', '健康', '感情', '还愿']
WHERE name = 'Erawan Shrine';

-- Verify
SELECT name, short_description, short_description_zh, prayer_tags, prayer_tags_zh
FROM temples
WHERE name = 'Erawan Shrine';
