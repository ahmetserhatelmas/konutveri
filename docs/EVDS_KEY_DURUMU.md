# EVDS API Key Durumu

## Güncel: EVDS3 Kullanılıyor (Şubat 2026)

- **Endpoint:** `https://evds3.tcmb.gov.tr/igmevdsms-dis/` (Python evds paketinden tespit edildi)
- **Key:** `mYsdHK8LOH` – EVDS3 için geçerli; bu endpoint ile JSON veri dönüyor.
- **Seriler:** Konut Fiyat Endeksi için EVDS3 seri kodları kullanılıyor: `TP.KFE.TR` (Türkiye), `TP.KFE.TR10` (İstanbul), `TP.KFE.TR51` (Ankara), vb. Şehir bazlı veri çekilebiliyor.

## Eski Test Sonuçları (Referans)

### Yeni key + evds2
- **evds2.tcmb.gov.tr** ile istek: **302** → evds3’e yönlendirme. Bu key evds2’de kullanılmıyor.

### Eski key + evds2
- **evds2** ile **TP.HKFE01**, **TP.FG.J0** çalışıyordu; artık proje EVDS3’e geçti.

## EVDS 3’te Görünen Veriler (Arayüz)

Arayüzde seçilebilen ve çekilmek istenen seriler:

- **Konut Fiyat Endeksi (Aylık)** – TR10, TR51, TR31, TR21, TR42 vb. bölgeler
- **Konut Birim Fiyatları (Üç Aylık) (TL/m²)** – Türkiye + iller
- **Yeni Konutlar Fiyat Endeksi**
- **Yeni Kiracı Kira Endeksi** – TR10, TR51, TR31 vb.
- **Değerlemesi Yapılan Konutların Birim Kiraları**

Tarih aralığı: 2010–2025 (4Ç-2025’e kadar).

Bu veriler **sadece EVDS 3 web arayüzü** (Tablo/Grafik/Harita Oluştur) ile alınabiliyor; aynı seriler için **public REST API** (JSON dönen) şu an bilinmiyor.

## Öneriler

1. **Projede veri çekimi:** EVDS 2 API ile çalıştığı için **eski key (`vpBzJQiYHp`)** kullanılmaya devam edilmeli.
2. **Yeni key’i kullanmak için:** TCMB’ye (evds@tcmb.gov.tr veya ilgili birim) “EVDS 3 verilerine programatik (API) erişim” sorulabilir; varsa endpoint ve dokümantasyon istenebilir.
3. **EVDS 3’teki tabloyu kullanmak:** İhtiyaç halinde EVDS 3’te “Tablo Oluştur” ile export alınıp (Excel/CSV) manuel veya yarı-otomatik işlenebilir; bu tam otomasyon değildir.

## Özet

| Key        | evds2 API (JSON) | EVDS 3 arayüz |
|-----------|-------------------|----------------|
| vpBzJQiYHp (eski) | ✅ Çalışıyor (TP.HKFE01, TP.FG.J0) | - |
| mYsdHK8LOH (yeni) | ❌ 302 → evds3’e yönlendirme       | ✅ Giriş/veri görüntüleme |

**Sonuç:** Ekranda gördüğün EVDS 3 serilerini (Konut Birim Fiyatları, Yeni Kiracı Kira Endeksi, bölgesel seriler) **şu an yeni key ile API üzerinden çekemiyoruz**. Proje, evds2’den veri alabildiği **eski key** ile çalışıyor.
