# EVDS3 Veri Doğrulama

## Veri nereden geliyor?

- **Tek kaynak:** TCMB EVDS3 (`https://evds3.tcmb.gov.tr/igmevdsms-dis/`).
- **Tek yazma yolu:** `/api/cron/sync-data` endpoint'i. Bu endpoint **sadece** EVDS3 API'ye istek atıp gelen veriyi Supabase'e yazar.
- **EVDS2 / eski veri:** Projede EVDS2 URL'si veya eski seri kodları (TP.HKFE01 vb.) **kullanılmıyor**. Karışma yok.

## Nasıl kanıtlarız?

### 1) Doğrulama endpoint'i (EVDS3 vs Supabase)

Uygulama çalışırken:

```bash
curl -s "http://localhost:3000/api/test/verify-evds"
```

Dönen JSON'da:

- **sourceInfo:** Hangi EVDS base URL ve seri kodu kullanıldığı.
- **evds3Last5:** EVDS3'ten alınan son 5 kayıt (ham).
- **supabaseLast5:** Supabase'deki Türkiye (country) son 5 kayıt.
- **comparison:** Aynı tarihte EVDS3 değeri ile Supabase değeri eşleşiyor mu (match: yes/no).
- **summary:** Hepsi eşleşiyorsa *"Tüm tarihlerde EVDS3 ile Supabase değerleri eşleşiyor – veri EVDS3 kaynaklı, karışma yok."*

### 2) EVDS3'e doğrudan curl (isteğe bağlı)

API key'i `.env.local` içindeki `TCMB_EVDS_API_KEY` ile kullanın:

```bash
curl -s -H "key: YOUR_API_KEY" \
  "https://evds3.tcmb.gov.tr/igmevdsms-dis/series=TP.KFE.TR&startDate=01-01-2024&endDate=01-01-2026&type=json&frequency=5"
```

Dönen `items` içindeki son kayıtların `Tarih` ve `TP_KFE_TR` değerleri, `verify-evds` çıktısındaki `evds3Last5` ve Supabase'deki `date` / `index_value` ile aynı olmalı.

### 3) Kod tarafı

- **Konut fiyat verisi yazan tek yer:** `app/api/cron/sync-data/route.ts`. Burada sadece `evdsApi.fetchHousingPriceIndex(...)` kullanılıyor.
- **evdsApi:** `lib/api/evds.ts` içinde `baseURL: EVDS_BASE_URL` → `lib/constants/evds.ts` içinde `EVDS_BASE_URL = 'https://evds3.tcmb.gov.tr/igmevdsms-dis/'`.
- Eski EVDS2 URL'si veya TP.HKFE01 serisi kodda **yok**; veri sadece EVDS3'ten gelir.

## Özet

| Soru | Cevap |
|------|--------|
| Veri şu an nereden alınıyor? | EVDS3 (igmevdsms-dis). |
| Eski kayıtlar / EVDS2 ile karışıyor mu? | Hayır. Sadece cron yazar, cron sadece EVDS3 kullanır. |
| Nasıl doğrularım? | `GET /api/test/verify-evds` ile EVDS3 ham verisi ile DB karşılaştırılır; summary'de "eşleşiyor" görürsün. |
