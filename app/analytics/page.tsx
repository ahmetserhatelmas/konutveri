import { Building2, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MAJOR_CITIES } from '@/lib/constants/cities';

export default function AnalyticsPage() {
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Gayrimenkul Piyasası Analizleri
          </h1>
          <p className="text-lg text-gray-600">
            TCMB resmi verileri ile desteklenen şehir bazlı konut fiyat trendleri ve karşılaştırmalar
          </p>
        </div>

        {/* Turkey Overview Card */}
        <Card className="mb-8 bg-gradient-to-br from-blue-500 to-blue-700 text-white">
          <CardHeader>
            <CardTitle className="text-white text-2xl">Türkiye Geneli</CardTitle>
            <CardDescription className="text-blue-100">
              Ulusal konut fiyat endeksi ve genel piyasa trendleri
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link href="/analytics/turkiye">
              <button className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors">
                Detaylı İncele
              </button>
            </Link>
          </CardContent>
        </Card>

        {/* Cities Grid */}
        <div className="mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Şehir Bazlı Analizler</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {MAJOR_CITIES.filter(city => city.slug !== 'turkiye').map((city) => (
              <Link key={city.slug} href={`/analytics/${city.slug}`}>
                <Card className="hover:shadow-lg transition-all cursor-pointer h-full">
                  <CardHeader>
                    <div className="flex items-center justify-between mb-2">
                      <Building2 className="w-8 h-8 text-blue-600" />
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    </div>
                    <CardTitle className="text-xl">{city.name}</CardTitle>
                    <CardDescription>{city.region}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-gray-600">
                      Konut fiyat endeksi, yıllık değişim ve piyasa trendleri
                    </p>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>

        {/* Info Box */}
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-amber-900 mb-2">
            📊 Veri Kaynağı
          </h3>
          <p className="text-sm text-amber-800">
            Tüm analizler Türkiye Cumhuriyet Merkez Bankası (TCMB) Elektronik Veri Dağıtım Sistemi 
            (EVDS) üzerinden otomatik olarak güncellenmektedir. Konut Fiyat Endeksi (KFE) verileri 
            aylık olarak yayınlanır ve 2023=100 baz alınarak hesaplanır.
          </p>
        </div>
      </main>
    </div>
  );
}
