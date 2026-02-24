import { supabase } from '@/lib/db/supabase';
import { MAJOR_CITIES } from '@/lib/constants/cities';
import {
  calculateMonthlyMortgage,
  calculateRentVsMortgage,
  calculateInvestmentReturn,
  calculateRealReturn,
} from '@/lib/utils/calculations';
import type { MortgageCalculatorInput } from '@/lib/types';

export type CitySlug = (typeof MAJOR_CITIES)[number]['slug'];

/** Şehir bazlı kira çarpanı (Ankara = 1.0) */
const RENT_MULTIPLIER: Record<string, number> = {
  turkiye: 1.0,
  istanbul: 1.5,
  ankara: 1.0,
  izmir: 1.2,
  antalya: 1.1,
  bursa: 1.05,
  adana: 0.95,
  konya: 0.9,
  gaziantep: 0.95,
  kocaeli: 1.1,
};

/** Ankara bazlı aylık ortalama kira (TL) - tahmini */
const BASE_RENT_ANKARA = {
  '1+1': 15000,
  '2+1': 21000,
  '3+1': 32000,
  '4+1': 43000,
};

export interface ReportDataInput {
  citySlug: string;
  housingData: { date: string; index_value: number }[];
  currentIndex: number;
  yearlyChange: number;
  lastUpdate: string;
  interestRatePercent: number;
  rentIndexAnnualChangePercent: number | null;
  reportDate: string;
  reportNumber: string;
}

export interface ReportData {
  cityName: string;
  citySlug: string;
  reportDate: string;
  reportNumber: string;
  section1: {
    currentIndex: number;
    yearlyChange: number;
    interestRate: number;
    recommendation: string;
    lastUpdate: string;
  };
  section2: {
    chartData: { year: string; value: number; label: string }[];
    fiveYearChangePercent: number;
    compoundMonthlyPercent: number;
    lastMonthChangePercent: number | null;
    trendText: string;
    estimate2026: number;
    evaluation: string;
  };
  section3: {
    interestRate: number;
    scenarios: {
      label: string;
      price: number;
      downPayment: number;
      loan: number;
      term: number;
      monthlyPayment: number;
      totalPayment: number;
      totalInterest: number;
    }[];
  };
  section4: {
    rentByType: { type: string; rent: number }[];
    rentTrend: { year: string; rent2plus1: number; changePercent?: number }[];
    tufeRentAnnualPercent: number | null;
    disclaimer: string;
  };
  section5: {
    examplePrice: number;
    exampleDownPayment: number;
    monthlyRent: number;
    rentIncreasePercent: number;
    totalRent10y: number;
    monthlyMortgage: number;
    totalMortgage10y: number;
    breakEvenYear: number | undefined;
    chartData: { year: number; rent: number; mortgage: number }[];
    recommendation: string;
  };
  section6: {
    scenarioPrice: number;
    monthlyRent: number;
    annualRent: number;
    annualCosts: number;
    grossYield: number;
    netYield: number;
    paybackYears: number;
    inflationPercent: number;
    realReturnPercent: number;
    evaluation: string;
  };
  section7: {
    marketSummary: string;
    buyIf: string[];
    waitIf: string[];
    strategy: string[];
    risks: { name: string; level: string }[];
  };
}

function getBaseUrl(): string {
  if (process.env.VERCEL_URL) return `https://${process.env.VERCEL_URL}`;
  return process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
}

/** API'den güncel faiz oranını al */
export async function fetchSuggestedInterest(): Promise<number> {
  try {
    const base = getBaseUrl();
    const res = await fetch(`${base}/api/evds/suggested-interest`, { cache: 'no-store' });
    const data = await res.json();
    if (data?.success && typeof data.valuePercent === 'number' && data.valuePercent > 0) {
      return data.valuePercent;
    }
  } catch (_) {}
  return 44.8;
}

/** API'den TÜFE Kira yıllık değişim */
export async function fetchRentIndexAnnualChange(): Promise<number | null> {
  try {
    const base = getBaseUrl();
    const res = await fetch(`${base}/api/evds/rent-index?fallback=cpi`, { cache: 'no-store' });
    const data = await res.json();
    if (data?.success && typeof data.annualChangePercent === 'number') {
      return data.annualChangePercent;
    }
  } catch (_) {}
  return null;
}

/** Rapor numarası üret */
function generateReportNumber(): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  const y = new Date().getFullYear();
  return `EV-${y}-${n}`;
}

