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

// Sample data for UI demonstration
const viewsData = [
  { name: 'Mon', views: 120 },
  { name: 'Tue', views: 180 },
  { name: 'Wed', views: 150 },
  { name: 'Thu', views: 280 },
  { name: 'Fri', views: 220 },
  { name: 'Sat', views: 350 },
  { name: 'Sun', views: 400 },
];

const clicksData = [
  { name: 'Product A', clicks: 45 },
  { name: 'Product B', clicks: 72 },
  { name: 'Product C', clicks: 38 },
  { name: 'Product D', clicks: 89 },
  { name: 'Product E', clicks: 56 },
];

const categoryData = [
  { name: 'Electronics', value: 35 },
  { name: 'Fashion', value: 28 },
  { name: 'Home', value: 18 },
  { name: 'Vehicles', value: 12 },
  { name: 'Other', value: 7 },
];

const COLORS = ['hsl(262, 83%, 58%)', 'hsl(168, 84%, 44%)', 'hsl(45, 93%, 58%)', 'hsl(142, 76%, 36%)', 'hsl(38, 92%, 50%)'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card border border-border rounded-lg p-3 shadow-lg animate-fade-in">
        <p className="text-sm font-medium text-foreground">{label}</p>
        <p className="text-lg font-bold text-primary">{payload[0].value}</p>
      </div>
    );
  }
  return null;
};

export const ViewsLineChart: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 animate-fade-in-up">
      <h3 className="text-lg font-semibold mb-6 text-foreground">Views Over Time</h3>
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={viewsData}>
          <defs>
            <linearGradient id="viewsGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(262, 83%, 58%)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 18%)" />
          <XAxis dataKey="name" stroke="hsl(215, 20%, 55%)" fontSize={12} />
          <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Area 
            type="monotone" 
            dataKey="views" 
            stroke="hsl(262, 83%, 58%)" 
            strokeWidth={3}
            fill="url(#viewsGradient)"
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

export const ClicksBarChart: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 animate-fade-in-up stagger-1">
      <h3 className="text-lg font-semibold mb-6 text-foreground">Clicks Per Product</h3>
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={clicksData}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 18%, 18%)" />
          <XAxis dataKey="name" stroke="hsl(215, 20%, 55%)" fontSize={12} />
          <YAxis stroke="hsl(215, 20%, 55%)" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="clicks" 
            fill="hsl(168, 84%, 44%)" 
            radius={[8, 8, 0, 0]}
            animationDuration={1500}
            animationEasing="ease-out"
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export const CategoryDonutChart: React.FC = () => {
  return (
    <div className="p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border/50 animate-fade-in-up stagger-2">
      <h3 className="text-lg font-semibold mb-6 text-foreground">Product Categories</h3>
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Pie
            data={categoryData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={4}
            dataKey="value"
            animationDuration={1500}
            animationEasing="ease-out"
          >
            {categoryData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            content={({ active, payload }) => {
              if (active && payload && payload.length) {
                return (
                  <div className="bg-card border border-border rounded-lg p-3 shadow-lg animate-fade-in">
                    <p className="text-sm font-medium text-foreground">{payload[0].name}</p>
                    <p className="text-lg font-bold text-primary">{payload[0].value}%</p>
                  </div>
                );
              }
              return null;
            }}
          />
        </PieChart>
      </ResponsiveContainer>
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-4">
        {categoryData.map((entry, index) => (
          <div key={entry.name} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: COLORS[index % COLORS.length] }} 
            />
            <span className="text-sm text-muted-foreground">{entry.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
