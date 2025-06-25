"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ChartContainer, ChartTooltipContent } from '@/components/ui/chart';
import type { ChartConfig } from '@/components/ui/chart';

interface ProgressChartProps {
  completed: number;
  missed: number;
}

const chartConfig = {
  completed: {
    label: "Completed",
    color: "hsl(var(--chart-1))",
  },
  missed: {
    label: "Missed",
    color: "hsl(var(--chart-2))",
  },
} satisfies ChartConfig;

export function ProgressChart({ completed, missed }: ProgressChartProps) {
    const chartData = [
        { name: 'completed', value: completed, fill: 'var(--color-completed)' },
        { name: 'missed', value: missed, fill: 'var(--color-missed)' },
    ];
    
    const total = completed + missed;

    if (total === 0) {
        return null;
    }
    
    return (
        <Card className="w-full max-w-sm mx-auto">
            <CardHeader className="p-4 pb-0">
                <CardTitle className="text-lg text-center">Daily Progress</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
                <ChartContainer config={chartConfig} className="h-[250px] w-full">
                    <ResponsiveContainer>
                        <PieChart>
                            <Tooltip
                                cursor={false}
                                content={<ChartTooltipContent hideLabel />}
                            />
                            <Pie
                                data={chartData}
                                dataKey="value"
                                nameKey="name"
                                innerRadius={60}
                                strokeWidth={5}
                                paddingAngle={5}
                            >
                                {chartData.map((entry) => (
                                    <Cell key={`cell-${entry.name}`} fill={entry.fill} />
                                ))}
                            </Pie>
                            <Legend
                                content={({ payload }) => {
                                    return (
                                        <ul className="flex flex-wrap gap-x-4 justify-center mt-2">
                                        {payload?.map((entry, index) => {
                                            const config = chartConfig[entry.value as keyof typeof chartConfig];
                                            return (
                                            <li key={`item-${index}`} className="flex items-center gap-1.5">
                                                <span className="h-2 w-2 rounded-full" style={{backgroundColor: config.color}} />
                                                <span className="text-sm text-muted-foreground">{config.label} ({entry.payload.value})</span>
                                            </li>
                                            )
                                        })}
                                        </ul>
                                    )
                                }}
                            />
                        </PieChart>
                    </ResponsiveContainer>
                </ChartContainer>
            </CardContent>
        </Card>
    );
}
