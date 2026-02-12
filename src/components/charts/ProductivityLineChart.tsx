import { memo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { ProductivityChartData } from '@/types';

interface ProductivityLineChartProps {
    data: ProductivityChartData[];
    height?: number;
}

export const ProductivityLineChart = memo(({ data, height = 300 }: ProductivityLineChartProps) => {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="date" />
                <YAxis yAxisId="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip />
                <Legend />
                <Line
                    yAxisId="left"
                    type="monotone"
                    dataKey="productivity"
                    stroke="#4f46e5"
                    name="Productivity %"
                    strokeWidth={2}
                />
                <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="activeTime"
                    stroke="#52c41a"
                    name="Active Time (hrs)"
                    strokeWidth={2}
                    strokeDasharray="5 5"
                />
            </LineChart>
        </ResponsiveContainer>
    );
});

ProductivityLineChart.displayName = 'ProductivityLineChart';
