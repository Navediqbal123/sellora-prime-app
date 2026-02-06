import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
} from 'recharts';
import { Skeleton } from '@/components/ui/skeleton';

interface ChartData {
  name: string;
  value: number;
}

interface ViewsChartProps {
  data: ChartData[];
  loading?: boolean;
}

interface ClicksChartProps {
  data: ChartData[];
  loading?: boolean;
}

interface CategoryChartProps {
  data: ChartData[];
  loading?: boolean;
}

const COLORS = [
  'hsl(262, 83%, 58%)', 
  'hsl(168, 84%, 44%)', 
  'hsl(45, 93%, 58%)', 
  'hsl(142, 76%, 36%)', 
  'hsl(38, 92%, 50%)',
  'hsl(280, 70%, 50%)',
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl p-4 shadow-2xl animate-fade-in">
        <p className="text-sm text-muted-foreground mb-1">{label}</p>
        <p className="text-2xl font-bold text-primary">{payload[0].value.toLocaleString()}</p>
      </div>
    );
  }
  return null;
};

const ChartContainer: React.FC<{ title: string; children: React.ReactNode; loading?: boolean }> = ({ 
  title, 
  children,
  loading 
}) => (
  <div className="relative overflow-hidden p-6 rounded-2xl bg-gradient-to-br from-card via-card/80 to-card/40 border border-border/50 backdrop-blur-xl animate-fade-in-up">
    {/* Glassmorphism effect */}
    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.02] to-transparent" />
    
    <div className="relative z-10">
      <h3 className="text-lg font-semibold mb-6 text-foreground">{title}</h3>
      {loading ? (
        <div className="space-y-4 h-[280px] flex flex-col justify-center">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-4/5" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-4 w-5/6" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ) : (
        children
      )}
    </div>
  </div>
);

export const ViewsLineChart: React.FC<ViewsChartProps> = ({ data, loading }) => {
  return (
    <ChartContainer title="Views Over Time" loading={loading}>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.4} />
              <stop offset="100%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0} />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 18%)" strokeOpacity={0.5} />
          <XAxis 
            dataKey="name" 
            stroke="hsl(215, 20%, 45%)" 
            fontSize={11} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="hsl(215, 20%, 45%)" 
            fontSize={11} 
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="value" 
            stroke="hsl(262, 83%, 58%)" 
            strokeWidth={3}
            fill="url(#viewsGradient)"
            filter="url(#glow)"
            animationDuration={2000}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export const ClicksBarChart: React.FC<ClicksChartProps> = ({ data, loading }) => {
  return (
    <ChartContainer title="Clicks Per Product" loading={loading}>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data} barCategoryGap="20%">
          <defs>
            <linearGradient id="clicksGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(168, 84%, 50%)" stopOpacity={1} />
              <stop offset="100%" stopColor="hsl(168, 84%, 35%)" stopOpacity={0.8} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 18%)" strokeOpacity={0.5} />
          <XAxis 
            dataKey="name" 
            stroke="hsl(215, 20%, 45%)" 
            fontSize={11} 
            tickLine={false}
            axisLine={false}
          />
          <YAxis 
            stroke="hsl(215, 20%, 45%)" 
            fontSize={11} 
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="value" 
            fill="url(#clicksGradient)" 
            radius={[8, 8, 0, 0]}
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export const CategoryDonutChart: React.FC<CategoryChartProps> = ({ data, loading }) => {
  // Transform data to match Recharts expected format
  const chartData = data.map((item) => ({ ...item }));
  
  return (
    <ChartContainer title="Products by Category" loading={loading}>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <defs>
            {COLORS.map((color, index) => (
              <linearGradient key={index} id={`pieGradient${index}`} x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={1} />
                <stop offset="100%" stopColor={color} stopOpacity={0.7} />
              </linearGradient>
            ))}
          </defs>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={95}
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
            animationDuration={1500}
            animationEasing="ease-out"
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={`url(#pieGradient${index % COLORS.length})`}
                stroke="transparent"
              />
            ))}
          </Pie>
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-card/95 backdrop-blur-xl border border-border/50 rounded-xl p-4 shadow-2xl animate-fade-in">
                    <p className="text-sm text-muted-foreground mb-1">{payload[0].name}</p>
                    <p className="text-2xl font-bold text-primary">{payload[0].value}</p>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {data.map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-2 px-2 py-1 rounded-lg bg-white/5">
            <div 
              className="w-2.5 h-2.5 rounded-full" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }} 
            />
            <span className="text-xs text-muted-foreground">{entry.name}</span>
          </div>
        ))}
      </div>
    </ChartContainer>
  );
};
