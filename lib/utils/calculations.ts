import {
  MortgageCalculatorInput,
  InvestmentCalculatorInput,
  RentVsMortgageCalculation,
  InvestmentReturn,
} from '@/lib/types';

/**
 * Aylık kredi taksiti hesaplama
 * PMT formülü: P * [r(1+r)^n] / [(1+r)^n - 1]
 */
export function calculateMonthlyMortgage(
  principal: number,
  annualRate: number,
  years: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const numberOfPayments = years * 12;
  
  if (monthlyRate === 0) return principal / numberOfPayments;
  
  const monthlyPayment =
    (principal * monthlyRate * Math.pow(1 + monthlyRate, numberOfPayments)) /
    (Math.pow(1 + monthlyRate, numberOfPayments) - 1);
  
  return monthlyPayment;
}

/**
 * Kira vs Kredi karşılaştırması
 */
export function calculateRentVsMortgage(
  input: MortgageCalculatorInput
): RentVsMortgageCalculation {
  const loanAmount = input.propertyPrice - input.downPayment;
  const monthlyMortgage = calculateMonthlyMortgage(
    loanAmount,
    input.interestRate,
    input.loanTerm
  );
  
  const monthlyRent = input.monthlyRent || 0;
  const totalMonths = input.loanTerm * 12;
  
  // Toplam kira maliyeti (yıllık %10 artışla)
  let totalRentCost = 0;
  let currentRent = monthlyRent;
  for (let year = 0; year < input.loanTerm; year++) {
    totalRentCost += currentRent * 12;
    currentRent *= 1.10; // Yıllık %10 kira artışı varsayımı
  }
  
  // Toplam kredi maliyeti
  const totalMortgageCost = monthlyMortgage * totalMonths + input.downPayment;
  
  // Break-even yılını hesapla
  let breakEvenYear: number | undefined;
  let cumulativeRent = 0;
  let currentRentForBreakEven = monthlyRent;
  
  for (let year = 1; year <= input.loanTerm; year++) {
    cumulativeRent += currentRentForBreakEven * 12;
    const cumulativeMortgage = monthlyMortgage * year * 12 + input.downPayment;
    
    if (cumulativeRent >= cumulativeMortgage && !breakEvenYear) {
      breakEvenYear = year;
      break;
    }
    currentRentForBreakEven *= 1.10;
  }
  
  // Öneri
  let recommendation: 'rent' | 'buy' | 'neutral' = 'neutral';
  if (totalRentCost < totalMortgageCost * 0.8) {
    recommendation = 'rent';
  } else if (totalMortgageCost < totalRentCost * 0.9) {
    recommendation = 'buy';
  }
  
  return {
    monthlyRent,
    monthlyMortgage,
    totalRentCost,
    totalMortgageCost,
    years: input.loanTerm,
    breakEvenYear,
    recommendation,
  };
}

/**
 * Yatırım getirisi hesaplama
 */
export function calculateInvestmentReturn(
  input: InvestmentCalculatorInput
): InvestmentReturn {
  const annualRent = input.monthlyRent * 12;
  
  // Brüt getiri
  const grossYield = (annualRent / input.propertyPrice) * 100;
  
  // Net getiri (masraflar düşüldükten sonra)
  const maintenanceCost = input.maintenanceCost || input.propertyPrice * 0.01; // %1 varsayılan
  const propertyTax = input.propertyTax || input.propertyPrice * 0.002; // %0.2 varsayılan
  const annualCosts = maintenanceCost + propertyTax;
  
  const netAnnualIncome = annualRent - annualCosts;
  const netYield = (netAnnualIncome / input.propertyPrice) * 100;
  
  // Amortisman süresi (yıl)
  const paybackPeriod = input.propertyPrice / netAnnualIncome;
  
  // Yıllık getiri (TL)
  const annualReturn = netAnnualIncome;
  
  return {
    propertyValue: input.propertyPrice,
    monthlyRent: input.monthlyRent,
    annualReturn,
    grossYield,
    netYield,
    paybackPeriod,
  };
}

/**
 * Enflasyona göre gerçek getiri hesaplama
 */
export function calculateRealReturn(
  nominalReturn: number,
  inflationRate: number
): number {
  return ((1 + nominalReturn / 100) / (1 + inflationRate / 100) - 1) * 100;
}

/**
 * Yüzde değişim hesaplama
 */
export function calculatePercentageChange(
  oldValue: number,
  newValue: number
): number {
  if (oldValue === 0) return 0;
  return ((newValue - oldValue) / oldValue) * 100;
}

/**
 * Sayıyı Türk Lirası formatında göster
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('tr-TR', {
    style: 'currency',
    currency: 'TRY',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Sayıyı yüzde formatında göster
 */
export function formatPercentage(value: number, decimals: number = 2): string {
  return `%${value.toFixed(decimals)}`;
}
