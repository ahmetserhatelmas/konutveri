import { format, parse, subYears, startOfMonth, endOfMonth } from 'date-fns';
import { tr } from 'date-fns/locale';

// TCMB EVDS API için tarih formatı: DD-MM-YYYY
export function formatDateForEVDS(date: Date): string {
  return format(date, 'dd-MM-yyyy');
}

// API'den gelen tarihi parse et: YYYY-MM-DD
export function parseEVDSDate(dateString: string): Date {
  return parse(dateString, 'yyyy-MM-dd', new Date());
}

// Türkçe tarih formatı
export function formatDateTurkish(date: Date, formatStr: string = 'PPP'): string {
  return format(date, formatStr, { locale: tr });
}

// Son N yılın başlangıç tarihi
export function getStartDateYearsAgo(years: number): Date {
  return subYears(startOfMonth(new Date()), years);
}

// Varsayılan tarih aralıkları
export function getDefaultDateRange() {
  return {
    startDate: formatDateForEVDS(getStartDateYearsAgo(5)),
    endDate: formatDateForEVDS(endOfMonth(new Date())),
  };
}

// Grafik için tarih etiketi
export function formatChartDate(dateString: string, short: boolean = false): string {
  const date = parseEVDSDate(dateString);
  return format(date, short ? 'MM/yyyy' : 'MMM yyyy', { locale: tr });
}
