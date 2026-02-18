import axios, { AxiosInstance, AxiosError } from 'axios';
import {
  EVDS_BASE_URL,
  FREQUENCY,
  DATA_FORMAT,
  DEFAULT_START_DATE,
} from '@/lib/constants/evds';
import { EVDSApiResponse, EVDSDataPoint } from '@/lib/types';
import { formatDateForEVDS } from '@/lib/utils/date';

class EVDSApiClient {
  private client: AxiosInstance;
  private apiKey: string;

  constructor() {
    this.apiKey = process.env.TCMB_EVDS_API_KEY || '';
    
    this.client = axios.create({
      baseURL: EVDS_BASE_URL,
      timeout: 30000,
      headers: {
        'key': this.apiKey,
        'Content-Type': 'application/json',
      },
    });
  }

  /**
   * Genel EVDS veri çekme metodu
   */
  async fetchData(params: {
    series: string | string[];
    startDate?: string;
    endDate?: string;
    frequency?: number;
    formulas?: string;
    aggregationType?: number;
  }): Promise<EVDSDataPoint[]> {
    try {
      const seriesCodes = Array.isArray(params.series) 
        ? params.series.join('-') 
        : params.series;

      // TCMB EVDS API formatı: /service/evds/series=CODE&startDate=...
      const url = `/series=${seriesCodes}` +
        `&startDate=${params.startDate || DEFAULT_START_DATE}` +
        `&endDate=${params.endDate || formatDateForEVDS(new Date())}` +
        `&type=${DATA_FORMAT.JSON}` +
        `&frequency=${params.frequency || FREQUENCY.MONTHLY}` +
        (params.formulas ? `&formulas=${params.formulas}` : '') +
        (params.aggregationType ? `&aggregationType=${params.aggregationType}` : '');

      const response = await this.client.get<EVDSApiResponse<EVDSDataPoint>>(url);

      return response.data.items || [];
    } catch (error) {
      this.handleError(error);
      return [];
    }
  }

  /**
   * Konut Fiyat Endeksi verilerini çek
   */
  async fetchHousingPriceIndex(params: {
    seriesCode: string;
    startDate?: string;
    endDate?: string;
  }): Promise<EVDSDataPoint[]> {
    return this.fetchData({
      series: params.seriesCode,
      startDate: params.startDate,
      endDate: params.endDate,
      frequency: FREQUENCY.MONTHLY,
    });
  }

  /**
   * Çoklu şehir konut fiyat endeksi verilerini çek
   */
  async fetchMultipleCitiesHPI(params: {
    seriesCodes: string[];
    startDate?: string;
    endDate?: string;
  }): Promise<EVDSDataPoint[]> {
    return this.fetchData({
      series: params.seriesCodes,
      startDate: params.startDate,
      endDate: params.endDate,
      frequency: FREQUENCY.MONTHLY,
    });
  }

  /**
   * Konut kredisi faiz oranlarını çek
   */
  async fetchLoanInterestRates(params: {
    seriesCode: string;
    startDate?: string;
    endDate?: string;
  }): Promise<EVDSDataPoint[]> {
    return this.fetchData({
      series: params.seriesCode,
      startDate: params.startDate,
      endDate: params.endDate,
      frequency: FREQUENCY.MONTHLY,
    });
  }

  /**
   * Enflasyon verilerini çek (TÜFE)
   */
  async fetchInflationRates(params: {
    seriesCode: string;
    startDate?: string;
    endDate?: string;
  }): Promise<EVDSDataPoint[]> {
    return this.fetchData({
      series: params.seriesCode,
      startDate: params.startDate,
      endDate: params.endDate,
      frequency: FREQUENCY.MONTHLY,
    });
  }

  /**
   * Döviz kuru verilerini çek
   */
  async fetchExchangeRates(params: {
    seriesCodes: string[];
    startDate?: string;
    endDate?: string;
  }): Promise<EVDSDataPoint[]> {
    return this.fetchData({
      series: params.seriesCodes,
      startDate: params.startDate,
      endDate: params.endDate,
      frequency: FREQUENCY.DAILY,
    });
  }

  /**
   * Hata yönetimi
   */
  private handleError(error: unknown): void {
    if (axios.isAxiosError(error)) {
      const axiosError = error as AxiosError;
      
      if (axiosError.response) {
        console.error('EVDS API Error:', {
          status: axiosError.response.status,
          data: axiosError.response.data,
        });
        
        if (axiosError.response.status === 401) {
          throw new Error('EVDS API Key geçersiz. Lütfen API anahtarınızı kontrol edin.');
        }
        
        if (axiosError.response.status === 429) {
          throw new Error('EVDS API rate limit aşıldı. Lütfen daha sonra tekrar deneyin.');
        }
      } else if (axiosError.request) {
        console.error('EVDS API No Response:', axiosError.request);
        throw new Error('EVDS API yanıt vermedi. Lütfen internet bağlantınızı kontrol edin.');
      }
    }
    
    console.error('EVDS API Unknown Error:', error);
    throw new Error('EVDS API ile iletişimde bilinmeyen bir hata oluştu.');
  }

  /**
   * API Key kontrolü
   */
  isConfigured(): boolean {
    return !!this.apiKey && this.apiKey.length > 0;
  }
}

// Singleton instance
export const evdsApi = new EVDSApiClient();
