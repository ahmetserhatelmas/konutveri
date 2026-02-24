'use client';

import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts';

interface TrendChartProps {
  data: { year: string; value: number; label: string }[];
  color?: string;
  height?: number;
}

export function ReportTrendChart({ data, color = '#2563eb', height = 380 }: TrendChartProps) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={data} margin={{ top: 16, right: 24, left: 24, bottom: 80 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis
          dataKey="year"
          stroke="#6b7280"
          tick={{ fontSize: 12, fill: '#374151' }}
          interval={2}
          minTickGap={52}
          angle={-45}
          textAnchor="end"
          height={72}
          tickMargin={12}
        />
        <YAxis stroke="#6b7280" tick={{ fontSize: 12 }} width={36} />
        <Tooltip
          contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
          formatter={(value: number | undefined) => [value != null ? value.toFixed(1) : '—', 'Endeks']}
          labelFormatter={(label) => label}
        />
        <Line type="monotone" dataKey="value" stroke={color} strokeWidth={2} dot={{ r: 2 }} />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}

interface ScenarioBarProps {
  scenarios: { label: string; monthlyPayment: number; totalPayment: number }[];
  height?: number;
}

export function ReportScenarioBarChart({ scenarios, height = 280 }: ScenarioBarProps) {
  const data = scenarios.map((s) => ({
    name: s.label.replace(' TL Ev', ''),
    taksit: Math.round(s.monthlyPayment / 1000),
    toplam: Math.round(s.totalPayment / 1_000_000),
  }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="name" stroke="#6b7280" style={{ fontSize: '11px' }} />
        <YAxis yAxisId="left" stroke="#6b7280" style={{ fontSize: '11px' }} />
        <YAxis yAxisId="right" orientation="right" stroke="#6b7280" style={{ fontSize: '11px' }} />
        <Tooltip
          contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
        />
        <Bar yAxisId="left" dataKey="taksit" fill="#2563eb" name="Aylık Taksit (bin TL)" radius={[4, 4, 0, 0]} />
        <Bar yAxisId="right" dataKey="toplam" fill="#0d9488" name="Toplam (milyon TL)" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

interface RentVsMortgageChartProps {
  data: { year: number; rent: number; mortgage: number }[];
  height?: number;
}

export function ReportRentVsMortgageChart({ data, height = 320 }: RentVsMortgageChartProps) {
  const chartData = data.map((d) => ({
    year: `${d.year}. yıl`,
    kira: Math.round(d.rent / 1_000_000),
    kredi: Math.round(d.mortgage / 1_000_000),
  }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <RechartsLineChart data={chartData} margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
        <XAxis dataKey="year" stroke="#6b7280" style={{ fontSize: '12px' }} />
        <YAxis stroke="#6b7280" style={{ fontSize: '12px' }} unit=" M" />
        <Tooltip
          contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
        />
        <Line type="monotone" dataKey="kira" stroke="#dc2626" strokeWidth={2} name="Kira" dot={false} />
        <Line type="monotone" dataKey="kredi" stroke="#2563eb" strokeWidth={2} name="Kredi" dot={false} />
      </RechartsLineChart>
    </ResponsiveContainer>
  );
}
