// TCMB EVDS API – EVDS3 kullanılıyor (igmevdsms-dis)
export const EVDS_BASE_URL = 'https://evds3.tcmb.gov.tr/igmevdsms-dis/';

// Konut Fiyat Endeksi Serileri (EVDS3: TP.KFE.TRxx, güncel ve şehir bazlı)
export const HOUSING_PRICE_INDEX_SERIES = {
  TURKEY: 'TP.KFE.TR',
  ISTANBUL: 'TP.KFE.TR10',
  ANKARA: 'TP.KFE.TR51',
  IZMIR: 'TP.KFE.TR31',
  ANTALYA: 'TP.KFE.TR61',
  BURSA: 'TP.KFE.TR41',
  ADANA: 'TP.KFE.TR62',   // Adana, Mersin
  KONYA: 'TP.KFE.TR52',
  GAZIANTEP: 'TP.KFE.TRC', // TRC bölgesi
  KOCAELI: 'TP.KFE.TR42',  // Bolu, Kocaeli, Sakarya, Yalova, Düzce
} as const;

// Konut Kredisi Faiz Oranları (hesaplayıcı için – seri kodu EVDS3’te doğrulanmalı)
export const LOAN_INTEREST_RATE_SERIES = {
  HOUSING_LOAN_TRY: 'TP.FG.J0', // yedek: enflasyon; aşağıdaki denenecek
  COMMERCIAL_LOAN_TRY: 'TP.KTKO.K01',
} as const;

// Faiz serileri (EVDS3 “Kredi Faiz Oranları (Stok)” → Konut Kredisi (TL, Stok, %))
// Hesaplayıcıda “güncel faiz” önerisi için sırayla denenecek
export const INTEREST_RATE_SERIES_CANDIDATES = [
  'TP.BKR.TRY.18',   // Konut Kredisi (TL, Stok, %) – EVDS3 tabloda TP_BKR_TRY_18
  'TP.BIE.KT100H',   // Kredi Faiz Oranları (Stok) – olası kod
  'TP.KKO.K01',      // Konut kredisi benzeri
  'TP.RA',           // Reeskont ve Avans (TCMB)
  'TP.APIFON4',      // Politika faizi / referans (yedek)
] as const;

// Tüketici Fiyat Endeksi (TÜFE)
export const INFLATION_SERIES = {
  CPI_GENERAL: 'TP.FG.J0', // Genel TÜFE
  CPI_HOUSING: 'TP.FG04', // Konut TÜFE
  CPI_RENT: 'TP.FG0411', // Kira TÜFE
} as const;

// Yeni Kiracı Kira Endeksi (YKKE) – EVDS3 “Yeni Kiracı Kira Endeksi” (path: bie_ykke)
// Seri kodu EVDS3 arayüzünde seri seçip Tablo Oluştur / API isteğinden doğrulanabilir
export const RENT_INDEX_SERIES = {
  TURKEY: 'TP.BIE.YKKE',
} as const;

// Döviz Kurları
export const EXCHANGE_RATE_SERIES = {
  USD_BUYING: 'TP.DK.USD.A',
  USD_SELLING: 'TP.DK.USD.S',
  EUR_BUYING: 'TP.DK.EUR.A',
  EUR_SELLING: 'TP.DK.EUR.S',
} as const;

// Veri Frekansları
export const FREQUENCY = {
  DAILY: 1,
  WEEKLY: 2,
  TWICE_MONTHLY: 3,
  MONTHLY: 5,
  QUARTERLY: 6,
  SEMI_ANNUAL: 7,
  ANNUAL: 8,
} as const;

// Veri Tipleri
export const DATA_FORMAT = {
  JSON: 'json',
  XML: 'xml',
  CSV: 'csv',
} as const;

// API Ayarları
export const DEFAULT_START_DATE = '01-02-2021'; // 5 yıllık veri (2021-2026)
export const DATE_FORMAT = 'DD-MM-YYYY';

// Rate Limits
export const API_RATE_LIMIT = {
  MAX_REQUESTS_PER_MINUTE: 30,
  MAX_REQUESTS_PER_DAY: 1000,
} as const;
