/**
 * Chart Components for Analytics Dashboard
 * Reusable chart components using Recharts
 */

import React from 'react';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';

// Color palette
const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658', '#FF6B9D'];

interface ChartDataPoint {
  [key: string]: any;
}

interface ChartProps {
  data: ChartDataPoint[];
  height?: number;
}

/**
 * Line Chart Component
 */
export const CustomLineChart: React.FC<ChartProps & { xKey: string; yKeys: string[] }> = ({
  data,
  xKey,
  yKeys,
  height = 300
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {yKeys.map((key, index) => (
          <Line
            key={key}
            type="monotone"
            dataKey={key}
            stroke={COLORS[index % COLORS.length]}
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  );
};

/**
 * Bar Chart Component
 */
export const CustomBarChart: React.FC<ChartProps & { xKey: string; yKeys: string[] }> = ({
  data,
  xKey,
  yKeys,
  height = 300
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {yKeys.map((key, index) => (
          <Bar
            key={key}
            dataKey={key}
            fill={COLORS[index % COLORS.length]}
          />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
};

/**
 * Area Chart Component
 */
export const CustomAreaChart: React.FC<ChartProps & { xKey: string; yKeys: string[] }> = ({
  data,
  xKey,
  yKeys,
  height = 300
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey={xKey} />
        <YAxis />
        <Tooltip />
        <Legend />
        {yKeys.map((key, index) => (
          <Area
            key={key}
            type="monotone"
            dataKey={key}
            stroke={COLORS[index % COLORS.length]}
            fill={COLORS[index % COLORS.length]}
            fillOpacity={0.6}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
};

/**
 * Pie Chart Component
 */
export const CustomPieChart: React.FC<ChartProps & { nameKey: string; dataKey: string }> = ({
  data,
  nameKey,
  dataKey,
  height = 300
}) => {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <PieChart>
        <Pie
          data={data}
          dataKey={dataKey}
          nameKey={nameKey}
          cx="50%"
          cy="50%"
          outerRadius={100}
          label
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip />
        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
};

/**
 * Metric Card Component
 */
interface MetricCardProps {
  title: string;
  value: string | number;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  icon?: React.ReactNode;
}

export const MetricCard: React.FC<MetricCardProps> = ({ title, value, trend, icon }) => {
  return (
    <div className="metric-card">
      <div className="metric-header">
        {icon && <div className="metric-icon">{icon}</div>}
        <h3 className="metric-title">{title}</h3>
      </div>
      <div className="metric-value">{value}</div>
      {trend && (
        <div className={`metric-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
          <span className="trend-arrow">{trend.isPositive ? '↑' : '↓'}</span>
          <span className="trend-value">{Math.abs(trend.value)}%</span>
        </div>
      )}
    </div>
  );
};
