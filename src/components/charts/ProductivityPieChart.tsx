import { memo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface ProductivityPieChartProps {
    activeTime: number; // seconds
    idleTime: number; // seconds
    height?: number;
}

const COLORS = {
    active: '#52c41a',
    idle: '#faad14',
};

export const ProductivityPieChart = memo(({ activeTime, idleTime, height = 300 }: ProductivityPieChartProps) => {
    const data = [
        { name: 'Active Time', value: activeTime },
        { name: 'Idle Time', value: idleTime },
    ];

    const formatTooltip = (value: number) => {
        const hours = (value / 3600).toFixed(1);
        return `${hours} hrs`;
    };

    return (
        <ResponsiveContainer width="100%" height={height}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={(entry) => {
                        const percent = ((entry.value / (activeTime + idleTime)) * 100).toFixed(1);
                        return `${entry.name}: ${percent}%`;
                    }}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                >
                    {data.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={index === 0 ? COLORS.active : COLORS.idle} />
                    ))}
                </Pie>
                <Tooltip formatter={formatTooltip} />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
});

ProductivityPieChart.displayName = 'ProductivityPieChart';
