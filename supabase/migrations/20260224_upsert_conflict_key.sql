-- Cron upsert için conflict_key (GENERATED kullanılmıyor: uuid::text immutable değil)
ALTER TABLE housing_price_index
  ADD COLUMN IF NOT EXISTS conflict_key text;

-- Trigger: INSERT/UPDATE öncesi conflict_key hesapla
CREATE OR REPLACE FUNCTION housing_price_index_set_conflict_key()
RETURNS TRIGGER AS $$
BEGIN
  NEW.conflict_key := NEW.date::text || '-' || COALESCE(NEW.city_id::text, '') || '-' || COALESCE(NEW.district_id::text, '') || '-' || NEW.location_type;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_housing_price_index_conflict_key ON housing_price_index;
CREATE TRIGGER trg_housing_price_index_conflict_key
  BEFORE INSERT OR UPDATE ON housing_price_index
  FOR EACH ROW EXECUTE FUNCTION housing_price_index_set_conflict_key();

-- Mevcut satırları doldur
UPDATE housing_price_index
SET conflict_key = date::text || '-' || COALESCE(city_id::text, '') || '-' || COALESCE(district_id::text, '') || '-' || location_type
WHERE conflict_key IS NULL;

CREATE UNIQUE INDEX IF NOT EXISTS housing_price_index_conflict_key_key
  ON housing_price_index (conflict_key);