/** 5 yıllık trend ve 2026 tahmini – aylık veri (MM/YYYY) ile */
function trendAndEstimate(
  housingData: { date: string; index_value: number }[],
  currentIndex: number
): {
  chartData: { year: string; value: number; label: string }[];
  fiveYearChange: number;
  compoundMonthlyPercent: number;
  lastMonthChangePercent: number | null;
  estimate2026: number;
} {
  const sorted = [...housingData].sort((a, b) => a.date.localeCompare(b.date));
  const chartData = sorted.map((row) => {
    const d = new Date(row.date + 'T00:00:00');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    const monthLabel = `${mm}/${yyyy}`;
    const v = parseFloat(String(row.index_value));
    return { year: monthLabel, value: v, label: `${monthLabel}: ${v.toFixed(1)}` };
  });

  const firstVal = sorted.length ? parseFloat(String(sorted[0].index_value)) : 100;
  const fiveYearChange = firstVal > 0 ? ((currentIndex - firstVal) / firstVal) * 100 : 0;
  const n = sorted.length || 60;
  const compoundMonthlyPercent =
    n > 0 && firstVal > 0 ? (Math.pow(currentIndex / firstVal, 1 / n) - 1) * 100 : 0;

  let lastMonthChangePercent: number | null = null;
  if (sorted.length >= 2) {
    const prevVal = parseFloat(String(sorted[sorted.length - 2].index_value));
    if (prevVal > 0) {
      lastMonthChangePercent = ((currentIndex - prevVal) / prevVal) * 100;
    }
  }

  const slope = sorted.length >= 2 ? (currentIndex - firstVal) / sorted.length : 0;
  const estimate2026 = currentIndex + slope;

  return { chartData, fiveYearChange, compoundMonthlyPercent, lastMonthChangePercent, estimate2026 };
}

