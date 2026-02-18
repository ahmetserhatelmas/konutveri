// Türkiye'nin büyük şehirleri ve TCMB EVDS seri kodları
export const MAJOR_CITIES = [
  {
    name: 'Türkiye',
    slug: 'turkiye',
    evdsCode: 'TP.HKFE01',
    region: 'country',
  },
  {
    name: 'İstanbul',
    slug: 'istanbul',
    evdsCode: 'TP.HKFE01.IS',
    region: 'Marmara',
  },
  {
    name: 'Ankara',
    slug: 'ankara',
    evdsCode: 'TP.HKFE01.AN',
    region: 'İç Anadolu',
  },
  {
    name: 'İzmir',
    slug: 'izmir',
    evdsCode: 'TP.HKFE01.IZ',
    region: 'Ege',
  },
  {
    name: 'Antalya',
    slug: 'antalya',
    evdsCode: 'TP.HKFE01.AT',
    region: 'Akdeniz',
  },
  {
    name: 'Bursa',
    slug: 'bursa',
    evdsCode: 'TP.HKFE01.BR',
    region: 'Marmara',
  },
  {
    name: 'Adana',
    slug: 'adana',
    evdsCode: 'TP.HKFE01.AD',
    region: 'Akdeniz',
  },
  {
    name: 'Konya',
    slug: 'konya',
    evdsCode: 'TP.HKFE01.KO',
    region: 'İç Anadolu',
  },
  {
    name: 'Gaziantep',
    slug: 'gaziantep',
    evdsCode: 'TP.HKFE01.GA',
    region: 'Güneydoğu Anadolu',
  },
  {
    name: 'Kocaeli',
    slug: 'kocaeli',
    evdsCode: 'TP.HKFE01.KC',
    region: 'Marmara',
  },
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
