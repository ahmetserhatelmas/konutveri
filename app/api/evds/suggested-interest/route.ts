import { NextResponse } from 'next/server';
import axios from 'axios';
import {
  EVDS_BASE_URL,
  INTEREST_RATE_SERIES_CANDIDATES,
  FREQUENCY,
  DATA_FORMAT,
} from '@/lib/constants/evds';
import { getDefaultDateRange } from '@/lib/utils/date';

/**
 * Hesaplayıcı için güncel faiz oranı önerisi
 * GET /api/evds/suggested-interest
 *
 * EVDS3’teki faiz serilerini (Kredi Faiz Stok, Reeskont vb.) sırayla dener,
 * veri dönen ilk serinin son değerini yüzde olarak döndürür.
 */
export async function GET() {
  const apiKey = process.env.TCMB_EVDS_API_KEY || '';
  const { startDate, endDate } = getDefaultDateRange();

  for (const seriesCode of INTEREST_RATE_SERIES_CANDIDATES) {
    try {
      const url =
        `${EVDS_BASE_URL}series=${seriesCode}` +
        `&startDate=${startDate}&endDate=${endDate}` +
        `&type=${DATA_FORMAT.JSON}&frequency=${FREQUENCY.MONTHLY}`;
      const res = await axios.get(url, {
        timeout: 12000,
        headers: { key: apiKey, 'Content-Type': 'application/json' },
      });
      const items = res.data?.items ?? [];
      if (items.length === 0) continue;

      const seriesKey = seriesCode.replace(/\./g, '_');
      const last = items[items.length - 1] as Record<string, unknown>;
      const raw = last[seriesKey] ?? last['UNIXTIME'];
      const value = typeof raw === 'number' ? raw : parseFloat(String(raw ?? 0));
      if (Number.isNaN(value) || value <= 0) continue;

      return NextResponse.json({
        success: true,
        seriesCode,
        valuePercent: Math.round(value * 100) / 100,
        note: 'Hesaplayıcıda varsayılan faiz oranı olarak kullanılabilir.',
      });
    } catch {
      continue;
    }
  }

  return NextResponse.json({
    success: false,
    error: 'Denenen faiz serileri EVDS3’ten veri dönmedi (400 veya boş).',
    tried: [...INTEREST_RATE_SERIES_CANDIDATES],
    note: 'Hesaplayıcı sabit %45 varsayımı kullanıyor. EVDS3 arayüzünde seri seçip ağ isteğindeki series= kodunu INTEREST_RATE_SERIES_CANDIDATES’e ekleyebilirsin.',
  });
}
