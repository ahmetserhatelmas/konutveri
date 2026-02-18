// TCMB EVDS API Response Types
export interface EVDSApiResponse<T = any> {
  items?: T[];
  totalCount?: number;
}

export interface EVDSDataPoint {
  Tarih: string; // YYYY-MM-DD format
  TP_HKFE01?: string; // Konut Fiyat Endeksi - Türkiye
  [key: string]: string | undefined; // Diğer seri kodları
}

// Database Types
export interface City {
  id: string;
  name: string;
  slug: string;
  region?: string;
  created_at?: string;
  updated_at?: string;
}

export interface District {
  id: string;
  city_id: string;
  name: string;
  slug: string;
  created_at?: string;
  updated_at?: string;
}

export interface HousingPriceIndex {
  id: string;
  date: string;
  city_id?: string;
  district_id?: string;
  location_type: 'country' | 'city' | 'district';
  index_value: number;
  monthly_change?: number;
  yearly_change?: number;
  created_at?: string;
  updated_at?: string;
}

export interface LoanInterestRate {
  id: string;
  date: string;
  rate_type: 'commercial' | 'housing';
  interest_rate: number;
  currency: 'TRY' | 'USD' | 'EUR';
  created_at?: string;
  updated_at?: string;
}

export interface InflationRate {
  id: string;
  date: string;
  rate_type: 'cpi' | 'rent';
  rate_value: number;
  monthly_change?: number;
  yearly_change?: number;
  created_at?: string;
  updated_at?: string;
}

export interface ExchangeRate {
  id: string;
  date: string;
  currency: 'USD' | 'EUR';
  buying_rate: number;
  selling_rate: number;
  created_at?: string;
  updated_at?: string;
}

// Analysis Types
export interface RentVsMortgageCalculation {
  monthlyRent: number;
  monthlyMortgage: number;
  totalRentCost: number;
  totalMortgageCost: number;
  years: number;
  breakEvenYear?: number;
  recommendation: 'rent' | 'buy' | 'neutral';
}

export interface InvestmentReturn {
  propertyValue: number;
  monthlyRent: number;
  annualReturn: number;
  grossYield: number;
  netYield: number;
  paybackPeriod: number;
}

export interface PriceAnalysis {
  city: string;
  currentIndex: number;
  monthlyChange: number;
  yearlyChange: number;
  fiveYearChange?: number;
  averagePrice?: number;
  pricePerSqm?: number;
}

// Chart Data Types
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  city?: string;
}

export interface CityComparison {
  city: string;
  data: ChartDataPoint[];
}

// API Request/Response Types
export interface FetchHousingDataParams {
  startDate?: string;
  endDate?: string;
  cityId?: string;
  districtId?: string;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// Calculator Input Types
export interface MortgageCalculatorInput {
  propertyPrice: number;
  downPayment: number;
  interestRate: number;
  loanTerm: number; // years
  monthlyRent?: number;
}

export interface InvestmentCalculatorInput {
  propertyPrice: number;
  monthlyRent: number;
  downPayment: number;
  mortgageRate?: number;
  inflationRate?: number;
  maintenanceCost?: number;
  propertyTax?: number;
}
