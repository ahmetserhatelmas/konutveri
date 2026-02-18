# Evveri - Gayrimenkul Analiz Platformu

[![Next.js](https://img.shields.io/badge/Next.js-15-black)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)](https://www.typescriptlang.org/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-green)](https://supabase.com/)

Türkiye gayrimenkul piyasasını TCMB resmi verileriyle analiz eden, otomatik veri güncellemeli platform.

## 🎯 Özellikler

- ✅ **Gerçek Zamanlı Veriler**: TCMB EVDS API'den otomatik çekilen güncel konut fiyat endeksi
- ✅ **40+ Aylık Trend Grafikleri**: 2021-2024 arası detaylı konut fiyat analizi
- ✅ **Enflasyon Analizi**: 2021-2026 TÜFE verileri ile karşılaştırma
- ✅ **Kira-Kredi Hesaplayıcı**: Hangi seçeneğin daha avantajlı olduğunu hesapla
- ✅ **Otomatik Güncellemeler**: Vercel Cron Jobs ile günlük veri senkronizasyonu
- ⚠️ **Veri Kısıtı**: TCMB şehir bazlı KFE verilerini Mayıs 2024'ten itibaren yayınlamıyor

## 🚀 Hızlı Başlangıç

### Gereksinimler

- Node.js 18+
- Supabase hesabı
- TCMB EVDS API key ([buradan alın](https://evds2.tcmb.gov.tr/))

### Kurulum

```bash
# Repository'yi klonla
git clone https://github.com/yourusername/evveri.git
cd evveri

# Bağımlılıkları yükle
npm install

# Environment variables ayarla
cp .env.local.example .env.local
# .env.local dosyasını düzenle

# Development server başlat
npm run dev
```

### Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# TCMB EVDS API
TCMB_EVDS_API_KEY=your_api_key

# Cron Secret
CRON_SECRET=your_secure_secret
```

### Veritabanı Kurulumu

```bash
# Supabase SQL Editor'de çalıştır
cat supabase/schema.sql | pbcopy
# Supabase Dashboard > SQL Editor > Paste & Run
```

### İlk Veri Çekimi

```bash
# Lokal test
curl -X GET "http://localhost:3000/api/cron/sync-data" \
  -H "Authorization: Bearer your_cron_secret"

# Production
curl -X GET "https://your-domain.vercel.app/api/cron/sync-data" \
  -H "Authorization: Bearer your_cron_secret"
```

## 📊 Veri Kaynakları

### TCMB EVDS API (Mevcut)
- **Konut Fiyat Endeksi (KFE)**: `TP.HKFE01` - Türkiye geneli, 2010-2024 Mayıs
- **Enflasyon (TÜFE)**: `TP.FG.J0` - 2005-2026 Ocak
- **Güncelleme**: Aylık, otomatik cron job

### ⚠️ Bilinen Kısıtlar

**Şehir Bazlı Veriler (ARŞİV)**
- TCMB eski şehir kodlarını (TP.HKFE01.IS, TP.HKFE01.AN vb.) Mayıs 2024'ten sonra güncellemedi
- Yeni bölge kodları (`TP_KFE_TR10-3`, `TP_KFE_TR51-3` vb.) EVDS 3 beta'da mevcut
- **Durum**: EVDS 3 API key erişimi bekleniyor

**Çözüm Yol Haritası:**
1. ✅ Türkiye geneli verisi çalışıyor (40+ ay)
2. 🔄 EVDS 3 API erişimi için TCMB'ye başvuru (yakında)
3. 💡 Alternatif: TÜİK Konut Satış İstatistikleri API entegrasyonu

## 🏗️ Proje Yapısı

```
evveri/
├── app/
│   ├── analytics/[city]/    # Şehir analiz sayfaları
│   ├── calculator/           # Kira-Kredi hesaplayıcı
│   └── api/
│       └── cron/sync-data/   # Otomatik veri çekme
├── components/
│   ├── features/
│   │   ├── charts/          # Recharts grafikleri
│   │   └── calculator/      # Hesap modülleri
│   └── ui/                  # Shadcn UI components
├── lib/
│   ├── api/evds.ts          # TCMB API client
│   ├── db/supabase.ts       # Database client
│   └── utils/               # Yardımcı fonksiyonlar
└── supabase/
    └── schema.sql           # PostgreSQL şema
```

## 🔧 Teknolojiler

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Charts**: Recharts
- **Deployment**: Vercel
- **Cron**: Vercel Cron Jobs

## 📈 Veri Güncellemeleri

Vercel Cron Jobs her gün saat 02:00'da otomatik çalışır:

```json
// vercel.json
{
  "crons": [{
    "path": "/api/cron/sync-data",
    "schedule": "0 2 * * *"
  }]
}
```

## 🤝 Katkıda Bulunma

1. Fork'layın
2. Feature branch oluşturun (`git checkout -b feature/amazing`)
3. Commit edin (`git commit -m 'Add amazing feature'`)
4. Push edin (`git push origin feature/amazing`)
5. Pull Request açın

## 📝 Lisans

MIT

## 🙏 Teşekkürler

- TCMB EVDS API
- Supabase
- Vercel
- Next.js ekibi

---

**Not**: Bu proje TCMB resmi verileri kullanır ancak TCMB'nin resmi bir uygulaması değildir. Veriler bilgilendirme amaçlıdır, yatırım tavsiyesi değildir.

## 📞 İletişim

Sorularınız için: [GitHub Issues](https://github.com/yourusername/evveri/issues)
