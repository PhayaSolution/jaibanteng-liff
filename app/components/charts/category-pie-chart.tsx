'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

interface CategoryData {
  id: string;
  name: string;
  emoji: string | null;
  amount: number;
  percentage: number;
  [key: string]: any;
}

interface CategoryPieChartProps {
  data: CategoryData[];
}

const COLORS = [
  '#3b82f6', // Blue
  '#10b981', // Emerald
  '#f59e0b', // Amber
  '#ef4444', // Red
  '#8b5cf6', // Violet
  '#ec4899', // Pink
  '#06b6d4', // Cyan
  '#f97316', // Orange
  '#14b8a6', // Teal
  '#6366f1', // Indigo
];

export default function CategoryPieChart({ data }: CategoryPieChartProps) {
  if (data.length === 0) {
    return (
      <div className="flex items-center justify-center h-[300px] text-gray-400 text-sm font-medium">
        No data available for this period
      </div>
    );
  }

  return (
    <div className="w-full flex flex-col">
      <div className="w-full h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={70}
              outerRadius={95}
              paddingAngle={4}
              dataKey="amount"
              nameKey="name"
              startAngle={90}
              endAngle={450}
            >
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  stroke="none"
                />
              ))}
            </Pie>
            <Tooltip 
              formatter={(value: number) => [`${value.toLocaleString('en-US')} THB`, 'Total']}
              contentStyle={{ 
                borderRadius: '16px', 
                border: 'none', 
                boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1), 0 8px 10px -6px rgba(0,0,0,0.1)',
                padding: '12px'
              }}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>

      {/* Custom Legend to prevent browser-level highlighting/focus issues */}
      <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 mt-6 px-2 select-none pointer-events-none">
        {data.map((entry, index) => (
          <div 
            key={`legend-${entry.id}`} 
            className="flex items-center gap-1.5"
            style={{ WebkitTapHighlightColor: 'transparent' }}
          >
            <div 
              className="w-2.5 h-2.5 rounded-full shrink-0" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }}
            />
            <span className="text-[11px] text-gray-600 dark:text-gray-400 font-bold whitespace-nowrap">
              {entry.emoji} {entry.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
