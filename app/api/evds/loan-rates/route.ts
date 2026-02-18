import { NextRequest, NextResponse } from 'next/server';
import { evdsApi } from '@/lib/api/evds';
import { LOAN_INTEREST_RATE_SERIES } from '@/lib/constants/evds';

/**
 * Konut kredisi faiz oranlarını getir
 * GET /api/evds/loan-rates?startDate=01-01-2021&endDate=28-02-2026
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    const data = await evdsApi.fetchLoanInterestRates({
      seriesCode: LOAN_INTEREST_RATE_SERIES.HOUSING_LOAN_TRY,
      startDate: startDate || undefined,
      endDate: endDate || undefined,
    });

    return NextResponse.json({
      success: true,
      data,
    });

  } catch (error) {
    console.error('Loan Rates API Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
