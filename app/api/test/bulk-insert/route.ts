import { NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/db/supabase';

export async function GET() {
  try {
    const supabase = getServiceSupabase();
    
    // Manuel birkaç veri ekle
    const testRecords = [
      { date: '2024-01-01', city_id: null, district_id: null, location_type: 'country', index_value: 1190.1 },
      { date: '2024-02-01', city_id: null, district_id: null, location_type: 'country', index_value: 1215.8 },
      { date: '2024-03-01', city_id: null, district_id: null, location_type: 'country', index_value: 1230.1 },
    ];

    const results = [];
    for (const record of testRecords) {
      const { data, error } = await supabase
        .from('housing_price_index')
        .upsert(record, {
          onConflict: 'date,city_id,district_id,location_type',
        })
        .select();

      results.push({
        record,
        success: !error,
        error: error?.message,
        data,
      });
    }

    return NextResponse.json({
      success: true,
      results,
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
