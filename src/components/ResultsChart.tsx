'use client';

import type { ElectionResults } from '@/lib/types';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from 'next-themes'; // Assuming you might add theme switching later

interface ResultsChartProps {
  data: ElectionResults | null;
}

export function ResultsChart({ data }: ResultsChartProps) {
  const { theme } = useTheme(); // For potential theme-aware chart colors

  if (!data || data.results.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-headline">Election Results</CardTitle>
          <CardDescription>Results for: {data?.electionName || 'N/A'}</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">No results available or no votes cast yet.</p>
        </CardContent>
      </Card>>
    );
  }

  const chartData = data.results.map(r => ({
    name: r.candidateName,
    votes: r.voteCount,
  }));

  // Get HSL values from CSS variables for chart colors
  const getCssVarValue = (varName: string) => {
    if (typeof window === 'undefined') return '#8884d8'; // Default for SSR
    return getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
  };
  
  const primaryColor = `hsl(${getCssVarValue('--primary')})`;
  // const accentColor = `hsl(${getCssVarValue('--accent')})`;

  return (
    <Card className="shadow-lg rounded-lg">
      <CardHeader>
        <CardTitle className="text-2xl font-headline text-primary">
          Election Results: {data.electionName}
        </CardTitle>
        <CardDescription>
          Visual representation of votes cast for each candidate.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%', height: 400 }}>
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 50 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis 
                dataKey="name" 
                angle={-35} 
                textAnchor="end" 
                height={70} 
                interval={0}
                stroke="hsl(var(--foreground))"
                tick={{ fontSize: 12 }}
              />
              <YAxis allowDecimals={false} stroke="hsl(var(--foreground))" />
              <Tooltip
                contentStyle={{ 
                    backgroundColor: 'hsl(var(--popover))', 
                    borderColor: 'hsl(var(--border))',
                    color: 'hsl(var(--popover-foreground))',
                    borderRadius: 'var(--radius)'
                }}
                cursor={{ fill: 'hsl(var(--accent)/0.3)' }}
              />
              <Legend wrapperStyle={{ color: 'hsl(var(--foreground))' }} />
              <Bar dataKey="votes" fill={primaryColor} radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
