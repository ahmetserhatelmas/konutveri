import { RentVsMortgageCalculator } from '@/components/features/calculator/rent-vs-mortgage';
import { Building2 } from 'lucide-react';
import Link from 'next/link';

export default function CalculatorPage() {
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
              <Link href="/calculator" className="text-blue-600 font-medium">
                Hesaplayıcı
              </Link>
              <Link href="/analytics" className="text-gray-700 hover:text-blue-600 font-medium">
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
            Kira vs Kredi Hesaplayıcı
          </h1>
          <p className="text-lg text-gray-600">
            Ev alırken kiralamaya devam etmek mi, yoksa kredi çekip satın almak mı daha mantıklı? 
            Karşılaştırın ve en doğru kararı verin.
          </p>
        </div>

        <RentVsMortgageCalculator />

        {/* Info Section */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-2">
            Hesaplamalar Nasıl Yapılıyor?
          </h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li>• Aylık kredi taksiti PMT formülü ile hesaplanır</li>
            <li>• Kira için yıllık %10 artış örnek olarak varsayılır (güncel TÜFE kira endeksi kullanılmıyor)</li>
            <li>• Kredi faiz oranı TCMB EVDS “Konut Kredisi (TL, Stok, %)” serisinden güncel alınır; isteğe göre düzenlenebilir</li>
            <li>• Toplam maliyetlere peşinat dahildir</li>
            <li>• Vergi, sigorta, bakım masrafları ayrı hesaplanmalıdır</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
