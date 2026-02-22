# Evveri – Proje Durumu ve Eklenenler

Son güncelleme: Şubat 2026

---

## ✅ Tamamlanan / Çalışan Özellikler

### 1. Veri Altyapısı
| Bileşen | Durum | Açıklama |
|--------|--------|----------|
| TCMB EVDS API | ✅ | evds2.tcmb.gov.tr, key header'da |
| API URL formatı | ✅ | `series=TP.HKFE01&startDate=...` (nokta → alt çizgi dönüşümü yapılıyor) |
| Supabase | ✅ | PostgreSQL, schema + 10 şehir seed |
| Cron sync | ✅ | Günlük 02:00, `/api/cron/sync-data` |

### 2. Veritabanı (Supabase)
- **cities** – 10 şehir + Türkiye (slug, evds_code)
- **housing_price_index** – Konut fiyat endeksi (date, city_id, location_type, index_value)
- **inflation_rates** – TÜFE (cpi, rent)
- **loan_interest_rates** – (şu an veri çekilmiyor, seri erişilemiyor)
- **exchange_rates** – (henüz kullanılmıyor)
- **districts** – İlçeler (ileride)

### 3. Sayfalar
| Sayfa | URL | İçerik |
|-------|-----|--------|
| Ana sayfa | `/` | Hero, özellikler, şehir kartları |
| Analizler | `/analytics` | Şehir listesi, linkler |
| Şehir analizi | `/analytics/[city]` | Türkiye + 9 şehir, grafik + stat kartları |
| Hesaplayıcı | `/calculator` | Kira vs kredi hesaplayıcı |

### 4. Veri Akışı
- **Konut Fiyat**: TP.HKFE01 → 40+ ay (2021–2024 Mayıs), Türkiye geneli
- **Enflasyon**: TP.FG.J0 → 60 ay (2021–2026 Ocak)
- Şehir sayfalarında şehir verisi yoksa **Türkiye geneli** gösteriliyor + mavi uyarı

### 5. Bileşenler
- **UI**: Card, Button, Input (Tailwind)
- **Charts**: LineChart, MultiLineChart (Recharts)
- **StatCard**: Konut endeksi, yıllık değişim, son güncelleme, kaynak
- **RentVsMortgage**: Kira–kredi karşılaştırma formu

### 6. API Route’lar
| Endpoint | Açıklama |
|---------|----------|
| `GET /api/cron/sync-data` | Veri senkronu (Authorization: Bearer CRON_SECRET) |
| `GET /api/evds/housing-price-index?city=...` | Konut endeksi proxy |
| `GET /api/evds/loan-rates` | Kredi faizi proxy |
| `GET /api/test/check-data` | Supabase veri kontrolü |
| `GET /api/test/tcmb-raw` | TCMB ham veri testi |

### 7. Dokümantasyon
- README.md – Kurulum, env, veri kaynakları, EVDS 3 notu
- SETUP_GUIDE.md
- docs/ARCHITECTURE.md
- docs/EVDS_API.md – EVDS 3 production, key evds3’ten
- API_DATA_REPORT.md, PROJECT_SUMMARY.md

### 8. Diğer
- **GitHub**: https://github.com/ahmetserhatelmas/konutveri
- **API key**: .env.local → TCMB_EVDS_API_KEY (güncel key kullanılıyor)
- **Vercel**: vercel.json → cron tanımlı (deploy sonrası env + ilk sync gerekir)

---

## ⚠️ Bilinen Kısıtlar

1. **Şehir bazlı KFE**: Eski seriler (TP.HKFE01.IS vb.) Mayıs 2024’ten sonra güncellenmiyor; şehir sayfalarında Türkiye geneli + uyarı gösteriliyor.
2. **2026 KFE**: Yeni seriler (TP_KFE_TR, TR10 vb.) EVDS 3’te var; evds2 API’de mevcut key ile 403 alınabiliyor.
3. **Konut kredisi faizi**: Seri (TP.KKKO.K07) erişilemediği için loan_interest_rates boş.
4. **Test route’lar**: `/api/test/*` geliştirme için; production’da kapatılabilir veya kaldırılabilir.

---

## 📁 Proje Yapısı (Özet)

```
evveri/
├── app/
│   ├── page.tsx                 # Ana sayfa
│   ├── layout.tsx
│   ├── analytics/
│   │   ├── page.tsx             # Analiz listesi
│   │   └── [city]/page.tsx      # Şehir analizi + grafik
│   ├── calculator/page.tsx      # Kira–kredi hesaplayıcı
│   └── api/
│       ├── cron/sync-data/      # Günlük veri çekimi
│       ├── evds/                 # EVDS proxy
│       └── test/                 # Test endpoint’leri
├── components/
│   ├── ui/                      # Card, Button, Input
│   └── features/
│       ├── charts/              # LineChart, MultiLineChart
│       ├── analytics/           # StatCard
│       └── calculator/          # RentVsMortgage
├── lib/
│   ├── api/evds.ts              # TCMB API client
│   ├── db/supabase.ts           # Supabase client
│   ├── constants/               # cities, evds serileri
│   ├── types/
│   └── utils/                   # date, calculations, cn
├── supabase/schema.sql
├── vercel.json                  # Cron
├── README.md
├── PROJE_DURUMU.md              # Bu dosya
└── docs/
```

---

## 🚀 Sonraki Adımlar (İsteğe Bağlı)

1. Vercel’e deploy, env (Supabase + TCMB + CRON_SECRET) ekle, ilk sync.
2. Yeni EVDS key ile TP_KFE_* serilerini dene; çalışırsa cron’a şehir/bölge KFE ekle.
3. `/api/test/*` route’larını production’da devre dışı bırak veya sil.
4. İleride: TÜİK konut satış API, PDF rapor, ödeme entegrasyonu (Faz 2).

---

**Özet:** Proje Faz 1 için tamam; veri çekimi, analiz sayfaları, hesaplayıcı ve cron çalışıyor. Şehir bazlı ve 2026 KFE, TCMB’nin API erişimi açması veya yeni key ile test edilmesiyle genişletilebilir.
