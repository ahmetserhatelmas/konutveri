import { Building2, TrendingUp, TrendingDown, Home, Calendar } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { StatCard } from '@/components/features/analytics/stat-card';
import { LineChart } from '@/components/features/charts/line-chart';
import { MAJOR_CITIES } from '@/lib/constants/cities';
import { notFound } from 'next/navigation';
import { supabase } from '@/lib/db/supabase';

interface PageProps {
  params: Promise<{
    city: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function CityAnalyticsPage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const slug = (citySlug ?? '').toLowerCase();
  const city = MAJOR_CITIES.find((c) => c.slug === slug);

  if (!city) {
    notFound();
  }

  // Supabase'den gerçek veri çek
  let housingData: any[] = [];
  let hasData = false;
  let isCountryData = false;

  if (supabase) {
    // Önce şehre özel veri deneyelim
    if (slug !== 'turkiye') {
      const { data: cityData } = await supabase
        .from('cities')
        .select('id')
        .eq('slug', slug)
        .single();

      if (cityData) {
        const { data } = await supabase
          .from('housing_price_index')
          .select('*')
          .eq('city_id', cityData.id)
          .eq('location_type', 'city')
          .order('date', { ascending: true });

        if (data && data.length > 0) {
          housingData = data;
          hasData = true;
        }
      }
    }

    // Şehir verisi yoksa veya Türkiye seçiliyse, ülke geneli göster
    if (!hasData) {
      const { data, error } = await supabase
        .from('housing_price_index')
        .select('*')
        .eq('location_type', 'country')
        .is('city_id', null)
        .order('date', { ascending: true });

      console.log('Supabase query result:', { 
        citySlug: slug,
        dataCount: data?.length, 
        error: error?.message,
        firstItem: data?.[0],
        lastItem: data?.[data.length - 1]
      });

      if (data && data.length > 0) {
        housingData = data;
        hasData = true;
        isCountryData = slug !== 'turkiye'; // Şehir için ülke verisi kullanılıyor mu?
      }
    }
  }

  // İstatistikleri hesapla (veri aylık geliyor; TCMB KFE çeyreklik güncellenir)
  const latestData = housingData[housingData.length - 1];
  const previousMonthData = housingData.length >= 2 ? housingData[housingData.length - 2] : null;
  const threeMonthsAgoData = housingData.length >= 4 ? housingData[housingData.length - 4] : null;
  const yearAgoData = housingData[housingData.length - 13];

  const currentIndex = latestData?.index_value || 215.8;
  const monthlyChange = previousMonthData
    ? ((currentIndex - previousMonthData.index_value) / previousMonthData.index_value * 100)
    : 0;
  const quarterlyChange = threeMonthsAgoData 
    ? ((currentIndex - threeMonthsAgoData.index_value) / threeMonthsAgoData.index_value * 100) 
    : 0;
  const yearlyChange = yearAgoData
    ? ((currentIndex - yearAgoData.index_value) / yearAgoData.index_value * 100)
    : 28.5;
  
  const lastUpdate = latestData?.date 
    ? new Date(latestData.date + 'T00:00:00').toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })
    : 'Ocak 2026';

  // Grafik için veri formatla
  const chartData = housingData.map(item => {
    // PostgreSQL DATE type comes as "YYYY-MM-DD" string
    const date = new Date(item.date + 'T00:00:00'); // Add time to avoid timezone issues
    return {
      date: date.toLocaleDateString('tr-TR', { year: 'numeric', month: 'short' }),
      rawDate: item.date, // Ham tarih LineChart için
      value: parseFloat(item.index_value),
    };
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Evveri</h1>
            </Link>
            <nav className="flex items-center gap-6">
              <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">
                Ana Sayfa
              </Link>
              <Link href="/calculator" className="text-gray-700 hover:text-blue-600 font-medium">
                Hesaplayıcı
              </Link>
              <Link href="/analytics" className="text-blue-600 font-medium">
                Analizler
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* City Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <Building2 className="w-10 h-10" />
                <h1 className="text-4xl font-bold">{city.name}</h1>
              </div>
              <p className="text-blue-100 text-lg">
                {city.region} Bölgesi - Konut Piyasası Analizi
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link href={`/analytics/${slug}/report`}>
                <Button className="bg-white text-blue-600 hover:bg-blue-50 border border-white/30">
                  Rapor al
                </Button>
              </Link>
              <Link href="/analytics">
                <Button variant="outline" className="bg-white text-blue-600 hover:bg-blue-50">
                  Tüm Şehirler
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Data Status Warning */}
        {!hasData && (
          <div className="mb-8 bg-amber-50 border-l-4 border-amber-400 p-4 rounded-r-lg">
            <div className="flex items-center">
              <Calendar className="w-5 h-5 text-amber-600 mr-3" />
              <div>
                <p className="font-medium text-amber-900">
                  Veri Güncelleme Bekleniyor
                </p>
                <p className="text-sm text-amber-700 mt-1">
                  İlk veri çekimi yapıldıktan sonra bu sayfada {city.name} için detaylı 
                  grafikler ve analizler görüntülenecek. Deployment sonrası cron job'ı manuel 
                  çalıştırmanız gerekmektedir.
                </p>
              </div>
            </div>
          </div>
        )}

        {isCountryData && hasData && (
          <div className="mb-8 bg-blue-50 border-l-4 border-blue-400 p-4 rounded-r-lg">
            <div className="flex items-center">
              <Building2 className="w-5 h-5 text-blue-600 mr-3" />
              <div>
                <p className="font-medium text-blue-900">
                  {city.name} için bölge verisi henüz yüklenmedi
                </p>
                <p className="text-sm text-blue-700 mt-1">
                  Bu bölge TCMB EVDS’te mevcut ({city.evdsCode}), ancak veritabanında henüz kayıt yok. 
                  Cron job çalıştığında bölge verisi çekilecek ve burada görünecektir. 
                  Şu an aşağıda <strong>Türkiye geneli</strong> verileri gösterilmektedir.
                </p>
              </div>
            </div>
          </div>
        )}

        {hasData && !isCountryData && (
          <div className="mb-8 bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg">
            <div className="flex items-center">
              <TrendingUp className="w-5 h-5 text-green-600 mr-3" />
              <div>
                <p className="font-medium text-green-900">
                  Veriler Aktif
                </p>
                <p className="text-sm text-green-700 mt-1">
                  TCMB EVDS'den çekilen {housingData.length} aylık veri ile güncel analiz görüntüleniyor.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Konut Fiyat Endeksi"
            value={currentIndex.toFixed(1)}
            change={quarterlyChange}
            changeLabel="3 aylık"
            trend={quarterlyChange >= 0 ? 'up' : 'down'}
            icon={<Home className="w-5 h-5" />}
          />
          <StatCard
            title="Yıllık Değişim"
            value={`%${yearlyChange.toFixed(1)}`}
            trend={yearlyChange >= 0 ? 'up' : 'down'}
            icon={<TrendingUp className="w-5 h-5" />}
          />
          <StatCard
            title="Son Güncelleme"
            value={lastUpdate}
            icon={<Calendar className="w-5 h-5" />}
          />
          <StatCard
            title="Veri Kaynağı"
            value="TCMB EVDS"
            icon={<Building2 className="w-5 h-5" />}
          />
        </div>

        {/* Chart */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>
              Konut Fiyat Endeksi Trendi
              {isCountryData && <span className="text-sm font-normal text-gray-500 ml-2">(Türkiye Geneli)</span>}
            </CardTitle>
            <CardDescription>
              {hasData 
                ? `${housingData.length} aylık veri - TCMB EVDS${isCountryData ? ' (Şehir bazlı veri mevcut değil)' : ''}`
                : '2021 - 2026 dönemi aylık veriler (Veri çekimi sonrası aktif olacak)'
              }
            </CardDescription>
          </CardHeader>
          <CardContent>
            {hasData ? (
              <LineChart
                data={chartData}
                dataKey="value"
                xAxisKey="rawDate"
                color="#2563eb"
                height={400}
              />
            ) : (
              <div className="h-[400px] flex items-center justify-center bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <TrendingUp className="w-16 h-16 mx-auto text-gray-400 mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Grafik Hazır, Veri Bekleniyor
                  </h3>
                  <p className="text-sm text-gray-500 max-w-md">
                    İlk cron job çalıştırıldıktan sonra bu alanda {city.name} için 
                    konut fiyat endeksi grafiği görünecek.
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Analysis Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Piyasa Özeti</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-600">Baz Yıl</span>
                <span className="font-semibold">2023 = 100</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-600">Mevcut Endeks</span>
                <span className="font-semibold">{currentIndex.toFixed(1)}</span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-600">Aylık Değişim</span>
                <span className={`font-semibold flex items-center gap-1 ${monthlyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {monthlyChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  %{Math.abs(monthlyChange).toFixed(1)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2 border-b">
                <span className="text-gray-600">3 Aylık Değişim</span>
                <span className={`font-semibold flex items-center gap-1 ${quarterlyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {quarterlyChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  %{Math.abs(quarterlyChange).toFixed(1)}
                </span>
              </div>
              <div className="flex items-center justify-between py-2">
                <span className="text-gray-600">Yıllık Değişim</span>
                <span className={`font-semibold flex items-center gap-1 ${yearlyChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {yearlyChange >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                  %{Math.abs(yearlyChange).toFixed(1)}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nasıl Yorumlanır?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-gray-700">
              <p>
                <strong>Konut Fiyat Endeksi (KFE)</strong>, {city.name} bölgesindeki 
                konut fiyatlarının genel seviyesini gösterir.
              </p>
              <p>
                <strong>Baz yıl 2023</strong>, TCMB'nin bu seriyi yayımlarken kullandığı resmi bazdır (100 = 2023 ortalaması). 
                Örneğin 215.8 değeri, fiyatların 2023'e göre %115.8 arttığını gösterir.
              </p>
              <p>
                <strong>Aylık, 3 aylık ve yıllık değişim oranları</strong> ile piyasanın 
                yükseliş veya düşüş trendini takip edebilirsiniz. TCMB Konut Fiyat Endeksi 
                serisi çeyreklik güncellendiği için <strong>aylık değişim çoğu ay %0</strong> görünebilir; 
                anlamlı kısa vadeli değişim için <strong>3 aylık değişime</strong> bakın.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Data Source Info */}
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="bg-blue-100 p-3 rounded-lg">
                <Building2 className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">
                  TCMB Resmi Verileri
                </h3>
                <p className="text-sm text-gray-700 mb-3">
                  Tüm veriler Türkiye Cumhuriyet Merkez Bankası (TCMB) Elektronik Veri 
                  Dağıtım Sistemi (EVDS) üzerinden otomatik olarak çekilmektedir.
                </p>
                <div className="flex flex-wrap gap-4 text-xs text-gray-600">
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Güncelleme:</span>
                    <span>Aylık</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Kaynak:</span>
                    <span>TCMB EVDS</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="font-medium">Seri Kodu:</span>
                    <span>{city.evdsCode}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

      </main>
    </div>
  );
}
