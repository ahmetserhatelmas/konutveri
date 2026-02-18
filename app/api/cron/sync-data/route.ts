import { NextRequest, NextResponse } from 'next/server';
import { evdsApi } from '@/lib/api/evds';
import { getServiceSupabase } from '@/lib/db/supabase';
import { MAJOR_CITIES } from '@/lib/constants/cities';
import {
  HOUSING_PRICE_INDEX_SERIES,
  LOAN_INTEREST_RATE_SERIES,
  INFLATION_SERIES,
} from '@/lib/constants/evds';
import { getDefaultDateRange } from '@/lib/utils/date';

/**
 * TCMB tarih formatını PostgreSQL DATE formatına çevir
 * @param tcmbDate - "2024-5" veya "01-05-2024" formatındaki tarih
 * @returns "2024-05-01" formatında tarih
 */
function convertTCMBDateToSQL(tcmbDate: string): string {
  // Eğer "YYYY-M" formatındaysa (örn: "2024-5")
  if (tcmbDate.match(/^\d{4}-\d{1,2}$/)) {
    const [year, month] = tcmbDate.split('-');
    return `${year}-${month.padStart(2, '0')}-01`;
  }
  
  // Eğer "DD-MM-YYYY" formatındaysa (örn: "01-05-2024")
  if (tcmbDate.match(/^\d{2}-\d{2}-\d{4}$/)) {
    const [day, month, year] = tcmbDate.split('-');
    return `${year}-${month}-${day}`;
  }
  
  // Başka format varsa olduğu gibi dön
  return tcmbDate;
}

/**
 * Cron job endpoint - Günlük veri güncelleme
 * Vercel Cron Jobs veya external cron servis tarafından çağrılır
 * Authorization: Bearer {CRON_SECRET}
 */
export async function GET(request: NextRequest) {
  try {
    // Güvenlik kontrolü
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    if (token !== process.env.CRON_SECRET) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // EVDS API yapılandırma kontrolü
    if (!evdsApi.isConfigured()) {
      return NextResponse.json(
        { error: 'EVDS API not configured' },
        { status: 500 }
      );
    }

    // Environment variables kontrolü
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return NextResponse.json(
        { error: 'Supabase not configured' },
        { status: 500 }
      );
    }

    const supabase = getServiceSupabase();
    const results = {
      housingPriceIndex: { success: 0, failed: 0 },
      loanRates: { success: 0, failed: 0 },
      inflationRates: { success: 0, failed: 0 },
    };

    // 1. Konut Fiyat Endeksi Verilerini Çek ve Kaydet (Sadece Türkiye Geneli)
    console.log('Fetching Housing Price Index data...');
    
    try {
      const turkeyCity = MAJOR_CITIES.find(c => c.slug === 'turkiye');
      if (turkeyCity) {
        const { startDate, endDate } = getDefaultDateRange();
        const data = await evdsApi.fetchHousingPriceIndex({
          seriesCode: turkeyCity.evdsCode,
          startDate,
          endDate,
        });

        if (data.length > 0) {
          console.log(`Fetched ${data.length} data points for Turkey`);
          
          // Her veri noktası için kayıt yap
          let successCount = 0;
          let errorCount = 0;
          
          for (const point of data) {
            // TCMB API yanıtında noktalar alt çizgiye dönüşüyor: TP.HKFE01 -> TP_HKFE01
            const seriesKey = turkeyCity.evdsCode.replace(/\./g, '_');
            const indexValue = parseFloat(point[seriesKey] || '0');
            
            if (indexValue > 0) {
              const sqlDate = convertTCMBDateToSQL(point.Tarih);
              const { data: insertedData, error } = await supabase
                .from('housing_price_index')
                .upsert({
                  date: sqlDate,
                  city_id: null,
                  district_id: null,
                  location_type: 'country',
                  index_value: indexValue,
                }, {
                  onConflict: 'date,city_id,district_id,location_type',
                })
                .select();
              
              if (error) {
                console.error(`❌ Error inserting ${point.Tarih} (${sqlDate}):`, error.message, error.details);
                errorCount++;
              } else {
                successCount++;
                if (successCount <= 3 || successCount === data.length) {
                  console.log(`✓ Inserted ${sqlDate}: ${indexValue}`);
                }
              }
            }
          }
          
          console.log(`✓ Turkey housing price index: ${successCount} success, ${errorCount} errors`);
          results.housingPriceIndex.success++;
        } else {
          console.log('⚠ No data returned from API');
          results.housingPriceIndex.failed++;
        }
      }
    } catch (error) {
      console.error(`✗ Failed to update Turkey housing index:`, error);
      results.housingPriceIndex.failed++;
    }

    // 2. Konut Kredisi Faiz Oranlarını Çek ve Kaydet
    // Not: TCMB EVDS'de konut kredisi faiz serisi şu an erişilebilir değil
    // Geçici olarak skip ediliyor
    console.log('⚠ Loan interest rates skipped (series not accessible)');

    // 3. Enflasyon Verilerini Çek ve Kaydet (TÜFE - Genel)
    console.log('Fetching Inflation Rates...');
    
    try {
      const { startDate, endDate } = getDefaultDateRange();
      
      // Genel TÜFE (TP.FG.J0 çalışıyor)
      const cpiData = await evdsApi.fetchInflationRates({
        seriesCode: INFLATION_SERIES.CPI_GENERAL,
        startDate,
        endDate,
      });

      console.log(`Fetched ${cpiData.length} inflation data points`);

      for (const point of cpiData) {
        // TCMB API yanıtında noktalar alt çizgiye dönüşüyor: TP.FG.J0 -> TP_FG_J0
        const seriesKey = INFLATION_SERIES.CPI_GENERAL.replace(/\./g, '_');
        const rateValue = parseFloat(point[seriesKey] || '0');
        
        if (rateValue > 0) {
          const sqlDate = convertTCMBDateToSQL(point.Tarih);
          const { error } = await supabase
            .from('inflation_rates')
            .upsert({
              date: sqlDate,
              rate_type: 'cpi',
              rate_value: rateValue,
            }, {
              onConflict: 'date,rate_type',
            });
          
          if (error) {
            console.error(`Error inserting inflation ${sqlDate}:`, error.message);
          }
        }
      }
      
      results.inflationRates.success++;
      console.log(`✓ Inflation rates updated with ${cpiData.length} records`);
    } catch (error) {
      console.error('✗ Failed to update inflation rates:', error);
      results.inflationRates.failed++;
    }

    // Sonuçları döndür
    return NextResponse.json({
      success: true,
      message: 'Data sync completed',
      results,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('Cron job error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
