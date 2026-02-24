-- TCMB EVDS3 bölge kodlarına göre eksik bölge kayıtlarını ekle (aynı TR kodu = aynı veri)
INSERT INTO cities (name, slug, region, evds_code) VALUES
  ('Edirne, Kırklareli, Tekirdağ', 'tr21', 'Marmara', 'TP.KFE.TR21'),
  ('Balıkesir, Çanakkale', 'tr22', 'Marmara', 'TP.KFE.TR22'),
  ('Aydın, Denizli, Muğla', 'tr32', 'Ege', 'TP.KFE.TR32'),
  ('Afyonkarahisar, Kütahya, Manisa, Uşak', 'tr33', 'Ege', 'TP.KFE.TR33'),
  ('Hatay, Kahramanmaraş, Osmaniye', 'tr63', 'Akdeniz', 'TP.KFE.TR63'),
  ('Orta Anadolu (TR7)', 'tr7', 'İç Anadolu', 'TP.KFE.TR7'),
  ('Batı Karadeniz (TR8)', 'tr8', 'Karadeniz', 'TP.KFE.TR8'),
  ('Doğu Karadeniz (TR9)', 'tr9', 'Karadeniz', 'TP.KFE.TR9'),
  ('Kuzeydoğu Anadolu (TRA)', 'tra', 'Doğu Anadolu', 'TP.KFE.TRA'),
  ('Ortadoğu Anadolu (TRB)', 'trb', 'Doğu Anadolu', 'TP.KFE.TRB')
ON CONFLICT (slug) DO NOTHING;

-- Mevcut şehirlerin evds_code alanını EVDS3 seri kodlarıyla güncelle (opsiyonel)
UPDATE cities SET evds_code = 'TP.KFE.TR'   WHERE slug = 'turkiye';
UPDATE cities SET evds_code = 'TP.KFE.TR10' WHERE slug = 'istanbul';
UPDATE cities SET evds_code = 'TP.KFE.TR51' WHERE slug = 'ankara';
UPDATE cities SET evds_code = 'TP.KFE.TR31' WHERE slug = 'izmir';
UPDATE cities SET evds_code = 'TP.KFE.TR61' WHERE slug = 'antalya';
UPDATE cities SET evds_code = 'TP.KFE.TR41' WHERE slug = 'bursa';
UPDATE cities SET evds_code = 'TP.KFE.TR62' WHERE slug = 'adana';
UPDATE cities SET evds_code = 'TP.KFE.TR52' WHERE slug = 'konya';
UPDATE cities SET evds_code = 'TP.KFE.TRC'  WHERE slug = 'gaziantep';
UPDATE cities SET evds_code = 'TP.KFE.TR42' WHERE slug = 'kocaeli';
