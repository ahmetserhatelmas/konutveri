# KURULUM REHBERİ

Bu doküman projeyi sıfırdan kurmanız için adım adım rehberdir.

## 1. Ön Hazırlık

### Gerekli Hesaplar
- ✅ GitHub hesabı (kod yönetimi)
- ✅ Supabase hesabı (veritabanı)
- ✅ Vercel hesabı (deployment)
- ✅ TCMB EVDS hesabı (API key)

## 2. TCMB EVDS API Key Alma

### Adım 1: Kayıt
1. [https://evds2.tcmb.gov.tr](https://evds2.tcmb.gov.tr) adresine git
2. Sağ üstten "Kayıt Ol" butonuna tıkla
3. E-posta ve şifre ile kayıt ol
4. E-posta doğrulamasını tamamla

### Adım 2: API Key Al
1. Giriş yap
2. Sağ üstteki profil ikonuna tıkla
3. "API ANAHTARI" butonuna bas
4. Oluşan key'i kopyala ve güvenli bir yere not et

**API Limitleri:**
- Dakika başına: 30 istek
- Günlük: 1000 istek

## 3. Supabase Kurulumu

### Adım 1: Proje Oluştur
1. [https://app.supabase.com](https://app.supabase.com) adresine git
2. "New Project" butonuna tıkla
3. Proje adı: `evveri-production`
4. Database şifresi belirle (kaydet!)
5. Region: Europe West (Frankfurt) - Türkiye'ye en yakın
6. "Create project" tıkla (2-3 dakika sürer)

### Adım 2: Veritabanı Şemasını Kur
1. Sol menüden "SQL Editor" seç
2. "New query" butonuna tıkla
3. `supabase/schema.sql` dosyasının içeriğini kopyala
4. SQL Editor'e yapıştır
5. "Run" butonuna bas
6. Başarılı mesajı görünce tamamdır ✅

### Adım 3: API Bilgilerini Al
1. Sol menüden "Settings" > "API"
2. Şu bilgileri kopyala:
   - **Project URL** (NEXT_PUBLIC_SUPABASE_URL)
   - **anon public** key (NEXT_PUBLIC_SUPABASE_ANON_KEY)
   - **service_role** key (SUPABASE_SERVICE_ROLE_KEY) - Bu key'i görmek için "Reveal" tıkla

## 4. Local Development Kurulumu

### Adım 1: Projeyi Klonla
```bash
git clone <repository-url>
cd evveri
```

### Adım 2: Dependencies Yükle
```bash
npm install
```

### Adım 3: Environment Variables Ayarla

`.env.local` dosyası oluştur ve şunu ekle:

```env
# Supabase (3. adımda aldığın bilgiler)
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
SUPABASE_SERVICE_ROLE_KEY=eyJxxx...

# TCMB EVDS API (2. adımda aldığın key)
TCMB_EVDS_API_KEY=xxx-xxx-xxx

# Cron Secret (rastgele bir string belirle)
CRON_SECRET=super-secret-random-string-123
```

### Adım 4: İlk Veri Çekimi (Test)

Development server'ı başlat:
```bash
npm run dev
```

Cron job'ı manuel test et:
```bash
curl -X GET http://localhost:3000/api/cron/sync-data \
  -H "Authorization: Bearer super-secret-random-string-123"
```

Bu işlem 2-3 dakika sürebilir. Başarılı olursa JSON response göreceksin.

### Adım 5: Supabase'de Verileri Kontrol Et

1. Supabase Dashboard > Table Editor
2. `housing_price_index` tablosunu aç
3. Verilerin geldiğini kontrol et

✅ Veriler varsa kurulum başarılı!

## 5. Vercel'e Deployment

### Adım 1: GitHub'a Push
```bash
git add .
git commit -m "Initial commit"
git remote add origin <github-repo-url>
git push -u origin main
```

### Adım 2: Vercel'e Import
1. [https://vercel.com](https://vercel.com) adresine git
2. "New Project" tıkla
3. GitHub repository'ni seç
4. "Import" tıkla

### Adım 3: Environment Variables Ekle
"Environment Variables" bölümünde `.env.local` dosyasındaki tüm değişkenleri ekle:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `TCMB_EVDS_API_KEY`
- `CRON_SECRET`

### Adım 4: Deploy Et
"Deploy" butonuna tıkla. 2-3 dakika sürer.

✅ Deploy tamamlandı!

## 6. Cron Job Ayarları

Vercel otomatik olarak `vercel.json` dosyasındaki cron ayarlarını algılar.

**Cron Schedule:** Her gün saat 02:00'da çalışır
```json
{
  "crons": [
    {
      "path": "/api/cron/sync-data",
      "schedule": "0 2 * * *"
    }
  ]
}
```

### Manuel Test (Production)
```bash
curl -X GET https://your-domain.vercel.app/api/cron/sync-data \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

## 7. İlk Kullanım

1. `https://your-domain.vercel.app` adresini aç
2. Ana sayfayı gör
3. "Hesaplayıcı" bölümünü test et
4. "Analizler" bölümüne git

⚠️ İlk açılışta grafiklerde veri olmayabilir. Cron job çalıştıktan sonra veriler gelecek.

## 8. Sorun Giderme

### Veri Gelmiyor
- TCMB EVDS API key doğru mu? Test et: `https://evds2.tcmb.gov.tr/service/evds/?series=TP.HKFE01&startDate=01-01-2024&endDate=31-12-2024&type=json` (header'a key ekle)
- Supabase bağlantısı çalışıyor mu? Table Editor'de manuel veri ekle ve sil
- Console'da hata var mı?

### Cron Job Çalışmıyor
- Vercel Dashboard > Deployments > Function Logs kontrol et
- CRON_SECRET doğru mu?
- `/api/cron/sync-data` endpoint'i çalışıyor mu?

### Build Hataları
```bash
npm run build
```
komutunu local'de çalıştır ve hataları gör.

## 9. İletişim & Destek

Sorun yaşarsan:
1. GitHub Issues aç
2. Log'ları paylaş
3. Hangi adımda takıldığını açıkla

---

**🎉 Kurulum tamamlandı! Artık siteniz çalışıyor.**
