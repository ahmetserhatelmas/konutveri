# TCMB EVDS API Dokümantasyonu

Bu doküman TCMB Elektronik Veri Dağıtım Sistemi (EVDS) API kullanımını açıklar.

## 📡 API Temel Bilgiler

**Base URL:** `https://evds2.tcmb.gov.tr/service/evds/`

**Authentication:** HTTP Header ile
```
key: YOUR_API_KEY
```

**Rate Limits:**
- Dakika başına: 30 istek
- Günlük: 1000 istek

## 🔑 API Key Alma

1. https://evds2.tcmb.gov.tr adresine kayıt ol
2. Giriş yap > Profil > API ANAHTARI

## 📊 Kullanılan Seri Kodları

### 1. Konut Fiyat Endeksi (KFE)
```
TP.HKFE01       - Türkiye Geneli
TP.HKFE01.IS    - İstanbul
TP.HKFE01.AN    - Ankara
TP.HKFE01.IZ    - İzmir
TP.HKFE01.AT    - Antalya
TP.HKFE01.BR    - Bursa
TP.HKFE01.AD    - Adana
TP.HKFE01.KO    - Konya
TP.HKFE01.GA    - Gaziantep
TP.HKFE01.KC    - Kocaeli
```

### 2. Konut Kredisi Faiz Oranları
```
TP.KKKO.K07     - TL Konut Kredisi Faiz Oranı (Aylık)
TP.KTKO.K01     - TL Ticari Kredi Faiz Oranı
```

### 3. Tüketici Fiyat Endeksi (TÜFE)
```
TP.FG.J0        - Genel TÜFE
TP.FG04         - Konut TÜFE
TP.FG0411       - Kira TÜFE
```

### 4. Döviz Kurları
```
TP.DK.USD.A     - USD Alış
TP.DK.USD.S     - USD Satış
TP.DK.EUR.A     - EUR Alış
TP.DK.EUR.S     - EUR Satış
```

## 🚀 API Kullanım Örnekleri

### Örnek 1: Tek Seri Çekme
```bash
curl "https://evds2.tcmb.gov.tr/service/evds/?series=TP.HKFE01&startDate=01-01-2025&endDate=28-02-2026&type=json" \
  -H "key: YOUR_API_KEY"
```

**Response:**
```json
{
  "items": [
    {
      "Tarih": "2025-01-01",
      "TP_HKFE01": "220.5"
    },
    {
      "Tarih": "2025-02-01",
      "TP_HKFE01": "223.8"
    }
  ],
  "totalCount": 14
}
```

### Örnek 2: Çoklu Seri Çekme
```bash
curl "https://evds2.tcmb.gov.tr/service/evds/?series=TP.HKFE01.IS-TP.HKFE01.AN-TP.HKFE01.IZ&startDate=01-01-2025&endDate=28-02-2026&type=json" \
  -H "key: YOUR_API_KEY"
```

**Response:**
```json
{
  "items": [
    {
      "Tarih": "2025-01-01",
      "TP_HKFE01_IS": "215.2",
      "TP_HKFE01_AN": "252.8",
      "TP_HKFE01_IZ": "228.5"
    }
  ]
}
```

### Örnek 3: JavaScript/TypeScript
```typescript
const response = await fetch(
  'https://evds2.tcmb.gov.tr/service/evds/?series=TP.HKFE01&startDate=01-01-2025&endDate=28-02-2026&type=json',
  {
    headers: {
      'key': process.env.TCMB_EVDS_API_KEY
    }
  }
);

const data = await response.json();
console.log(data.items);
```

## 📋 Query Parameters

| Parameter | Zorunlu | Açıklama | Örnek |
|-----------|---------|----------|-------|
| `series` | ✅ | Seri kodu(ları), çoklu için "-" ile ayır | `TP.HKFE01` |
| `startDate` | ✅ | Başlangıç tarihi | `01-01-2025` |
| `endDate` | ✅ | Bitiş tarihi | `28-02-2026` |
| `type` | ✅ | Dönüş formatı | `json`, `xml`, `csv` |
| `frequency` | ❌ | Veri frekansı | `5` (aylık) |
| `aggregationType` | ❌ | Toplama tipi | `avg`, `min`, `max` |

## 🔢 Frekans Değerleri

```
1 = Günlük
2 = Haftalık
3 = Ayda 2 Kez
5 = Aylık
6 = 3 Aylık
7 = 6 Aylık
8 = Yıllık
```

## ⚠️ Önemli Notlar

### Tarih Formatı
- **API'ye gönderim:** `DD-MM-YYYY` (ör: `01-02-2026`)
- **API'den gelen:** `YYYY-MM-DD` (ör: `2026-02-01`)

### Seri Kodu Dönüşümü
API'den gelen JSON'da seri kodları nokta yerine alt çizgi ile gelir:
- Gönderilen: `TP.HKFE01.IS`
- Gelen JSON key: `TP_HKFE01_IS`

### Rate Limiting
Rate limit aşılırsa `429 Too Many Requests` hatası gelir. Bu durumda:
1. İstek sayısını azalt
2. Cache kullan
3. Dakikada maksimum 25 istek gönder (güvenlik payı)

## 🛠 Projede Kullanım

### 1. API Client (`lib/api/evds.ts`)
```typescript
import { evdsApi } from '@/lib/api/evds';

// Konut fiyat endeksi çek
const data = await evdsApi.fetchHousingPriceIndex({
  seriesCode: 'TP.HKFE01.IS',
  startDate: '01-01-2021',
  endDate: '28-02-2026'
});
```

### 2. Cron Job (`app/api/cron/sync-data/route.ts`)
Her gün otomatik veri güncelleme yapar.

### 3. API Routes (`app/api/evds/*/route.ts`)
Client-side'dan EVDS verilerine proxy erişim sağlar.

## 📚 Ek Kaynaklar

- [EVDS Web Portal](https://evds2.tcmb.gov.tr)
- [TCMB Veri Merkezi](https://www.tcmb.gov.tr/wps/wcm/connect/TR/TCMB+TR/Main+Menu/Istatistikler)
- [Konut Fiyat Endeksi Dokümantasyonu](https://www.tcmb.gov.tr/wps/wcm/connect/TR/TCMB+TR/Main+Menu/Istatistikler/Reel+Sektor+Istatistikleri/Konut+Fiyat+Endeksi)

## ❓ Sık Sorulan Sorular

**S: API ücretsiz mi?**
A: Evet, tamamen ücretsiz.

**S: Tarihsel verilere erişebilir miyim?**
A: Evet, 2010 yılından 2026'ya kadar tüm verilere erişebilirsin.

**S: Veri ne sıklıkla güncellenir?**
A: Konut Fiyat Endeksi aylık, kredi faizleri haftalık, döviz kurları günlük güncellenir.

**S: API key'imi kaybettim, ne yapmalıyım?**
A: EVDS sitesine giriş yap, profil > API ANAHTARI > Yeni Key Al

---

**🔗 İlgili Dosyalar:**
- `lib/api/evds.ts` - API Client
- `lib/constants/evds.ts` - Seri kodları ve sabitler
- `app/api/cron/sync-data/route.ts` - Otomatik veri çekme
