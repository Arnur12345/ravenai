import React from 'react';
import { TrendingUp } from "lucide-react";
import { Area, AreaChart, CartesianGrid, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useLanguage } from '@/shared/contexts/LanguageContext';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/ui/card";

interface MeetingChartProps {
  data: Array<{
    date: string;
    meetings: number;
    summaries: number;
  }>;
  isLoading?: boolean;
}

export const MeetingChart: React.FC<MeetingChartProps> = ({ data, isLoading = false }) => {
  const { t } = useLanguage();
  // Format data for display
  const chartData = data.map((item) => {
    const date = new Date(item.date);
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    
    return {
      day: dayNames[date.getDay()],
      fullDate: `${monthNames[date.getMonth()]} ${date.getDate()}`,
      // Combine meetings and summaries for a single metric
      totalActivity: item.meetings + item.summaries,
      meetings: item.meetings,
      summaries: item.summaries,
    };
  });

  // Calculate trend
  const totalActivity = chartData.reduce((sum, item) => sum + item.totalActivity, 0);
  const avgActivity = totalActivity / chartData.length;
  const recentAvg = chartData.slice(-3).reduce((sum, item) => sum + item.totalActivity, 0) / 3;
  const trendPercentage = avgActivity > 0 ? ((recentAvg - avgActivity) / avgActivity * 100) : 0;

  if (isLoading) {
    return (
      <Card 
        className="rounded-xl sm:rounded-2xl border border-gray-200 backdrop-blur-sm"
        style={{
          backgroundColor: 'var(--dashboard-black)',
          fontFamily: 'Gilroy, Inter, sans-serif'
        }}
      >
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl" style={{ color: 'var(--dashboard-very-light-blue)' }}>
            {t('chart.meeting_activity')}
          </CardTitle>
          <CardDescription className="text-sm" style={{ color: 'var(--dashboard-light-blue)' }}>
            {t('dashboard.loading')}
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <div className="h-[150px] sm:h-[200px] flex items-center justify-center">
            <div 
              className="animate-spin rounded-full h-6 w-6 sm:h-8 sm:w-8 border-b-2"
              style={{ borderColor: 'var(--dashboard-bright-blue)' }}
            ></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card 
      className="rounded-xl sm:rounded-2xl border border-gray-200 backdrop-blur-sm"
      style={{
        backgroundColor: 'var(--dashboard-black)',
        fontFamily: 'Gilroy, Inter, sans-serif'
      }}
    >
      <CardHeader className="p-4 sm:p-6">
        <CardTitle className="text-lg sm:text-xl" style={{ color: 'var(--dashboard-very-light-blue)' }}>
          {t('chart.meeting_activity')}
        </CardTitle>
        <CardDescription className="text-sm" style={{ color: 'var(--dashboard-light-blue)' }}>
          Total activity for the last {data.length} days
        </CardDescription>
      </CardHeader>
      <CardContent className="p-4 sm:p-6">
        <div className="h-[200px] sm:h-[300px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={chartData}
              margin={{
                top: 10,
                right: 10,
                left: 0,
                bottom: 0,
              }}
            >
              <defs>
                <linearGradient id="activityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="var(--dashboard-bright-blue)" stopOpacity={0.8}/>
                  <stop offset="50%" stopColor="var(--dashboard-bright-blue)" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="var(--dashboard-bright-blue)" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid 
                strokeDasharray="3 3" 
                stroke="var(--dashboard-light-blue)" 
                strokeOpacity={0.1} 
              />
              <XAxis
                dataKey="day"
                tickLine={false}
                axisLine={false}
                tick={{ 
                  fill: 'var(--dashboard-light-blue)', 
                  fontSize: 10,
                  fontFamily: 'Gilroy, Inter, sans-serif'
                }}
                className="text-xs sm:text-sm"
              />
              <Tooltip 
                contentStyle={{
                  backgroundColor: 'var(--dashboard-black)',
                  border: `1px solid #e5e7eb`,
                  borderRadius: '12px',
                  color: 'var(--dashboard-very-light-blue)',
                  fontFamily: 'Gilroy, Inter, sans-serif',
                  boxShadow: `0 10px 40px var(--dashboard-bright-blue)20`
                }}
                labelStyle={{
                  color: 'var(--dashboard-bright-blue)',
                  fontWeight: 'bold'
                }}
              />
              <Area
                type="monotone"
                dataKey="totalActivity"
                stroke="var(--dashboard-bright-blue)"
                strokeWidth={3}
                fill="url(#activityGradient)"
                dot={false}
                activeDot={{
                  r: 6,
                  fill: 'var(--dashboard-bright-blue)',
                  stroke: 'var(--dashboard-black)',
                  strokeWidth: 2
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
      <CardFooter className="p-4 sm:p-6">
        <div className="flex w-full items-start gap-2 text-xs sm:text-sm">
          <div className="grid gap-1 sm:gap-2">
            <div 
              className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 leading-none font-medium"
              style={{ color: 'var(--dashboard-very-light-blue)' }}
            >
              <span className="text-xs sm:text-sm">
                {trendPercentage >= 0 ? 'Trending up' : 'Trending down'} by {Math.abs(trendPercentage).toFixed(1)}% this period
              </span>
              <TrendingUp 
                className={`h-3 w-3 sm:h-4 sm:w-4 ${trendPercentage < 0 ? 'rotate-180' : ''}`}
                style={{ 
                  color: trendPercentage >= 0 ? 'var(--dashboard-bright-blue)' : 'var(--dashboard-light-blue)' 
                }}
              />
            </div>
            <div 
              className="flex items-center gap-2 leading-none text-xs"
              style={{ color: 'var(--dashboard-light-blue)' }}
            >
              {chartData[0]?.fullDate} - {chartData[chartData.length - 1]?.fullDate}
            </div>
          </div>
        </div>
      </CardFooter>
    </Card>
  );
};