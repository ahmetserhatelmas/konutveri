import { NextRequest, NextResponse } from 'next/server';
import { evdsApi } from '@/lib/api/evds';

/**
 * Şehir bazlı konut fiyat endeksi verilerini getir
 * GET /api/evds/housing-price-index?city=istanbul&startDate=01-01-2021&endDate=28-02-2026
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    if (!city) {
      return NextResponse.json(
        { error: 'City parameter is required' },
        { status: 400 }
      );
    }

    // EVDS seri kodunu belirle (şimdilik basit mapping)
    const seriesCodeMap: Record<string, string> = {
      'turkiye': 'TP.HKFE01',
      'istanbul': 'TP.HKFE01.IS',
      'ankara': 'TP.HKFE01.AN',
      'izmir': 'TP.HKFE01.IZ',
      'antalya': 'TP.HKFE01.AT',
      'bursa': 'TP.HKFE01.BR',
      'adana': 'TP.HKFE01.AD',
      'konya': 'TP.HKFE01.KO',
      'gaziantep': 'TP.HKFE01.GA',
      'kocaeli': 'TP.HKFE01.KC',
    };

    const seriesCode = seriesCodeMap[city.toLowerCase()];

    if (!seriesCode) {
      return NextResponse.json(
        { error: 'Invalid city parameter' },
        { status: 400 }
      );
    }

    const data = await evdsApi.fetchHousingPriceIndex({
      seriesCode,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    return NextResponse.json({
      success: true,
      data,
      city,
    });

  } catch (error) {
    console.error('Housing Price Index API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
