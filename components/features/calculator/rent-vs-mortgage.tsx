'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  calculateRentVsMortgage,
  formatCurrency,
  formatPercentage,
} from '@/lib/utils/calculations';
import { MortgageCalculatorInput, RentVsMortgageCalculation } from '@/lib/types';
import { Home, TrendingUp, Calendar } from 'lucide-react';

const DEFAULT_INPUT: MortgageCalculatorInput = {
  propertyPrice: 5000000,
  downPayment: 1000000,
  interestRate: 45,
  loanTerm: 10,
  monthlyRent: 30000,
};

export function RentVsMortgageCalculator() {
  const [input, setInput] = useState<MortgageCalculatorInput>(DEFAULT_INPUT);
  const [result, setResult] = useState<RentVsMortgageCalculation | null>(null);
  const [interestSource, setInterestSource] = useState<string | null>(null);

  useEffect(() => {
    fetch('/api/evds/suggested-interest')
      .then((r) => r.json())
      .then((data) => {
        if (data?.success && typeof data.valuePercent === 'number' && data.valuePercent > 0) {
          setInput((prev) => ({ ...prev, interestRate: data.valuePercent }));
          setInterestSource(data.seriesCode === 'TP.BKR.TRY.18' ? 'TCMB EVDS – Konut Kredisi (TL, Stok, %)' : 'TCMB EVDS');
        }
      })
      .catch(() => {});
  }, []);

  const handleCalculate = () => {
    const calculation = calculateRentVsMortgage(input);
    setResult(calculation);
  };

  const handleInputChange = (field: keyof MortgageCalculatorInput, value: string) => {
    const trimmed = value.trim();
    const num = trimmed === '' || trimmed === '-' ? 0 : parseFloat(trimmed);
    setInput((prev) => ({
      ...prev,
      [field]: Number.isNaN(num) ? prev[field] : num,
    }));
  };

  // 0 değerini boş göster ki kullanıcı silince "0" kalmasın, yeni rakam yanına eklenmesin
  const showNum = (n: number) => (n === 0 ? '' : n);

  const getRecommendationText = (recommendation: string) => {
    switch (recommendation) {
      case 'rent':
        return 'Kiralama daha avantajlı';
      case 'buy':
        return 'Kredi ile alım daha avantajlı';
      default:
        return 'İkisi de benzer maliyetli';
    }
  };

  const getRecommendationColor = (recommendation: string) => {
    switch (recommendation) {
      case 'rent':
        return 'bg-blue-100 text-blue-800';
      case 'buy':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Input Form */}
      <Card>
        <CardHeader>
          <CardTitle>Kira vs Kredi Hesaplayıcı</CardTitle>
          <CardDescription>
            Evinizi alırken kira mı ödemeye devam etmeli, yoksa kredi mi çekmeli?
            Değerler örnektir; faiz oranı ve ev fiyatları için güncel piyasayı kontrol edin.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            label="Ev Fiyatı (₺)"
            type="number"
            value={showNum(input.propertyPrice)}
            onChange={(e) => handleInputChange('propertyPrice', e.target.value)}
            placeholder="5000000"
          />

          <Input
            label="Peşinat (₺)"
            type="number"
            value={showNum(input.downPayment)}
            onChange={(e) => handleInputChange('downPayment', e.target.value)}
            placeholder="1000000"
            helperText="Elinizde bulunan nakit para"
          />

          <Input
            label="Yıllık Faiz Oranı (%)"
            type="number"
            value={showNum(input.interestRate)}
            onChange={(e) => handleInputChange('interestRate', e.target.value)}
            placeholder="45"
            helperText={interestSource ?? 'TCMB EVDS’ten yüklenemediğinde %45 varsayılır'}
          />
          {interestSource && (
            <p className="text-xs text-blue-600 bg-blue-50 rounded px-2 py-1.5">
              Faiz oranı güncel: <strong>{interestSource}</strong> (TCMB Elektronik Veri Dağıtım Sistemi).
            </p>
          )}

          <Input
            label="Kredi Vadesi (Yıl)"
            type="number"
            value={showNum(input.loanTerm)}
            onChange={(e) => handleInputChange('loanTerm', e.target.value)}
            placeholder="10"
          />

          <Input
            label="Aylık Kira (₺)"
            type="number"
            value={showNum(input.monthlyRent)}
            onChange={(e) => handleInputChange('monthlyRent', e.target.value)}
            placeholder="30000"
            helperText="Benzer bir ev için ödenecek kira"
          />

          <Button onClick={handleCalculate} className="w-full" size="lg">
            Hesapla
          </Button>
        </CardContent>
      </Card>

      {/* Results */}
      {result && (
        <Card>
          <CardHeader>
            <CardTitle>Analiz Sonuçları</CardTitle>
            <div
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(
                result.recommendation
              )}`}
            >
              {getRecommendationText(result.recommendation)}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Monthly Comparison */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Home className="w-4 h-4" />
                  <span>Aylık Kira</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(result.monthlyRent)}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <TrendingUp className="w-4 h-4" />
                  <span>Aylık Taksit</span>
                </div>
                <div className="text-2xl font-bold text-gray-900">
                  {formatCurrency(result.monthlyMortgage)}
                </div>
              </div>
            </div>

            {/* Total Costs */}
            <div className="border-t pt-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {result.years} Yıllık Toplam Kira
                </span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(result.totalRentCost)}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">
                  {result.years} Yıllık Toplam Kredi Maliyeti
                </span>
                <span className="font-semibold text-gray-900">
                  {formatCurrency(result.totalMortgageCost)}
                </span>
              </div>

              <div className="flex items-center justify-between pt-2 border-t">
                <span className="text-sm font-medium text-gray-900">Fark</span>
                <span
                  className={`font-bold ${
                    result.totalRentCost < result.totalMortgageCost
                      ? 'text-blue-600'
                      : 'text-green-600'
                  }`}
                >
                  {formatCurrency(Math.abs(result.totalRentCost - result.totalMortgageCost))}
                </span>
              </div>
            </div>

            {/* Break Even */}
            {result.breakEvenYear && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-amber-800 mb-1">
                  <Calendar className="w-4 h-4" />
                  <span className="font-medium">Başabaş Noktası</span>
                </div>
                <p className="text-sm text-amber-700">
                  {result.breakEvenYear} yıl sonra kira maliyeti, kredi maliyetini geçecek
                </p>
              </div>
            )}

            {/* Additional Info */}
            <div className="bg-gray-50 rounded-lg p-4 text-xs text-gray-600 space-y-1">
              <p>* Kira için yıllık %10 artış varsayılmıştır</p>
              <p>* Kredi için sabit faiz oranı varsayılmıştır</p>
              <p>* Vergi, sigorta ve bakım masrafları dahil değildir</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
