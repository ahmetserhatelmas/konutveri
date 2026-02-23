import { NextResponse } from 'next/server';
import { evdsApi } from '@/lib/api/evds';
import { getServiceSupabase } from '@/lib/db/supabase';
import { EVDS_BASE_URL } from '@/lib/constants/evds';
import { getDefaultDateRange } from '@/lib/utils/date';

/**
 * EVDS3 veri doğrulama: Ham EVDS3 yanıtı ile Supabase'deki veriyi karşılaştır.
 * Verinin sadece EVDS3'ten geldiğini ve karışma olmadığını kanıtlamak için kullanılır.
 *
 * curl "http://localhost:3000/api/test/verify-evds"
 */
export async function GET() {
  try {
    const { startDate, endDate } = getDefaultDateRange();
    const seriesCode = 'TP.KFE.TR'; // Türkiye
    const seriesKey = seriesCode.replace(/\./g, '_'); // EVDS yanıtında TP_KFE_TR

    // 1) Kaynak bilgisi – tek yazma yolu cron, cron sadece EVDS3 kullanıyor
    const sourceInfo = {
      evdsBaseUrl: EVDS_BASE_URL,
      seriesCode,
      note: 'Konut fiyat verisi SADECE /api/cron/sync-data ile yazılıyor. Cron SADECE EVDS3 (igmevdsms-dis) kullanıyor. EVDS2 veya başka kaynak yok.',
    };

    // 2) EVDS3'ten son veriler (ham API yanıtı)
    const evdsData = await evdsApi.fetchHousingPriceIndex({
      seriesCode,
      startDate,
      endDate,
    });
    const evds3Last5 = evdsData.slice(-5).map((p: Record<string, unknown>) => ({
      Tarih: p.Tarih,
      value: p[seriesKey] ?? null,
    }));

    // 3) Supabase'deki Türkiye verisi – tarih bazında tekil (aynı tarih birden fazla satırda olabilir)
    const supabase = getServiceSupabase();
    const { data: dbRows } = await supabase
      .from('housing_price_index')
      .select('date, index_value')
      .is('city_id', null)
      .eq('location_type', 'country')
      .order('date', { ascending: false })
      .limit(50);

    const seen = new Set<string>();
    const uniqueByDate = (dbRows ?? []).filter((r) => {
      if (seen.has(r.date)) return false;
      seen.add(r.date);
      return true;
    });
    const supabaseLast5 = uniqueByDate.slice(0, 5).map((r) => ({
      date: r.date,
      index_value: r.index_value,
    }));

    const duplicateDatesCount = (dbRows ?? []).length - uniqueByDate.length;
    const duplicateNote =
      duplicateDatesCount > 0
        ? `Uyarı: Supabase'de aynı tarih için ${duplicateDatesCount} fazla satır var (country). Unique constraint kontrol edilmeli.`
        : null;

    // 4) Karşılaştırma
    const evdsByDate: Record<string, number> = {};
    evdsData.forEach((p: Record<string, unknown>) => {
      const t = String(p.Tarih ?? '');
      if (t.match(/^\d{4}-\d{1,2}$/)) {
        const [y, m] = t.split('-');
        const date = `${y}-${m.padStart(2, '0')}-01`;
        evdsByDate[date] = parseFloat(String(p[seriesKey] ?? 0));
      }
    });

    const comparison = supabaseLast5.map((r) => {
      const evdsVal = evdsByDate[r.date];
      const match = evdsVal != null && Math.abs(evdsVal - r.index_value) < 0.01;
      return {
        date: r.date,
        supabase_value: r.index_value,
        evds3_value: evdsVal ?? null,
        match: match ? 'yes' : (evdsVal == null ? 'no_evds_date' : 'mismatch'),
      };
    });

    return NextResponse.json({
      success: true,
      sourceInfo,
      evds3Last5,
      supabaseLast5,
      comparison,
      duplicateNote,
      summary:
        comparison.length === 0
          ? 'Supabase\'de Türkiye verisi yok (cron henüz çalışmamış olabilir).'
          : comparison.every((c) => c.match === 'yes')
            ? 'Tüm tarihlerde EVDS3 ile Supabase değerleri eşleşiyor – veri EVDS3 kaynaklı, karışma yok.'
            : 'Bazı tarihlerde eşleşme yok veya EVDS\'de o tarih yok – comparison detayına bakın.',
    });
  } catch (error) {
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
