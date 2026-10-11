/*
# Add location_name column to emergency_detections

1. Modified Tables
- `emergency_detections`
  - Added `location_name` (text, nullable) — human-readable location from reverse geocoding
2. Security
- No policy changes needed; existing CRUD policies already cover the new column.
*/

ALTER TABLE emergency_detections
  ADD COLUMN IF NOT EXISTS location_name text;
