'use client';

import React from 'react';
import {
  LineChart as RechartsLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { CityComparison } from '@/lib/types';
import { formatChartDate } from '@/lib/utils/date';

interface MultiLineChartProps {
  data: CityComparison[];
  title?: string;
  yAxisLabel?: string;
  height?: number;
}

const COLORS = [
  '#3b82f6', // blue
  '#ef4444', // red
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
];

export function MultiLineChart({
  data,
  title,
  yAxisLabel,
  height = 400,
}: MultiLineChartProps) {
  // Combine all data points
  const combinedData: any[] = [];
  const dateMap = new Map<string, any>();

  data.forEach((cityData) => {
    cityData.data.forEach((point) => {
      if (!dateMap.has(point.date)) {
        dateMap.set(point.date, {
          date: point.date,
          formattedDate: formatChartDate(point.date, true),
        });
      }
      const existing = dateMap.get(point.date);
      existing[cityData.city] = point.value;
    });
  });

  dateMap.forEach((value) => combinedData.push(value));
  combinedData.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

  return (
    <div className="w-full">
      {title && (
        <h3 className="text-lg font-semibold text-gray-900 mb-4">{title}</h3>
      )}
      <ResponsiveContainer width="100%" height={height}>
        <RechartsLineChart
          data={combinedData}
          margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis
            dataKey="formattedDate"
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
          />
          <YAxis
            stroke="#6b7280"
            style={{ fontSize: '12px' }}
            label={yAxisLabel ? { value: yAxisLabel, angle: -90, position: 'insideLeft' } : undefined}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '8px 12px',
            }}
          />
          <Legend />
          {data.map((cityData, index) => (
            <Line
              key={cityData.city}
              type="monotone"
              dataKey={cityData.city}
              stroke={COLORS[index % COLORS.length]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
            />
          ))}
        </RechartsLineChart>
      </ResponsiveContainer>
    </div>
  );
}
