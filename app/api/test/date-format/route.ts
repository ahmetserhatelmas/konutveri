import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/db/supabase';

export async function GET() {
  try {
    const supabase = getServiceSupabase();
    
    // TCMB'den gelen tarih formatı: "2024-5"
    const testDate = '2024-4';
    const [year, month] = testDate.split('-');
    const sqlDate = `${year}-${month.padStart(2, '0')}-01`;
    
    console.log('Test date conversion:', { tcmbDate: testDate, sqlDate });
    
    const { data, error } = await supabase
      .from('housing_price_index')
      .insert({
        date: sqlDate,
        city_id: null,
        district_id: null,
        location_type: 'country',
        index_value: 1257.6,
      })
      .select();

    return NextResponse.json({
      success: !error,
      sqlDate,
      data,
      error: error?.message,
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
