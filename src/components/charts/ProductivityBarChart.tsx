import { memo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { UserComparisonData } from '@/types';

interface ProductivityBarChartProps {
    data: UserComparisonData[];
    height?: number;
}

export const ProductivityBarChart = memo(({ data, height = 300 }: ProductivityBarChartProps) => {
    return (
        <ResponsiveContainer width="100%" height={height}>
            <BarChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="userName" />
                <YAxis />
                <Tooltip
                    formatter={(value: number) => {
                        const hours = (value / 3600).toFixed(1);
                        return `${hours} hrs`;
                    }}
                />
                <Legend />
                <Bar dataKey="total_active_seconds" fill="#52c41a" name="Active Time" stackId="a" />
                <Bar dataKey="total_idle_seconds" fill="#faad14" name="Idle Time" stackId="a" />
            </BarChart>
        </ResponsiveContainer>
    );
});

ProductivityBarChart.displayName = 'ProductivityBarChart';
