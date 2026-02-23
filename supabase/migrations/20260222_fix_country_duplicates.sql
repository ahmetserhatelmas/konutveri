-- 1) Tüm tekrarları sil: (date, city_id, district_id, location_type) başına bir satır kalsın (en son created_at)
DELETE FROM housing_price_index
WHERE id NOT IN (
  SELECT DISTINCT ON (date, city_id, district_id, location_type) id
  FROM housing_price_index
  ORDER BY date, city_id, district_id, location_type, created_at DESC
);

-- 2) Eski unique constraint (NULL'ları ayrı saydığı için çift kayda izin veriyordu)
ALTER TABLE housing_price_index
  DROP CONSTRAINT IF EXISTS housing_price_index_date_city_id_district_id_location_type_key;

-- 3) Yeni unique index: NULL'lar tek değer sayılır; (date, country) ve (date, city) tek satır
CREATE UNIQUE INDEX housing_price_index_unique_per_date_location
  ON housing_price_index (date, COALESCE(city_id::text, ''), COALESCE(district_id::text, ''), location_type);
