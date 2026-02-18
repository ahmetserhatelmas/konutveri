import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/db/supabase';

export async function GET() {
  try {
    const supabase = getServiceSupabase();
    
    // Konut fiyat verilerini kontrol et
    const { data: housingData, error: housingError } = await supabase
      .from('housing_price_index')
      .select('*')
      .order('date', { ascending: false })
      .limit(5);

    // Enflasyon verilerini kontrol et
    const { data: inflationData, error: inflationError } = await supabase
      .from('inflation_rates')
      .select('*')
      .order('date', { ascending: false })
      .limit(5);

    // Toplam sayıları al
    const { count: housingCount } = await supabase
      .from('housing_price_index')
      .select('*', { count: 'exact', head: true });

    const { count: inflationCount } = await supabase
      .from('inflation_rates')
      .select('*', { count: 'exact', head: true });

    return NextResponse.json({
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
