import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/db/supabase';

export async function GET() {
  try {
    const supabase = getServiceSupabase();
    
    // Manuel olarak bir veri ekle
    const testData = {
      date: '2024-05-01',
      city_id: null,
      district_id: null,
      location_type: 'country',
      index_value: 1273.5,
    };

    const { data, error } = await supabase
      .from('housing_price_index')
      .insert(testData)
      .select();

    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Test data inserted',
      data,
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
