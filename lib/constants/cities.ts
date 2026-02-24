// TCMB EVDS3 Konut Fiyat Endeksi bölgeleri (TP.KFE.TRxx)
// Aynı TR kodu = tek seri: o bölgedeki tüm şehirler aynı veriyi alır; TCMB şehir bazı ayrım yapmıyor.
export const MAJOR_CITIES = [
  { name: 'Türkiye', slug: 'turkiye', evdsCode: 'TP.KFE.TR', region: 'country' },
  { name: 'İstanbul', slug: 'istanbul', evdsCode: 'TP.KFE.TR10', region: 'Marmara' },
  { name: 'Ankara', slug: 'ankara', evdsCode: 'TP.KFE.TR51', region: 'İç Anadolu' },
  { name: 'İzmir', slug: 'izmir', evdsCode: 'TP.KFE.TR31', region: 'Ege' },
  { name: 'Edirne, Kırklareli, Tekirdağ', slug: 'tr21', evdsCode: 'TP.KFE.TR21', region: 'Marmara' },
  { name: 'Balıkesir, Çanakkale', slug: 'tr22', evdsCode: 'TP.KFE.TR22', region: 'Marmara' },
  { name: 'Aydın, Denizli, Muğla', slug: 'tr32', evdsCode: 'TP.KFE.TR32', region: 'Ege' },
  { name: 'Afyonkarahisar, Kütahya, Manisa, Uşak', slug: 'tr33', evdsCode: 'TP.KFE.TR33', region: 'Ege' },
  { name: 'Bursa, Eskişehir, Bilecik', slug: 'bursa', evdsCode: 'TP.KFE.TR41', region: 'Marmara' },
  { name: 'Bolu, Kocaeli, Sakarya, Yalova, Düzce', slug: 'kocaeli', evdsCode: 'TP.KFE.TR42', region: 'Marmara' },
  { name: 'Konya, Karaman', slug: 'konya', evdsCode: 'TP.KFE.TR52', region: 'İç Anadolu' },
  { name: 'Antalya, Burdur, Isparta', slug: 'antalya', evdsCode: 'TP.KFE.TR61', region: 'Akdeniz' },
  { name: 'Adana, Mersin', slug: 'adana', evdsCode: 'TP.KFE.TR62', region: 'Akdeniz' },
  { name: 'Hatay, Kahramanmaraş, Osmaniye', slug: 'tr63', evdsCode: 'TP.KFE.TR63', region: 'Akdeniz' },
  { name: 'Orta Anadolu: Kırıkkale, Aksaray, Niğde, Nevşehir, Kırşehir, Kayseri, Sivas, Yozgat', slug: 'tr7', evdsCode: 'TP.KFE.TR7', region: 'İç Anadolu' },
  { name: 'Batı Karadeniz: Zonguldak, Karabük, Bartın, Kastamonu, Çankırı, Sinop', slug: 'tr8', evdsCode: 'TP.KFE.TR8', region: 'Karadeniz' },
  { name: 'Doğu Karadeniz: Trabzon, Ordu, Giresun, Rize, Artvin, Gümüşhane', slug: 'tr9', evdsCode: 'TP.KFE.TR9', region: 'Karadeniz' },
  { name: 'Kuzeydoğu Anadolu: Erzurum, Erzincan, Bayburt, Ağrı, Kars, Iğdır, Ardahan', slug: 'tra', evdsCode: 'TP.KFE.TRA', region: 'Doğu Anadolu' },
  { name: 'Ortadoğu Anadolu: Malatya, Elazığ, Bingöl, Tunceli, Van, Muş, Bitlis, Hakkari', slug: 'trb', evdsCode: 'TP.KFE.TRB', region: 'Doğu Anadolu' },
  { name: 'Güneydoğu Anadolu: Gaziantep, Adıyaman, Kilis, Şanlıurfa, Diyarbakır, Mardin, Batman, Şırnak, Siirt', slug: 'gaziantep', evdsCode: 'TP.KFE.TRC', region: 'Güneydoğu Anadolu' },
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
