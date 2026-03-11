'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { formatCurrency } from '@/lib/mockData';

interface ChartDataPoint {
  month: string;
  income: number;
  expense: number;
}

interface DashboardChartProps {
  data: ChartDataPoint[];
}

export default function DashboardChart({ data }: DashboardChartProps) {
  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={data}>
        <defs>
          <linearGradient id="gradientIncome" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradientExpense" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
        <XAxis
          dataKey="month"
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
          axisLine={false}
        />
        <YAxis
          stroke="#64748b"
          fontSize={12}
          tickLine={false}
          axisLine={false}
          tickFormatter={(v: number) => `${(v / 1000000).toFixed(0)}jt`}
        />
        <Tooltip
          contentStyle={{
            background: '#1e293b',
            border: '1px solid rgba(148,163,184,0.15)',
            borderRadius: '8px',
            color: '#f1f5f9',
            fontSize: '13px',
          }}
          formatter={(value) => formatCurrency(Number(value))}
        />
        <Area
          type="monotone"
          dataKey="income"
          stroke="#14b8a6"
          strokeWidth={2}
          fill="url(#gradientIncome)"
          name="Pemasukan"
        />
        <Area
          type="monotone"
          dataKey="expense"
          stroke="#6366f1"
          strokeWidth={2}
          fill="url(#gradientExpense)"
          name="Pengeluaran"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
