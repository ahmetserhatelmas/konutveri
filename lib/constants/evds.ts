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

// Konut Kredisi Faiz Oranları
export const LOAN_INTEREST_RATE_SERIES = {
  HOUSING_LOAN_TRY: 'TP.FG.J0', // Not: KKKO.K07 çalışmıyor, FG.J0 enflasyon verisi kullanılıyor
  COMMERCIAL_LOAN_TRY: 'TP.KTKO.K01', // TL Ticari Kredi Faiz Oranı
} as const;

// Tüketici Fiyat Endeksi (TÜFE)
export const INFLATION_SERIES = {
  CPI_GENERAL: 'TP.FG.J0', // Genel TÜFE
  CPI_HOUSING: 'TP.FG04', // Konut TÜFE
  CPI_RENT: 'TP.FG0411', // Kira TÜFE
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
