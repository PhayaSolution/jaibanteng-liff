'use client';

import { useState, useEffect } from 'react';
import {
  Area,
  AreaChart,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  CartesianGrid,
} from 'recharts';

interface SpendingGraphProps {
  data: Array<{ month: string; value: number }>;
  currentMonthIndex?: number;
}

type ChartDotProps = {
  cx?: number;
  cy?: number;
  index?: number;
  currentMonthIndex?: number;
};

type ActiveDotProps = {
  cx?: number;
  cy?: number;
};

// Custom dot component for current month
const CustomDot = (props: ChartDotProps) => {
  const { cx, cy, index, currentMonthIndex } = props;
  if (index === currentMonthIndex && cx !== undefined && cy !== undefined) {
    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={8}
          fill="currentColor"
          className="text-primary"
          opacity={0.2}
        />
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill="currentColor"
          className="text-primary"
        />
      </g>
    );
  }
  return null;
};

// Custom active dot
const CustomActiveDot = (props: ActiveDotProps) => {
  const { cx, cy } = props;
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={8}
        fill="currentColor"
        className="text-primary"
        opacity={0.2}
      />
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="currentColor"
        className="text-primary"
      />
    </g>
  );
};

export default function SpendingGraph({ data, currentMonthIndex }: SpendingGraphProps) {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Transform data for recharts
  // On mobile, shorten labels (e.g., "10-11" -> "10")
  const chartData = data.map((item) => ({
    month: isMobile && item.month.includes('-') 
      ? item.month.split('-')[0] 
      : item.month,
    value: item.value,
  }));

  // Calculate domain to include zero and handle negative values
  const values = chartData.map((d) => d.value);
  const dataMin = Math.min(...values, 0);
  const dataMax = Math.max(...values, 0);
  const padding = Math.max(Math.abs(dataMin), Math.abs(dataMax)) * 0.1 || 10;
  const yAxisDomain: [number, number] = [
    dataMin - padding,
    dataMax + padding
  ];

  const chartHeight = 280;

  return (
    <div className="w-full" style={{ height: chartHeight }}>
      <ResponsiveContainer width="100%" height={chartHeight}>
        <AreaChart
          data={chartData}
          margin={{ top: 20, right: 20, left: 20, bottom: 20 }}
        >
          <defs>
            <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="currentColor" stopOpacity={0.3} />
              <stop offset="100%" stopColor="currentColor" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
              <stop offset="0%" stopColor="currentColor" stopOpacity={0.5} />
              <stop offset="100%" stopColor="currentColor" stopOpacity={1} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="currentColor"
            opacity={0.05}
            className="text-foreground"
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'currentColor', fontSize: isMobile ? 9 : 12, fontWeight: 500 }}
            className="text-foreground/40"
            // Show every 2nd label on mobile, all labels on desktop
            interval={isMobile ? 1 : 0}
            angle={isMobile ? -45 : 0}
            textAnchor={isMobile ? 'end' : 'middle'}
            height={isMobile ? 60 : 30}
          />
          <YAxis
            hide
            domain={yAxisDomain}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                const value = Number(payload[0].value);
                return (
                  <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md px-4 py-2 rounded-2xl shadow-xl border border-primary/20">
                    <p className="text-sm font-bold text-foreground">
                      {value < 0 ? '-' : ''}{Math.abs(value).toLocaleString('en-US', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })} บ.
                    </p>
                  </div>
                );
              }
              return null;
            }}
            cursor={{ stroke: 'currentColor', strokeWidth: 1, strokeDasharray: '5 5', opacity: 0.3 }}
          />
          <Area
            type="monotone"
            dataKey="value"
            stroke="url(#lineGradient)"
            strokeWidth={4}
            fill="url(#colorGradient)"
            dot={(props) => {
              const { key, ...restProps } = props as ChartDotProps & {
                key?: string | number;
              };
              return (
                <CustomDot
                  key={key}
                  {...restProps}
                  currentMonthIndex={currentMonthIndex}
                />
              );
            }}
            activeDot={<CustomActiveDot />}
            className="text-primary"
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

