-- Şehirler tablosu
CREATE TABLE IF NOT EXISTS cities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  region VARCHAR(50),
  evds_code VARCHAR(50) UNIQUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- İlçeler tablosu
CREATE TABLE IF NOT EXISTS districts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  city_id UUID NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL,
  evds_code VARCHAR(50),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(city_id, slug)
);

-- Konut Fiyat Endeksi tablosu
CREATE TABLE IF NOT EXISTS housing_price_index (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  city_id UUID REFERENCES cities(id) ON DELETE CASCADE,
  district_id UUID REFERENCES districts(id) ON DELETE CASCADE,
  location_type VARCHAR(20) NOT NULL CHECK (location_type IN ('country', 'city', 'district')),
  index_value DECIMAL(10, 2) NOT NULL,
  monthly_change DECIMAL(5, 2),
  yearly_change DECIMAL(5, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, city_id, district_id, location_type)
);

-- Kredi faiz oranları tablosu
CREATE TABLE IF NOT EXISTS loan_interest_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  rate_type VARCHAR(20) NOT NULL CHECK (rate_type IN ('commercial', 'housing')),
  interest_rate DECIMAL(5, 2) NOT NULL,
  currency VARCHAR(3) NOT NULL DEFAULT 'TRY',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, rate_type, currency)
);

-- Enflasyon oranları tablosu
CREATE TABLE IF NOT EXISTS inflation_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  rate_type VARCHAR(20) NOT NULL CHECK (rate_type IN ('cpi', 'rent')),
  rate_value DECIMAL(10, 2) NOT NULL,
  monthly_change DECIMAL(5, 2),
  yearly_change DECIMAL(5, 2),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, rate_type)
);

-- Döviz kurları tablosu
CREATE TABLE IF NOT EXISTS exchange_rates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL,
  currency VARCHAR(3) NOT NULL CHECK (currency IN ('USD', 'EUR')),
  buying_rate DECIMAL(10, 4) NOT NULL,
  selling_rate DECIMAL(10, 4) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(date, currency)
);

-- İndeksler
CREATE INDEX IF NOT EXISTS idx_hpi_date ON housing_price_index(date DESC);
CREATE INDEX IF NOT EXISTS idx_hpi_city ON housing_price_index(city_id);
CREATE INDEX IF NOT EXISTS idx_hpi_district ON housing_price_index(district_id);
CREATE INDEX IF NOT EXISTS idx_hpi_location_type ON housing_price_index(location_type);

CREATE INDEX IF NOT EXISTS idx_loan_date ON loan_interest_rates(date DESC);
CREATE INDEX IF NOT EXISTS idx_loan_type ON loan_interest_rates(rate_type);

CREATE INDEX IF NOT EXISTS idx_inflation_date ON inflation_rates(date DESC);
CREATE INDEX IF NOT EXISTS idx_inflation_type ON inflation_rates(rate_type);

CREATE INDEX IF NOT EXISTS idx_exchange_date ON exchange_rates(date DESC);
CREATE INDEX IF NOT EXISTS idx_exchange_currency ON exchange_rates(currency);

CREATE INDEX IF NOT EXISTS idx_cities_slug ON cities(slug);
CREATE INDEX IF NOT EXISTS idx_districts_slug ON districts(slug);

-- Updated_at trigger fonksiyonu
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger'ları oluştur
CREATE TRIGGER update_cities_updated_at BEFORE UPDATE ON cities
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_districts_updated_at BEFORE UPDATE ON districts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_hpi_updated_at BEFORE UPDATE ON housing_price_index
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_loan_updated_at BEFORE UPDATE ON loan_interest_rates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inflation_updated_at BEFORE UPDATE ON inflation_rates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_exchange_updated_at BEFORE UPDATE ON exchange_rates
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Şehir verilerini ekle
INSERT INTO cities (name, slug, region, evds_code) VALUES
  ('Türkiye', 'turkiye', 'country', 'TP.HKFE01'),
  ('İstanbul', 'istanbul', 'Marmara', 'TP.HKFE01.IS'),
  ('Ankara', 'ankara', 'İç Anadolu', 'TP.HKFE01.AN'),
  ('İzmir', 'izmir', 'Ege', 'TP.HKFE01.IZ'),
  ('Antalya', 'antalya', 'Akdeniz', 'TP.HKFE01.AT'),
  ('Bursa', 'bursa', 'Marmara', 'TP.HKFE01.BR'),
  ('Adana', 'adana', 'Akdeniz', 'TP.HKFE01.AD'),
  ('Konya', 'konya', 'İç Anadolu', 'TP.HKFE01.KO'),
  ('Gaziantep', 'gaziantep', 'Güneydoğu Anadolu', 'TP.HKFE01.GA'),
  ('Kocaeli', 'kocaeli', 'Marmara', 'TP.HKFE01.KC')
ON CONFLICT (slug) DO NOTHING;