/** Rapor için tüm veriyi hesapla */
export function buildReportData(input: ReportDataInput): ReportData {
  const {
    citySlug,
    housingData,
    currentIndex,
    yearlyChange,
    lastUpdate,
    interestRatePercent,
    rentIndexAnnualChangePercent,
    reportDate,
    reportNumber,
  } = input;

  const city = MAJOR_CITIES.find((c) => c.slug === citySlug);
  const cityName = city?.name ?? citySlug;
  const multiplier = RENT_MULTIPLIER[citySlug] ?? 1.0;
  const rent2plus1 = Math.round(BASE_RENT_ANKARA['2+1'] * multiplier / 1000) * 1000;
  const rentIncreasePercent = 15;

  const { chartData: trendChart, fiveYearChange, compoundMonthlyPercent, lastMonthChangePercent, estimate2026 } = trendAndEstimate(
    housingData,
    currentIndex
  );

  const scenarioPrices = [3_000_000, 5_000_000, 8_000_000];
  const scenarios = scenarioPrices.map((price) => {
    const downPayment = Math.round(price * 0.2);
    const loan = price - downPayment;
    const monthly = calculateMonthlyMortgage(loan, interestRatePercent, 10);
    const totalPayment = monthly * 120 + downPayment;
    const totalInterest = totalPayment - price;
    return {
      label: `${(price / 1_000_000).toFixed(0)}.000.000 TL Ev`,
      price,
      downPayment,
      loan,
      term: 10,
      monthlyPayment: monthly,
      totalPayment,
      totalInterest,
    };
  });

  const calcInput: MortgageCalculatorInput = {
    propertyPrice: 5_000_000,
    downPayment: 1_000_000,
    interestRate: interestRatePercent,
    loanTerm: 10,
    monthlyRent: rent2plus1,
  };
  const rentVsMortgage = calculateRentVsMortgage(calcInput);
  const rentVsChartData: { year: number; rent: number; mortgage: number }[] = [];
  let cumRent = 0;
  let curRent = rent2plus1;
  for (let y = 1; y <= 10; y++) {
    cumRent += curRent * 12;
    curRent *= 1 + rentIncreasePercent / 100;
    const cumMortgage = rentVsMortgage.monthlyMortgage * y * 12 + calcInput.downPayment;
    rentVsChartData.push({ year: y, rent: Math.round(cumRent), mortgage: Math.round(cumMortgage) });
  }

  const invInput = {
    propertyPrice: 5_000_000,
    monthlyRent: rent2plus1,
    downPayment: 1_000_000,
    maintenanceCost: 50_000,
    propertyTax: 10_000,
  };
  const inv = calculateInvestmentReturn(invInput);
  const inflationPercent = rentIndexAnnualChangePercent ?? 52.8;
  const realReturn = calculateRealReturn(inv.netYield, inflationPercent);

  const recommendation =
    yearlyChange > 25 && interestRatePercent > 40
      ? 'Kiralamaya devam, 2-3 yıl bekle'
      : rentVsMortgage.recommendation === 'buy'
        ? 'Uygun koşullarda kredi ile alım değerlendirilebilir'
        : 'Kira/kredi karşılaştırmasına göre karar verin';

  const evaluationTrend =
    fiveYearChange > 100
      ? `${cityName} konut fiyatları son 5 yılda %${fiveYearChange.toFixed(1)} artış gösterdi.`
      : `Son 5 yılda endeks %${fiveYearChange.toFixed(1)} arttı.`;

  const section7Recommendation =
    rentVsMortgage.breakEvenYear != null && rentVsMortgage.breakEvenYear <= 8
      ? [
          `${rentVsMortgage.breakEvenYear}+ yıl aynı evde kalacaksanız kredi ile alım değerlendirilebilir.`,
          'Peşinat ve aylık taksit bütçenize uygunsa alım mantıklı olabilir.',
        ]
      : [
          '2-3 yıl kiralamaya devam edin.',
          'Kredi faizlerinin düşmesini bekleyin.',
          'Fiyatlar stabilize olunca alımı değerlendirin.',
        ];

  return {
    cityName,
    citySlug,
    reportDate,
    reportNumber,
    section1: {
      currentIndex,
      yearlyChange,
      interestRate: interestRatePercent,
      recommendation,
      lastUpdate,
    },
    section2: {
      chartData: trendChart.map((d) => ({ ...d, year: d.year, value: d.value, label: d.label })),
      fiveYearChangePercent: fiveYearChange,
      compoundMonthlyPercent,
      lastMonthChangePercent,
      trendText: 'Yükseliş devam ediyor',
      estimate2026,
      evaluation: evaluationTrend,
    },
    section3: {
      interestRate: interestRatePercent,
      scenarios,
    },
    section4: {
      rentByType: Object.entries(BASE_RENT_ANKARA).map(([type, base]) => ({
        type: `${type} (${type === '1+1' ? '60' : type === '2+1' ? '85' : type === '3+1' ? '120' : '150'}m²)`,
        rent: Math.round(base * multiplier / 1000) * 1000,
      })),
      rentTrend: [
        { year: '2024', rent2plus1: Math.round(15000 * multiplier / 1000) * 1000 },
        { year: '2025', rent2plus1: Math.round(28000 * multiplier / 1000) * 1000, changePercent: 86 },
        { year: '2026', rent2plus1: rent2plus1, changePercent: 14 },
      ],
      tufeRentAnnualPercent: rentIndexAnnualChangePercent,
      disclaimer:
        'Kira bedelleri, TÜFE Kira Endeksi ve şehir çarpanları baz alınarak tahmin edilmiştir. Gerçek kira bedelleri konum ve bina özelliklerine göre değişir.',
    },
    section5: {
      examplePrice: 5_000_000,
      exampleDownPayment: 1_000_000,
      monthlyRent: rent2plus1,
      rentIncreasePercent,
      totalRent10y: Math.round(rentVsMortgage.totalRentCost),
      monthlyMortgage: Math.round(rentVsMortgage.monthlyMortgage),
      totalMortgage10y: Math.round(rentVsMortgage.totalMortgageCost),
      breakEvenYear: rentVsMortgage.breakEvenYear,
      chartData: rentVsChartData,
      recommendation:
        rentVsMortgage.breakEvenYear != null
          ? `${rentVsMortgage.breakEvenYear} yıldan fazla aynı evde kalacaksanız alım daha mantıklı olabilir.`
          : 'Kira ve kredi maliyetlerini karşılaştırarak karar verin.',
    },
    section6: {
      scenarioPrice: 5_000_000,
      monthlyRent: rent2plus1,
      annualRent: rent2plus1 * 12,
      annualCosts: 60_000,
      grossYield: inv.grossYield,
      netYield: inv.netYield,
      paybackYears: Math.round(inv.paybackPeriod * 10) / 10,
      inflationPercent,
      realReturnPercent: realReturn,
      evaluation:
        realReturn < 0
          ? 'Mevcut yüksek enflasyon ortamında kira getirisi enflasyonun altında kalıyor. Uzun vadede değer artışı potansiyeli göz önünde bulundurulmalıdır.'
          : 'Getiri enflasyonu karşılıyor ancak faiz alternatifleriyle kıyaslamak faydalıdır.',
    },
    section7: {
      marketSummary: `${cityName} konut piyasası 2026'da yüksek volatilite gösteriyor. Fiyatlar son 5 yılda %${fiveYearChange.toFixed(0)} artarken, kredi faizleri %${interestRatePercent.toFixed(0)} seviyesinde.`,
      buyIf: [
        `${rentVsMortgage.breakEvenYear ?? 8}+ yıl aynı evde kalacaksanız`,
        'Peşinat için nakit varsa',
        `Aylık ${Math.round(rentVsMortgage.monthlyMortgage / 1000)}K TL taksit ödeyebilirseniz`,
      ],
      waitIf: [
        'Kısa vadeli düşünüyorsanız (5 yıl altı)',
        'Faiz düşüşü bekliyorsanız',
        'Likidite ihtiyacınız varsa',
      ],
      strategy: section7Recommendation,
      risks: [
        { name: 'Faiz riski', level: 'Yüksek' },
        { name: 'Likidite riski', level: 'Orta' },
        { name: 'Değer düşüş riski', level: 'Düşük (uzun vade)' },
        { name: 'Enflasyon koruması', level: 'Orta-Yüksek' },
      ],
    },
  };
}
