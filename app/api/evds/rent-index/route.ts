import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';
import {
  EVDS_BASE_URL,
  RENT_INDEX_SERIES,
  INFLATION_SERIES,
  FREQUENCY,
  DATA_FORMAT,
} from '@/lib/constants/evds';
import { getDefaultDateRange } from '@/lib/utils/date';

/**
 * Yeni Kiracı Kira Endeksi (YKKE) veya TÜFE Kira verilerini getir
 * GET /api/evds/rent-index
 * GET /api/evds/rent-index?fallback=cpi  → YKKE yoksa TÜFE Kira (TP.FG0411) dene
 *
 * Hesaplayıcıda kira artışı için kullanılabilir.
 */
export async function GET(request: NextRequest) {
  const fallback = request.nextUrl.searchParams.get('fallback');
  const { startDate, endDate } = getDefaultDateRange();
  const apiKey = process.env.TCMB_EVDS_API_KEY || '';

  const trySeries = (seriesCode: string) => {
    const url =
      `${EVDS_BASE_URL}series=${seriesCode}` +
      `&startDate=${startDate}&endDate=${endDate}` +
      `&type=${DATA_FORMAT.JSON}&frequency=${FREQUENCY.MONTHLY}`;
    return axios.get(url, {
      timeout: 15000,
      headers: { key: apiKey, 'Content-Type': 'application/json' },
    });
  };

  // Önce YKKE dene
  let seriesCode = RENT_INDEX_SERIES.TURKEY;
  let response: Awaited<ReturnType<typeof trySeries>>;

  try {
    response = await trySeries(RENT_INDEX_SERIES.TURKEY);
  } catch (err: unknown) {
    const axiosErr = err as { response?: { status?: number; data?: unknown }; message?: string };
    const evdsStatus = axiosErr.response?.status;
    const evdsData = axiosErr.response?.data;

    // fallback=cpi ile TÜFE Kira (TP.FG0411) dene
    if (fallback === 'cpi' && INFLATION_SERIES.CPI_RENT) {
      try {
        response = await trySeries(INFLATION_SERIES.CPI_RENT);
        seriesCode = INFLATION_SERIES.CPI_RENT;
      } catch (cpiErr: unknown) {
        const cpiAxios = cpiErr as { response?: { status?: number; data?: unknown } };
        return NextResponse.json(
          {
            success: false,
            error: 'YKKE ve TÜFE Kira serileri bu EVDS3 endpoint’inde 400 dönüyor; seriler igmevdsms-dis’te tanımlı olmayabilir.',
            ykkeStatus: evdsStatus,
            ykkeData: typeof evdsData === 'object' ? evdsData : String(evdsData).slice(0, 200),
            cpiRentStatus: cpiAxios.response?.status,
            note: 'Hesaplayıcı kira artışı için sabit %10 varsayımı kullanıyor. TCMB serileri erişilebilir olunca entegre edilebilir.',
          },
          { status: 502 }
        );
      }
    } else {
      return NextResponse.json(
        {
          success: false,
          error: 'YKKE serisi EVDS’den 400 alındı (seri bu endpoint’te desteklenmiyor olabilir).',
          evdsStatus,
          evdsData: typeof evdsData === 'object' ? evdsData : String(evdsData).slice(0, 300),
          hint: '?fallback=cpi ile TÜFE Kira denemek için: GET /api/evds/rent-index?fallback=cpi',
          note: 'Hesaplayıcı kira artışı için sabit %10 varsayımı kullanıyor.',
        },
        { status: 502 }
      );
    }
  }

  const items = response.data?.items ?? [];
  const seriesKey = seriesCode.replace(/\./g, '_');

  const lastFive = items.slice(-5).map((p: Record<string, unknown>) => ({
    Tarih: p.Tarih,
    value: p[seriesKey] ?? null,
  }));

  let annualChangePercent: number | null = null;
  if (items.length >= 13) {
    const last = items[items.length - 1] as Record<string, unknown>;
    const yearAgo = items[items.length - 13] as Record<string, unknown>;
    const vNow = parseFloat(String(last[seriesKey] ?? 0));
    const vOld = parseFloat(String(yearAgo[seriesKey] ?? 0));
    if (vOld > 0) annualChangePercent = ((vNow - vOld) / vOld) * 100;
  }

  return NextResponse.json({
    success: true,
    seriesCode,
    source: seriesCode === RENT_INDEX_SERIES.TURKEY ? 'YKKE' : 'TÜFE Kira (TP.FG0411)',
    dataCount: items.length,
    lastFive,
    annualChangePercent: annualChangePercent != null ? Math.round(annualChangePercent * 10) / 10 : null,
  });
}
