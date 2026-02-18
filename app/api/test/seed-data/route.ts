import { NextRequest, NextResponse } from 'next/server';
import { getServiceSupabase } from '@/lib/db/supabase';
import { MAJOR_CITIES } from '@/lib/constants/cities';

/**
 * Test endpoint - Mock veri ile database'i doldur
 * GET /api/test/seed-data
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = getServiceSupabase();
    
    console.log('🌱 Seeding test data...');
    
    // Mock konut fiyat endeksi verileri
    const mockData = [];
    const startDate = new Date('2021-02-01');
    const endDate = new Date('2026-02-01');
    
    for (const city of MAJOR_CITIES) {
      if (city.slug === 'turkiye') continue;
      
      // Get city ID
      const { data: cityData } = await supabase
        .from('cities')
        .select('id')
        .eq('slug', city.slug)
        .single();
      
      if (!cityData) continue;
      
      let currentIndex = 100; // 2023 = 100 baz
      const monthlyIncrease = 1.5 + Math.random() * 0.5; // %1.5-2 aylık artış
      
      // 5 yıllık veri oluştur
      for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        
        mockData.push({
          date: dateStr,
          city_id: cityData.id,
          location_type: 'city',
          index_value: parseFloat(currentIndex.toFixed(2)),
          monthly_change: parseFloat((Math.random() * 3).toFixed(2)),
          yearly_change: parseFloat((Math.random() * 30 + 15).toFixed(2))
        });
        
        currentIndex *= (1 + monthlyIncrease / 100);
      }
    }
    
    // Türkiye geneli
    const { data: turkeyCity } = await supabase
      .from('cities')
      .select('id')
      .eq('slug', 'turkiye')
      .single();
    
    if (turkeyCity) {
      let currentIndex = 100;
      for (let d = new Date(startDate); d <= endDate; d.setMonth(d.getMonth() + 1)) {
        const dateStr = d.toISOString().split('T')[0];
        
        mockData.push({
          date: dateStr,
          city_id: turkeyCity.id,
          location_type: 'country',
          index_value: parseFloat(currentIndex.toFixed(2)),
          monthly_change: parseFloat((Math.random() * 2.5).toFixed(2)),
          yearly_change: parseFloat((Math.random() * 25 + 20).toFixed(2))
        });
        
        currentIndex *= 1.018; // %1.8 aylık
      }
    }
    
    console.log(`📊 Inserting ${mockData.length} housing price index records...`);
    
    // Batch insert
    const { error: hpiError } = await supabase
      .from('housing_price_index')
      .upsert(mockData, {
        onConflict: 'date,city_id,district_id,location_type',
        ignoreDuplicates: false
      });
    
    if (hpiError) {
      console.error('Error inserting HPI:', hpiError);
    } else {
      console.log('✅ Housing price index data inserted');
    }
    
    // Mock kredi faiz oranları
    const loanRates = [];
    for (let d = new Date('2025-01-01'); d <= new Date('2026-02-15'); d.setDate(d.getDate() + 7)) {
      loanRates.push({
        date: d.toISOString().split('T')[0],
        rate_type: 'housing',
        interest_rate: parseFloat((42 + Math.random() * 5).toFixed(2)),
        currency: 'TRY'
      });
    }
    
    const { error: loanError } = await supabase
      .from('loan_interest_rates')
      .upsert(loanRates, {
        onConflict: 'date,rate_type,currency'
      });
    
    if (loanError) {
      console.error('Error inserting loan rates:', loanError);
    } else {
      console.log('✅ Loan rates inserted');
    }
    
    // Mock enflasyon
    const inflationData = [];
    for (let d = new Date('2021-01-01'); d <= new Date('2026-02-01'); d.setMonth(d.getMonth() + 1)) {
      inflationData.push({
        date: d.toISOString().split('T')[0],
        rate_type: 'cpi',
        rate_value: parseFloat((1500 + Math.random() * 500).toFixed(2)),
        yearly_change: parseFloat((Math.random() * 20 + 40).toFixed(2))
      });
      
      inflationData.push({
        date: d.toISOString().split('T')[0],
        rate_type: 'rent',
        rate_value: parseFloat((2000 + Math.random() * 600).toFixed(2)),
        yearly_change: parseFloat((Math.random() * 25 + 45).toFixed(2))
      });
    }
    
    const { error: inflationError } = await supabase
      .from('inflation_rates')
      .upsert(inflationData, {
        onConflict: 'date,rate_type'
      });
    
    if (inflationError) {
      console.error('Error inserting inflation:', inflationError);
    } else {
      console.log('✅ Inflation data inserted');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Test data seeded successfully',
      stats: {
        housingPriceIndex: mockData.length,
        loanRates: loanRates.length,
        inflationRates: inflationData.length
      }
    });
    
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
