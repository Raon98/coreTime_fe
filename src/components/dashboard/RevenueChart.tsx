'use client';

import { Paper, Text, Group } from '@mantine/core';
import { AreaChart } from '@mantine/charts';
import { RevenueChartData } from '@/lib/mock-data';

interface RevenueChartProps {
    data: RevenueChartData[];
}

export function RevenueChart({ data }: RevenueChartProps) {
    return (
        <Paper withBorder p="md" radius="md">
            <Group justify="space-between" mb="lg">
                <Text size="lg" fw={700}>Weekly Revenue & Reservations</Text>
            </Group>

            <AreaChart
                h={300}
                data={data}
                dataKey="date"
                series={[
                    { name: 'revenue', color: 'teal.6', label: 'Revenue (KRW)' },
                    { name: 'appointments', color: 'blue.6', label: 'Reservations' },
                ]}
                curveType="monotone"
                withGradient
                tickLine="y"
                gridAxis="xy"
                withXAxis={true}
                withYAxis={true}
                valueFormatter={(value) => new Intl.NumberFormat('ko-KR').format(value)}
            />
        </Paper>
    );
}
