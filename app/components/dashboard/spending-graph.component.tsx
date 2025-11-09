'use client';

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

// Custom dot component for current month
const CustomDot = (props: any) => {
  const { cx, cy, index, currentMonthIndex } = props;
  if (index === currentMonthIndex && cx !== undefined && cy !== undefined) {
    return (
      <g>
        <circle
          cx={cx}
          cy={cy}
          r={8}
          fill="currentColor"
          className="text-black dark:text-white"
          opacity={0.2}
        />
        <circle
          cx={cx}
          cy={cy}
          r={6}
          fill="currentColor"
          className="text-black dark:text-white"
        />
      </g>
    );
  }
  return null;
};

// Custom active dot
const CustomActiveDot = (props: any) => {
  const { cx, cy } = props;
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={8}
        fill="currentColor"
        className="text-black dark:text-white"
        opacity={0.2}
      />
      <circle
        cx={cx}
        cy={cy}
        r={6}
        fill="currentColor"
        className="text-black dark:text-white"
      />
    </g>
  );
};

export default function SpendingGraph({ data, currentMonthIndex }: SpendingGraphProps) {
  // Transform data for recharts
  const chartData = data.map((item) => ({
    month: item.month,
    value: item.value,
  }));

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
            opacity={0.1}
            className="text-black dark:text-white"
          />
          <XAxis
            dataKey="month"
            axisLine={false}
            tickLine={false}
            tick={{ fill: 'currentColor', fontSize: 12, fontWeight: 500 }}
            className="text-black dark:text-white"
            interval={0}
          />
          <YAxis
            hide
            domain={['dataMin - 10', 'dataMax + 10']}
          />
          <Tooltip
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-black dark:bg-white text-white dark:text-black px-4 py-2 rounded-lg shadow-lg border border-gray-200 dark:border-gray-800">
                    <p className="text-sm font-semibold">
                      ฿{payload[0].value}
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
            strokeWidth={3}
            fill="url(#colorGradient)"
            dot={(props: any) => (
              <CustomDot
                {...props}
                currentMonthIndex={currentMonthIndex}
              />
            )}
            activeDot={<CustomActiveDot />}
            className="text-black dark:text-white"
            animationDuration={1000}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

