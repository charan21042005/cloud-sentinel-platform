'use client';

import React from 'react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { TimeSeriesDataPoint } from '../types';

interface TimeSeriesChartProps {
  data: TimeSeriesDataPoint[];
  color: string;
  dataKey?: string;
  valueSuffix?: string;
}

export default function TimeSeriesChart({ 
  data, 
  color, 
  dataKey = 'value',
  valueSuffix = ''
}: TimeSeriesChartProps) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 5, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id={`color-${color}`} x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={color} stopOpacity={0.3} />
            <stop offset="95%" stopColor={color} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#27272a" />
        <XAxis 
          dataKey="timestamp" 
          tickFormatter={(tick) => {
            const date = new Date(tick);
            return `${date.getHours()}:${date.getMinutes().toString().padStart(2, '0')}`;
          }}
          stroke="#52525b" 
          fontSize={10}
          tickLine={false}
          axisLine={false}
          minTickGap={20}
        />
        <YAxis 
          hide 
          domain={['dataMin - 5', 'dataMax + 5']} 
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: '#09090b', 
            borderColor: '#27272a',
            borderRadius: '8px',
            fontSize: '12px'
          }}
          itemStyle={{ color: '#fafafa' }}
          labelStyle={{ color: '#a1a1aa', marginBottom: '4px' }}
          formatter={(value: number) => [`${value}${valueSuffix}`, 'Value']}
          labelFormatter={(label) => new Date(label).toLocaleTimeString()}
        />
        <Area 
          type="monotone" 
          dataKey={dataKey} 
          stroke={color} 
          strokeWidth={2}
          fillOpacity={1} 
          fill={`url(#color-${color})`} 
          isAnimationActive={false} // Disable animation for high-frequency polling to prevent stuttering
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
