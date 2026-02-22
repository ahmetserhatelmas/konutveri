// Türkiye'nin büyük şehirleri ve TCMB EVDS3 seri kodları (TP.KFE.TRxx)
export const MAJOR_CITIES = [
  { name: 'Türkiye', slug: 'turkiye', evdsCode: 'TP.KFE.TR', region: 'country' },
  { name: 'İstanbul', slug: 'istanbul', evdsCode: 'TP.KFE.TR10', region: 'Marmara' },
  { name: 'Ankara', slug: 'ankara', evdsCode: 'TP.KFE.TR51', region: 'İç Anadolu' },
  { name: 'İzmir', slug: 'izmir', evdsCode: 'TP.KFE.TR31', region: 'Ege' },
  { name: 'Antalya', slug: 'antalya', evdsCode: 'TP.KFE.TR61', region: 'Akdeniz' },
  { name: 'Bursa', slug: 'bursa', evdsCode: 'TP.KFE.TR41', region: 'Marmara' },
  { name: 'Adana', slug: 'adana', evdsCode: 'TP.KFE.TR62', region: 'Akdeniz' },
  { name: 'Konya', slug: 'konya', evdsCode: 'TP.KFE.TR52', region: 'İç Anadolu' },
  { name: 'Gaziantep', slug: 'gaziantep', evdsCode: 'TP.KFE.TRC', region: 'Güneydoğu Anadolu' },
  { name: 'Kocaeli', slug: 'kocaeli', evdsCode: 'TP.KFE.TR42', region: 'Marmara' },
] as const;

export const REGIONS = [
  'Marmara',
  'Ege',
  'Akdeniz',
  'İç Anadolu',
  'Karadeniz',
  'Doğu Anadolu',
  'Güneydoğu Anadolu',
] as const;

export type CitySlug = typeof MAJOR_CITIES[number]['slug'];
export type Region = typeof REGIONS[number];
