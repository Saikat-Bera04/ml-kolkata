import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { getActivityHeatmapData, getActivityStreak, getTotalActivityCount } from '@/services/activityTracker';
import { Calendar, Flame } from 'lucide-react';

interface HeatmapCell {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

export function ActivityHeatmap() {
  const [heatmapData, setHeatmapData] = useState<HeatmapCell[]>([]);
  const [streak, setStreak] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [hoveredCell, setHoveredCell] = useState<string | null>(null);

  useEffect(() => {
    loadHeatmapData();
    
    // Listen for activity updates
    const handleActivityUpdate = () => {
      loadHeatmapData();
    };
    
    window.addEventListener('activity-updated', handleActivityUpdate);
    
    return () => {
      window.removeEventListener('activity-updated', handleActivityUpdate);
    };
  }, []);

  const loadHeatmapData = () => {
    const data = getActivityHeatmapData();
    const currentStreak = getActivityStreak();
    const total = getTotalActivityCount();
    
    setHeatmapData(data);
    setStreak(currentStreak);
    setTotalCount(total);
  };

  // Group data by weeks (53 weeks for last year) - GitHub style
  const weeksData = useMemo(() => {
    const weeks: HeatmapCell[][] = [];
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    // Calculate start date (53 weeks ago)
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (53 * 7));
    startDate.setHours(0, 0, 0, 0);
    
    // Align to Sunday (start of week) - GitHub style
    const startDayOfWeek = startDate.getDay();
    const alignedStartDate = new Date(startDate);
    alignedStartDate.setDate(startDate.getDate() - startDayOfWeek);
    alignedStartDate.setHours(0, 0, 0, 0);
    
    // Create a map for quick lookup
    const dataMap = new Map<string, HeatmapCell>();
    heatmapData.forEach(d => {
      dataMap.set(d.date, d);
    });
    
    // Create 53 weeks (columns)
    for (let week = 0; week < 53; week++) {
      const weekData: HeatmapCell[] = [];
      
      // For each day of the week (Sunday = 0 to Saturday = 6) - rows
      for (let day = 0; day < 7; day++) {
        const currentDate = new Date(alignedStartDate);
        currentDate.setDate(alignedStartDate.getDate() + (week * 7) + day);
        currentDate.setHours(0, 0, 0, 0);
        
        // Only include dates up to today
        if (currentDate <= today && currentDate >= alignedStartDate) {
          const dateStr = currentDate.toISOString().split('T')[0];
          const cellData = dataMap.get(dateStr) || { date: dateStr, count: 0, level: 0 };
          weekData.push(cellData);
        } else {
          // Empty cell for future dates or before start
          weekData.push({ date: '', count: 0, level: 0 });
        }
      }
      
      // Only add week if it has at least one valid date
      if (weekData.some(cell => cell.date)) {
        weeks.push(weekData);
      }
    }
    
    return weeks;
  }, [heatmapData]);

  const getColorForLevel = (level: 0 | 1 | 2 | 3 | 4): string => {
    switch (level) {
      case 0:
        return 'bg-gray-100 dark:bg-gray-800';
      case 1:
        return 'bg-green-200 dark:bg-green-900';
      case 2:
        return 'bg-green-400 dark:bg-green-700';
      case 3:
        return 'bg-green-600 dark:bg-green-600';
      case 4:
        return 'bg-green-800 dark:bg-green-500';
      default:
        return 'bg-gray-100 dark:bg-gray-800';
    }
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric',
      year: 'numeric'
    });
  };

  const getActivityDescription = (count: number): string => {
    if (count === 0) return 'No activity';
    if (count === 1) return '1 activity';
    return `${count} activities`;
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Activity Heatmap
            </CardTitle>
            <CardDescription>
              Your learning activity over the past year
            </CardDescription>
          </div>
          <div className="flex items-center gap-4">
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{streak}</div>
              <div className="text-xs text-muted-foreground flex items-center gap-1">
                <Flame className="h-3 w-3" />
                Day streak
              </div>
            </div>
            <div className="text-right">
              <div className="text-2xl font-bold text-primary">{totalCount}</div>
              <div className="text-xs text-muted-foreground">Total activities</div>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Heatmap Grid - GitHub Style */}
          {weeksData.length > 0 ? (
            <div className="flex gap-1 overflow-x-auto pb-2">
              <TooltipProvider>
                {weeksData.map((week, weekIndex) => (
                  <div key={weekIndex} className="flex flex-col gap-1">
                    {week.map((cell, dayIndex) => {
                      if (!cell.date) {
                        return (
                          <div
                            key={`${weekIndex}-${dayIndex}`}
                            className="w-3 h-3 rounded-sm bg-transparent"
                          />
                        );
                      }
                      
                      const isHovered = hoveredCell === cell.date;
                      
                      return (
                        <Tooltip key={`${weekIndex}-${dayIndex}`}>
                          <TooltipTrigger asChild>
                            <div
                              className={`w-3 h-3 rounded-sm cursor-pointer transition-all ${getColorForLevel(cell.level)} ${
                                isHovered ? 'ring-2 ring-primary ring-offset-1 scale-110' : 'hover:ring-1 hover:ring-primary/50'
                              }`}
                              onMouseEnter={() => setHoveredCell(cell.date)}
                              onMouseLeave={() => setHoveredCell(null)}
                            />
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="text-sm">
                              <div className="font-semibold">{getActivityDescription(cell.count)}</div>
                              <div className="text-muted-foreground">{formatDate(cell.date)}</div>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      );
                    })}
                  </div>
                ))}
              </TooltipProvider>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No activity data yet. Start learning to see your activity heatmap!</p>
            </div>
          )}

          {/* Legend */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Less</span>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 rounded-sm bg-gray-100 dark:bg-gray-800" />
              <div className="w-3 h-3 rounded-sm bg-green-200 dark:bg-green-900" />
              <div className="w-3 h-3 rounded-sm bg-green-400 dark:bg-green-700" />
              <div className="w-3 h-3 rounded-sm bg-green-600 dark:bg-green-600" />
              <div className="w-3 h-3 rounded-sm bg-green-800 dark:bg-green-500" />
            </div>
            <span>More</span>
          </div>

          {/* Activity Summary */}
          <div className="pt-2 border-t">
            <div className="text-sm text-muted-foreground">
              {heatmapData.filter(d => d.count > 0).length} days with activity in the last year
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

