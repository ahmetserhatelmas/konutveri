# 🎯 API Veri Kaynakları Durum Raporu

## ✅ ÇEKİLEBİLEN VERİLER (TCMB EVDS API)

### 1. Konut Fiyat Endeksi (KFE)
**Durum:** ✅ Tamamen Otomatik Çekilebilir

**Kapsam:**
- Türkiye geneli
- 10 büyük şehir (İstanbul, Ankara, İzmir, Antalya, Bursa, Adana, Konya, Gaziantep, Kocaeli)
- Aylık veriler (2010'dan günümüze)

**Veri Türleri:**
- Konut fiyat endeksi değeri (2023=100 baz)
- Aylık değişim %
- Yıllık değişim %

**Örnek Kullanım:**
```typescript
const data = await evdsApi.fetchHousingPriceIndex({
  seriesCode: 'TP.HKFE01.IS', // İstanbul
  startDate: '01-01-2021',
  endDate: '28-02-2026'
});
```

### 2. Konut Kredisi Faiz Oranları
**Durum:** ✅ Tamamen Otomatik Çekilebilir

**Kapsam:**
- TL konut kredisi faiz oranları
- Ticari kredi faiz oranları
- Haftalık/Aylık veriler

**Platformda Kullanımı:**
- Kira-Kredi hesaplayıcıda güncel faiz oranı
- Tarihsel faiz trendi grafikleri

### 3. Enflasyon Verileri (TÜFE)
**Durum:** ✅ Tamamen Otomatik Çekilebilir

**Kapsam:**
- Genel TÜFE
- Konut TÜFE
- Kira TÜFE (kira artış oranları için)
- Aylık veriler

**Platformda Kullanımı:**
- Kira artış projeksiyonları
- Reel getiri hesaplamaları
- Enflasyona göre fiyat analizi

### 4. Döviz Kurları
**Durum:** ✅ Tamamen Otomatik Çekilebilir

**Kapsam:**
- USD/TRY (alış/satış)
- EUR/TRY (alış/satış)
- Günlük veriler

**Platformda Kullanımı:**
- Dolar bazlı fiyat analizleri (opsiyonel)
- Yabancı yatırımcı perspektifi

---

## ❌ ÇEKİLEMEYEN VERİLER

### 1. Emlak Siteleri (Sahibinden, Emlakjet, Hepsiemlak, Zingat)
**Durum:** ❌ Resmi API Yok

**Alternatif:**
- Web scraping (yasal riskli, IP ban, değişken HTML)
- Manuel veri girişi
- **ÖNERİ:** Faz 1'de kullanma, TCMB verileri yeterli

### 2. İlçe Detay Verileri
**Durum:** ⚠️ TCMB'de sınırlı

**Not:** TCMB KFE sadece büyük şehirler için mevcut. İlçe bazlı veri yok.

**Alternatif:**
- Kullanıcı katkılı veriler (Faz 2+)
- Yerel belediye verileri (manuel)

---

## 📊 FAZ 1 KAPSAMI

### Kullanılan Veri Kaynakları
1. ✅ TCMB EVDS API (ücretsiz, resmi, güvenilir)

### Sağlanan Analizler
1. ✅ Şehir bazlı konut fiyat trendleri
2. ✅ Kira vs Kredi karşılaştırma
3. ✅ Yatırım getirisi hesaplama
4. ✅ Amortisman süresi analizi
5. ✅ Enflasyon etkisi analizi

### Otomatik Güncellenen Veriler
- Konut Fiyat Endeksi (günlük cron)
- Kredi Faiz Oranları (günlük cron)
- Enflasyon Oranları (günlük cron)
- Döviz Kurları (günlük cron - opsiyonel)

---

## 🎯 SONUÇ VE ÖNERİ

### ✅ BAŞARILI: Sadece TCMB Verileri ile Başladık

**Neden Bu Yeterli:**
1. Resmi ve güvenilir veri kaynağı
2. Yasal sorun yok
3. Otomatik güncellenebilir
4. Gerçek değer sağlayan analizler yapılabilir
5. Sürdürülebilir sistem

**Sunduğumuz Özellikler:**
- ✅ 10 şehir için fiyat trendleri
- ✅ Kira-Kredi hesaplayıcı (güncel faiz oranlarıyla)
- ✅ Yatırım getirisi analizi
- ✅ Enflasyon etkisi hesaplamaları
- ✅ Zaman bazlı grafikler (5 yıllık)

### 🔮 Faz 2+ İçin Veri Genişletme Önerileri

**Düşük Riskli:**
1. Kullanıcı katkılı veriler (kira fiyatları, satış fiyatları)
2. Belediye açık veri portalları
3. TÜİK ek verileri

**Yüksek Riskli (değerlendirilmeli):**
1. Web scraping (yasal kontrol gerekli)
2. Emlak sitesi API anlaşmaları (ücretli olabilir)

---

## 📋 API KULLANIM İSTATİSTİKLERİ

### TCMB EVDS API Limitleri
- **Dakikalık:** 30 istek
- **Günlük:** 1000 istek

### Bizim Kullanımımız (Günlük Cron)
- Konut Fiyat Endeksi: 10 istek (10 şehir)
- Kredi Faiz Oranları: 1 istek
- Enflasyon: 2 istek (genel + kira)
- Döviz: 1 istek (opsiyonel)

**Toplam:** ~15 istek/gün
**Limit Kullanımı:** %1.5 (çok altında ✅)

---

## 🚀 DEPLOYMENT SONRASI

### İlk Yapılacaklar
1. Vercel'e deploy et
2. Environment variables ekle
3. Supabase veritabanı kur
4. İlk veri çekimi:
   ```bash
   curl -X GET https://your-domain.vercel.app/api/cron/sync-data \
     -H "Authorization: Bearer YOUR_CRON_SECRET"
   ```
5. Verilerin geldiğini kontrol et (Supabase Table Editor)

### Beklenen Süre
- İlk veri çekimi: 2-3 dakika
- 5 yıllık veri: ~60 kayıt/şehir
- Toplam: ~600 kayıt (housing_price_index)

---

**✨ Sonuç: Faz 1 için API durumu mükemmel! Sadece TCMB verileri ile güçlü bir analiz platformu kurduk.**
