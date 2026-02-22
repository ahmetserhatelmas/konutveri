import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/db/supabase';

type CheckDataPayload = {
  success: boolean;
  housingPriceIndex?: { count: number | null; latestData: unknown; error?: string };
  inflationRates?: { count: number | null; latestData: unknown; error?: string };
  error?: string;
};

export async function GET(request: NextRequest) {
  const accept = request?.headers?.get('accept') ?? '';
  const wantsHtml = accept.includes('text/html') || accept === '';

  try {
    const supabase = getServiceSupabase();

    const { data: housingData, error: housingError } = await supabase
      .from('housing_price_index')
      .select('*')
      .order('date', { ascending: false })
      .limit(5);

    const { data: inflationData, error: inflationError } = await supabase
      .from('inflation_rates')
      .select('*')
      .order('date', { ascending: false })
      .limit(5);

    const { count: housingCount } = await supabase
      .from('housing_price_index')
      .select('*', { count: 'exact', head: true });

    const { count: inflationCount } = await supabase
      .from('inflation_rates')
      .select('*', { count: 'exact', head: true });

    const payload: CheckDataPayload = {
      success: true,
      housingPriceIndex: {
        count: housingCount,
        latestData: housingData,
        error: housingError?.message,
      },
      inflationRates: {
        count: inflationCount,
        latestData: inflationData,
        error: inflationError?.message,
      },
    };

    if (wantsHtml) {
      const html = buildCheckDataHtml(payload);
      return new NextResponse(html, {
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
    return NextResponse.json(payload);
  } catch (error) {
    const payload: CheckDataPayload = {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
    if (wantsHtml) {
      const html = buildCheckDataHtml(payload);
      return new NextResponse(html, {
        status: 500,
        headers: { 'Content-Type': 'text/html; charset=utf-8' },
      });
    }
    return NextResponse.json(payload, { status: 500 });
  }
}

function buildCheckDataHtml(payload: CheckDataPayload): string {
  const pre = (s: string) => s.replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const hCount = payload.housingPriceIndex?.count ?? 0;
  const iCount = payload.inflationRates?.count ?? 0;
  const hErr = payload.housingPriceIndex?.error;
  const iErr = payload.inflationRates?.error;
  const err = payload.error;
  const latestH = payload.housingPriceIndex?.latestData
    ? JSON.stringify(payload.housingPriceIndex.latestData, null, 2)
    : '[]';
  const latestI = payload.inflationRates?.latestData
    ? JSON.stringify(payload.inflationRates.latestData, null, 2)
    : '[]';

  return `<!DOCTYPE html>
<html lang="tr">
<head><meta charset="utf-8"><title>Veri Kontrolü</title></head>
<body style="font-family: system-ui; max-width: 800px; margin: 2rem auto; padding: 0 1rem; background: #fff; color: #111;">
  <h1>Veri kontrolü</h1>
  <p><strong>Durum:</strong> ${payload.success ? '✓ Başarılı' : '✗ Hata'}</p>
  ${err ? `<p style="color: red;"><strong>Hata:</strong> ${pre(err)}</p>` : ''}
  <h2>Konut fiyat endeksi (housing_price_index)</h2>
  <p><strong>Toplam kayıt:</strong> ${hCount}</p>
  ${hErr ? `<p style="color: red;">${pre(hErr)}</p>` : ''}
  <p><strong>Son 5 kayıt:</strong></p>
  <pre style="background: #f0f0f0; padding: 1rem; overflow: auto;">${pre(latestH)}</pre>
  <h2>Enflasyon (inflation_rates)</h2>
  <p><strong>Toplam kayıt:</strong> ${iCount}</p>
  ${iErr ? `<p style="color: red;">${pre(iErr)}</p>` : ''}
  <p><strong>Son 5 kayıt:</strong></p>
  <pre style="background: #f0f0f0; padding: 1rem; overflow: auto;">${pre(latestI)}</pre>
  <p><small>JSON için: <code>curl -s "http://localhost:3000/api/test/check-data"</code></small></p>
</body>
</html>`;
}
