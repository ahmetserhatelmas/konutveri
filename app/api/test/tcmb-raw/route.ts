import { NextResponse } from 'next/server';
import { evdsApi } from '@/lib/api/evds';
import { getDefaultDateRange } from '@/lib/utils/date';

export async function GET() {
  try {
    const { startDate, endDate } = getDefaultDateRange();
    const data = await evdsApi.fetchHousingPriceIndex({
      seriesCode: 'TP.KFE.TR',
      startDate,
      endDate,
    });

    return NextResponse.json({
      success: true,
      dataCount: data.length,
      firstThree: data.slice(0, 3),
      lastThree: data.slice(-3),
      sampleKeys: data[0] ? Object.keys(data[0]) : [],
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
