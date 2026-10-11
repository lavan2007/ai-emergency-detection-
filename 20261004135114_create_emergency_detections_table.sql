/*
# Create emergency_detections table (single-tenant, no auth)

1. New Tables
- `emergency_detections`
  - `id` (uuid, primary key)
  - `original_text` (text) — the transcribed voice or typed input
  - `dialect` (text) — detected/specified dialect (tamil, tanglish, colloquial_tamil)
  - `is_emergency` (boolean) — whether the message is an emergency
  - `category` (text) — one of: accident, medical, fire, electrical, flood, crime, missing_person, normal
  - `severity` (text) — one of: high, medium, low
  - `confidence` (numeric) — model confidence score 0-1
  - `latitude` (numeric, nullable) — user location latitude
  - `longitude` (numeric, nullable) — user location longitude
  - `created_at` (timestamptz) — record creation timestamp

2. Security
- Enable RLS on `emergency_detections`.
- Allow anon + authenticated CRUD because the app has no sign-in (single-tenant, public data).
*/

CREATE TABLE IF NOT EXISTS emergency_detections (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_text text NOT NULL,
  dialect text DEFAULT 'tanglish',
  is_emergency boolean NOT NULL DEFAULT false,
  category text NOT NULL DEFAULT 'normal',
  severity text NOT NULL DEFAULT 'low',
  confidence numeric DEFAULT 0,
  latitude numeric,
  longitude numeric,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE emergency_detections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "anon_select_emergency_detections" ON emergency_detections;
CREATE POLICY "anon_select_emergency_detections" ON emergency_detections
  FOR SELECT TO anon, authenticated USING (true);

DROP POLICY IF EXISTS "anon_insert_emergency_detections" ON emergency_detections;
CREATE POLICY "anon_insert_emergency_detections" ON emergency_detections
  FOR INSERT TO anon, authenticated WITH CHECK (true);

DROP POLICY IF EXISTS "anon_update_emergency_detections" ON emergency_detections;
CREATE POLICY "anon_update_emergency_detections" ON emergency_detections
  FOR UPDATE TO anon, authenticated USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "anon_delete_emergency_detections" ON emergency_detections;
CREATE POLICY "anon_delete_emergency_detections" ON emergency_detections
  FOR DELETE TO anon, authenticated USING (true);

CREATE INDEX IF NOT EXISTS idx_emergency_detections_created_at
  ON emergency_detections (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_emergency_detections_category
  ON emergency_detections (category);
CREATE INDEX IF NOT EXISTS idx_emergency_detections_is_emergency
  ON emergency_detections (is_emergency);
