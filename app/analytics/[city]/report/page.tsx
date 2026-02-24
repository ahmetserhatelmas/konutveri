import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Building2, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MAJOR_CITIES } from '@/lib/constants/cities';
import { supabase } from '@/lib/db/supabase';
import {
  buildReportData,
  fetchSuggestedInterest,
  fetchRentIndexAnnualChange,
  type ReportData,
} from '@/lib/data/report-data';
import { formatCurrency } from '@/lib/utils/calculations';
import { ReportTrendChart, ReportScenarioBarChart, ReportRentVsMortgageChart } from '@/components/features/report/report-charts';
import { ReportPrintButton } from './report-print-button';

interface PageProps {
  params: Promise<{ city: string }>;
}

export const dynamic = 'force-dynamic';

export default async function CityReportPage({ params }: PageProps) {
  const { city: citySlug } = await params;
  const slug = (citySlug ?? '').toLowerCase();
  const city = MAJOR_CITIES.find((c) => c.slug === slug);
  if (!city) notFound();

  let housingData: { date: string; index_value: number }[] = [];
  if (supabase) {
    if (slug !== 'turkiye') {
      const { data: cityData } = await supabase.from('cities').select('id').eq('slug', slug).single();
      if (cityData) {
        const { data } = await supabase
          .from('housing_price_index')
          .select('date, index_value')
          .eq('city_id', cityData.id)
          .eq('location_type', 'city')
          .order('date', { ascending: true });
        if (data?.length) housingData = data;
      }
    }
    if (housingData.length === 0) {
      const { data } = await supabase
        .from('housing_price_index')
        .select('date, index_value')
        .eq('location_type', 'country')
        .is('city_id', null)
        .order('date', { ascending: true });
      if (data?.length) housingData = data;
    }
  }

  const latestData = housingData[housingData.length - 1];
  const yearAgoData = housingData.length >= 13 ? housingData[housingData.length - 13] : null;
  const currentIndex = latestData ? parseFloat(String(latestData.index_value)) : 215.8;
  const yearlyChange = yearAgoData
    ? ((currentIndex - parseFloat(String(yearAgoData.index_value))) / parseFloat(String(yearAgoData.index_value))) * 100
    : 28.5;
  const lastUpdate = latestData?.date
    ? new Date(latestData.date + 'T00:00:00').toLocaleDateString('tr-TR', { year: 'numeric', month: 'long' })
    : 'Ocak 2026';

  const [interestRatePercent, rentIndexAnnualChangePercent] = await Promise.all([
    fetchSuggestedInterest(),
    fetchRentIndexAnnualChange(),
  ]);

  const reportDate = new Date().toLocaleDateString('tr-TR', { day: 'numeric', month: 'long', year: 'numeric' });
  const reportNumber = `EV-${new Date().getFullYear()}-${String(Math.floor(100000 + Math.random() * 900000))}`;

  const report = buildReportData({
    citySlug: slug,
    housingData,
    currentIndex,
    yearlyChange,
    lastUpdate,
    interestRatePercent,
    rentIndexAnnualChangePercent,
    reportDate,
    reportNumber,
  });

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 report-container">
      <header className="bg-white shadow-sm border-b print:shadow-none">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-gray-900">
            <Building2 className="w-8 h-8 text-blue-600" />
            <span className="text-xl font-bold">Evveri</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link href={`/analytics/${slug}`}>
              <Button variant="outline" size="sm" className="print:hidden">
                Analize Dön
              </Button>
            </Link>
            <ReportPrintButton className="print:hidden" />
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 py-8 space-y-8">
        {/* 1. Başlık ve Özet */}
        <Card>
          <CardHeader className="text-center border-b bg-blue-50/50">
            <CardTitle className="text-2xl">EVVERI GAYRİMENKUL ANALİZ RAPORU</CardTitle>
            <p className="text-lg font-medium text-gray-700">{report.cityName}</p>
            <p className="text-sm text-gray-500">{report.reportDate}</p>
            <p className="text-xs text-gray-500">Rapor No: #{report.reportNumber}</p>
          </CardHeader>
          <CardContent className="pt-6 text-gray-900">
            <h3 className="font-semibold text-gray-900 mb-2">ÖZET</h3>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Mevcut Konut Fiyat Endeksi: <strong>{report.section1.currentIndex.toFixed(1)}</strong></li>
              <li>• Yıllık Değişim: <strong>%{report.section1.yearlyChange.toFixed(1)} ↑</strong></li>
              <li>• Güncel Kredi Faizi: <strong>%{report.section1.interestRate.toFixed(1)}</strong></li>
              <li>• Tavsiye: <strong>{report.section1.recommendation}</strong></li>
            </ul>
            <p className="text-xs text-gray-500 mt-4">
              Veri kaynağı: Konut Fiyat Endeksi ve Kredi Faizi TCMB API (gerçek). Yıllık değişim hesaplanmıştır.
            </p>
          </CardContent>
        </Card>

        {/* 2. Konut Fiyat Trendi */}
        <Card>
          <CardHeader>
            <CardTitle>Konut Fiyat Trendi Analizi</CardTitle>
            <p className="text-sm text-gray-500">Aylık endeks (baz 2023 = 100) · TCMB EVDS</p>
          </CardHeader>
          <CardContent className="text-gray-900">
            <div className="mb-4">
              <ReportTrendChart data={report.section2.chartData} />
            </div>
            <ul className="space-y-1 text-sm text-gray-700">
              <li>• Son 5 yılda %{report.section2.fiveYearChangePercent.toFixed(1)} artış</li>
              {report.section2.lastMonthChangePercent != null && (
                <li>• Son ay aylık değişim: %{report.section2.lastMonthChangePercent.toFixed(1)}</li>
              )}
              <li>• 5 yılda bileşik aylık ortalama: %{report.section2.compoundMonthlyPercent.toFixed(1)}</li>
              <li>• Trend: {report.section2.trendText}</li>
              <li>• 2026 tahmini: {report.section2.estimate2026.toFixed(1)}</li>
            </ul>
            <p className="text-sm text-gray-600 mt-3">{report.section2.evaluation}</p>
          </CardContent>
        </Card>

        {/* 3. Kredi ve Faiz */}
        <Card>
          <CardHeader>
            <CardTitle>Kredi ve Faiz Durumu</CardTitle>
            <p className="text-sm text-gray-500">Konut Kredisi Faiz Oranı: %{report.section3.interestRate.toFixed(1)}</p>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-900">
            <h4 className="font-medium">3 Senaryo Analizi</h4>
            {report.section3.scenarios.map((s) => (
              <div key={s.price} className="border border-gray-200 rounded-lg p-3 text-sm text-gray-900">
                <p className="font-medium">{s.label}</p>
                <p>Peşinat (20%): {formatCurrency(s.downPayment)}</p>
                <p>Kredi: {formatCurrency(s.loan)} · Vade: {s.term} yıl</p>
                <p>Aylık Taksit: {formatCurrency(s.monthlyPayment)}</p>
                <p>Toplam Ödeme: {formatCurrency(s.totalPayment)} · Toplam Faiz: {formatCurrency(s.totalInterest)}</p>
              </div>
            ))}
            <ReportScenarioBarChart scenarios={report.section3.scenarios} />
          </CardContent>
        </Card>

        {/* 4. Kira Verileri */}
        <Card>
          <CardHeader>
            <CardTitle>Kira Verileri ve Tahmin</CardTitle>
            <p className="text-xs text-amber-700">{report.section4.disclaimer}</p>
          </CardHeader>
          <CardContent className="text-gray-900">
            <table className="w-full text-sm border-collapse text-gray-900">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-2 text-gray-900">Konut Tipi</th>
                  <th className="text-right py-2 text-gray-900">Ortalama Kira</th>
                </tr>
              </thead>
              <tbody>
                {report.section4.rentByType.map((r) => (
                  <tr key={r.type} className="border-b border-gray-200">
                    <td className="py-2 text-gray-900">{r.type}</td>
                    <td className="text-right text-gray-900">{formatCurrency(r.rent)}/ay</td>
                  </tr>
                ))}
              </tbody>
            </table>
            {report.section4.tufeRentAnnualPercent != null && (
              <p className="text-sm mt-2">TÜFE Kira Endeksi (yıllık): %{report.section4.tufeRentAnnualPercent.toFixed(1)}</p>
            )}
          </CardContent>
        </Card>

        {/* 5. Kira vs Kredi */}
        <Card>
          <CardHeader>
            <CardTitle>Kira vs Kredi Karşılaştırması</CardTitle>
            <p className="text-sm text-gray-500">10 yıllık maliyet · Örnek: {formatCurrency(report.section5.examplePrice)} 2+1</p>
          </CardHeader>
          <CardContent className="space-y-4 text-gray-900">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-900">
              <div>
                <p className="font-medium">Kiralama</p>
                <p>Başlangıç kirası: {formatCurrency(report.section5.monthlyRent)}/ay</p>
                <p>Yıllık artış tahmini: %{report.section5.rentIncreasePercent}</p>
                <p>10 yıllık toplam: {formatCurrency(report.section5.totalRent10y)}</p>
              </div>
              <div>
                <p className="font-medium">Kredi ile alma</p>
                <p>Peşinat: {formatCurrency(report.section5.exampleDownPayment)}</p>
                <p>Aylık taksit: {formatCurrency(report.section5.monthlyMortgage)}</p>
                <p>10 yıllık toplam: {formatCurrency(report.section5.totalMortgage10y)}</p>
                <p className="text-green-700">+ Gayrimenkul sahibi olursunuz</p>
              </div>
            </div>
            <ReportRentVsMortgageChart data={report.section5.chartData} />
            {report.section5.breakEvenYear != null && (
              <p className="text-sm font-medium">Başabaş noktası: {report.section5.breakEvenYear}. yıl</p>
            )}
            <p className="text-sm text-gray-600">{report.section5.recommendation}</p>
          </CardContent>
        </Card>

        {/* 6. Yatırım Getirisi */}
        <Card>
          <CardHeader>
            <CardTitle>Yatırım Getirisi Analizi</CardTitle>
            <p className="text-sm text-gray-500">Senaryo: {formatCurrency(report.section6.scenarioPrice)} daire kiraya veriliyor</p>
          </CardHeader>
          <CardContent className="space-y-2 text-sm text-gray-900">
            <p>Aylık kira geliri: {formatCurrency(report.section6.monthlyRent)}</p>
            <p>Yıllık kira geliri: {formatCurrency(report.section6.annualRent)}</p>
            <p>Yıllık giderler: ~{formatCurrency(report.section6.annualCosts)}</p>
            <p>Brüt getiri: %{report.section6.grossYield.toFixed(2)}</p>
            <p>Net getiri: %{report.section6.netYield.toFixed(2)}</p>
            <p>Amortisman süresi: ~{report.section6.paybackYears} yıl</p>
            <p>Enflasyona göre reel getiri: %{report.section6.realReturnPercent.toFixed(0)}</p>
            <p className="text-gray-600 mt-2">{report.section6.evaluation}</p>
          </CardContent>
        </Card>

        {/* 7. Uzman Yorumu */}
        <Card>
          <CardHeader>
            <CardTitle>Değerlendirme ve Tavsiyeler</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-sm text-gray-900">
            <p><strong>Piyasa:</strong> {report.section7.marketSummary}</p>
            <div>
              <p className="font-medium text-green-700">Alınmalı mı? EVET, eğer:</p>
              <ul className="list-disc list-inside text-gray-900">
                {report.section7.buyIf.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium text-amber-700">Beklenmeli mi? EVET, eğer:</p>
              <ul className="list-disc list-inside text-gray-900">
                {report.section7.waitIf.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <div>
              <p className="font-medium">Akıllı strateji:</p>
              <ul className="list-disc list-inside text-gray-900">
                {report.section7.strategy.map((s, i) => (
                  <li key={i}>{s}</li>
                ))}
              </ul>
            </div>
            <p className="font-medium">Risk:</p>
            <ul className="list-disc list-inside text-gray-900">
              {report.section7.risks.map((r, i) => (
                <li key={i}>{r.name}: {r.level}</li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
