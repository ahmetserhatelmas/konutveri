import Link from 'next/link';
import { Home, Calculator, TrendingUp, Building2, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { MAJOR_CITIES } from '@/lib/constants/cities';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Building2 className="w-8 h-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-gray-900">Evveri</h1>
            </div>
            <nav className="flex items-center gap-6">
              <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">
                Ana Sayfa
              </Link>
              <Link href="/calculator" className="text-gray-700 hover:text-blue-600 font-medium">
                Hesaplayıcı
              </Link>
              <Link href="/analytics" className="text-gray-700 hover:text-blue-600 font-medium">
                Analizler
              </Link>
            </nav>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Gayrimenkul Yatırımında Veriye Dayalı Kararlar
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            TCMB resmi verileriyle desteklenen analizler, kira-kredi karşılaştırmaları ve 
            şehir bazlı fiyat trendleri ile doğru yatırım kararı alın.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link href="/calculator">
              <Button size="lg" className="gap-2">
                <Calculator className="w-5 h-5" />
                Hesaplayıcıyı Dene
              </Button>
            </Link>
            <Link href="/analytics">
              <Button size="lg" variant="outline" className="gap-2">
                <BarChart3 className="w-5 h-5" />
                Analizleri İncele
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Neler Sunuyoruz?
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Şehir Bazlı Analizler</CardTitle>
                <CardDescription>
                  İstanbul, Ankara, İzmir ve diğer büyük şehirlerde konut fiyat endeksi trendleri
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Calculator className="w-6 h-6 text-green-600" />
                </div>
                <CardTitle>Kira vs Kredi</CardTitle>
                <CardDescription>
                  Kiralamak mı, kredi çekerek almak mı? Detaylı karşılaştırma ve öneriler
                </CardDescription>
              </CardHeader>
            </Card>

            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Home className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Yatırım Getirisi</CardTitle>
                <CardDescription>
                  Kira getirisi, amortisman süresi ve net getiri hesaplamaları
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* Cities Quick Access */}
      <section className="py-16 px-4">
        <div className="max-w-7xl mx-auto">
          <h3 className="text-3xl font-bold text-center text-gray-900 mb-12">
            Şehir Analizleri
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {MAJOR_CITIES.filter(city => city.slug !== 'turkiye').map((city) => (
              <Link key={city.slug} href={`/analytics/${city.slug}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <Building2 className="w-8 h-8 mx-auto mb-2 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">{city.name}</h4>
                      <p className="text-sm text-gray-500 mt-1">{city.region}</p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h3 className="text-3xl font-bold mb-4">
            TCMB Resmi Verileriyle Destekleniyor
          </h3>
          <p className="text-lg mb-8 text-blue-100">
            Tüm veriler Türkiye Cumhuriyet Merkez Bankası Elektronik Veri Dağıtım Sistemi'nden 
            (EVDS) otomatik olarak güncellenmektedir.
          </p>
          <Link href="/analytics">
            <Button size="lg" variant="outline" className="bg-white text-blue-600 hover:bg-blue-50">
              Analizleri İncele
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-8">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <p className="text-sm">
            © 2026 Evveri. Tüm hakları saklıdır. Veriler TCMB EVDS API üzerinden sağlanmaktadır.
          </p>
        </div>
      </footer>
    </div>
  );
}
