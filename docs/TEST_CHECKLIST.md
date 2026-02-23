# Test Checklist – Her Şey Doğru Çalışıyor mu?

Aşağıdaki adımları sırayla çalıştır. Hepsi başarılıysa veri akışı doğru demektir.

---

## 1. Ortam ve sunucu

- `.env.local` dolu mu?
  - `TCMB_EVDS_API_KEY` (EVDS3 key)
  - `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`
  - `CRON_SECRET`
- Dev server çalışıyor mu?
  ```bash
  npm run dev
  ```
  → "Ready" görünene kadar bekle, sonra aşağıdaki curl’leri **başka bir terminalde** çalıştır.

---

## 2. Veritabanında veri var mı?

```bash
curl -s "http://localhost:3000/api/test/check-data"
```

- **Beklenen:** `success: true`, `housingPriceIndex.count` > 0, `inflationRates.count` > 0.
- **Eğer count 0:** Önce cron’u çalıştır (Adım 5), sonra bu adımı tekrarla.

---

## 3. Veri EVDS3’ten mi geliyor? (Karışma yok mu?)

```bash
curl -s "http://localhost:3000/api/test/verify-evds"
```

- **Beklenen:** `success: true`, `summary` içinde *"Tüm tarihlerde EVDS3 ile Supabase değerleri eşleşiyor"*.
- **comparison:** Tüm satırlarda `"match": "yes"` olmalı.
- **duplicateNote** dolu çıkarsa: Aynı tarih için birden fazla satır var demektir; kritik değil ama ileride unique constraint düşünülebilir.

---

## 4. Analytics sayfaları açılıyor mu?

Tarayıcıda:

1. **http://localhost:3000/analytics**  
   → Şehir listesi ve “Türkiye Geneli” kartı görünmeli.

2. **http://localhost:3000/analytics/turkiye**  
   → Grafik, Piyasa Özeti (Baz Yıl 2023, Mevcut Endeks, Aylık / 3 Aylık / Yıllık Değişim) görünmeli.

3. **http://localhost:3000/analytics/istanbul**  
   → Aynı şekilde İstanbul verisi (veya “şehir bazlı veri yok, Türkiye geneli gösteriliyor” uyarısı) görünmeli.

- 404 alırsan: `npm run dev` ile sunucuyu yeniden başlat, `.next` silip tekrar dene: `rm -rf .next && npm run dev`.

---

## 5. Cron sync (veri yoksa veya güncellemek için)

```bash
curl -X GET "http://localhost:3000/api/cron/sync-data" \
  -H "Authorization: Bearer BURAYA_CRON_SECRET_YAZ"
```

- `.env.local` içindeki `CRON_SECRET` değerini kullan (tırnak içinde tek parça).
- **Beklenen:** Birkaç dakika içinde JSON’da `"success": true`, `results.housingPriceIndex.success` > 0.
- Sonrasında Adım 2 ve 3’ü tekrarla; sayılar ve eşleşme güncel olmalı.

---

## Özet tablo

| Test | Komut / Sayfa | Başarı kriteri |
|------|----------------|-----------------|
| Veri var mı? | `GET /api/test/check-data` | `housingPriceIndex.count` > 0 |
| EVDS3 = DB? | `GET /api/test/verify-evds` | `summary` eşleşiyor, `match: yes` |
| Analytics liste | `/analytics` | Şehir listesi açılıyor |
| Analytics şehir | `/analytics/turkiye`, `/analytics/istanbul` | Grafik ve Piyasa Özeti görünüyor |
| Veri güncelleme | `GET /api/cron/sync-data` + Bearer token | 200, `success: true` |

Hepsi tamamsa veri EVDS3’ten geliyor, Supabase’e doğru yazılıyor ve arayüz doğru çalışıyor demektir.
