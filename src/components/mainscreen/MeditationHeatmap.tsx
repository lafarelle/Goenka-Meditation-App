import { useHistoryStore } from '@/store/historyStore';
import { Ionicons } from '@expo/vector-icons';
import React, { useMemo, useState } from 'react';
import { Text, View, Pressable } from 'react-native';

interface MeditationHeatmapProps {
  months?: number; // Default to 3 months
}

interface DayData {
  date: Date;
  minutes: number;
  sessionCount: number;
}

export function MeditationHeatmap({ months = 3 }: MeditationHeatmapProps) {
  const { history } = useHistoryStore();
  const [monthOffset, setMonthOffset] = useState(0); // 0 = current month, -1 = last month, etc.

  const heatmapData = useMemo(() => {
    // Calculate date range based on monthOffset
    const referenceDate = new Date();
    referenceDate.setMonth(referenceDate.getMonth() + monthOffset);

    const today = new Date(referenceDate);
    today.setHours(23, 59, 59, 999);

    const startDate = new Date(referenceDate);
    startDate.setMonth(startDate.getMonth() - months);
    startDate.setHours(0, 0, 0, 0);

    // Find the most recent Sunday (start of week) before or on startDate
    const dayOfWeek = startDate.getDay();
    const daysToSubtract = dayOfWeek; // Sunday = 0, so subtract to get to Sunday
    startDate.setDate(startDate.getDate() - daysToSubtract);

    // Initialize data structure for all days
    const dayMap = new Map<string, DayData>();
    const currentDate = new Date(startDate);
    const endDate = new Date(today);
    endDate.setHours(23, 59, 59, 999);

    // Create entries for all days in range
    while (currentDate <= endDate) {
      const dateKey = currentDate.toISOString().split('T')[0];
      dayMap.set(dateKey, {
        date: new Date(currentDate),
        minutes: 0,
        sessionCount: 0,
      });
      currentDate.setDate(currentDate.getDate() + 1);
    }

    // Aggregate meditation data by date
    history.forEach((session) => {
      const sessionDate = new Date(session.startedAt);
      const dateKey = sessionDate.toISOString().split('T')[0];

      if (dayMap.has(dateKey)) {
        const dayData = dayMap.get(dateKey)!;
        // Use actual duration if available, otherwise use planned duration
        const minutes = session.calculatedDurations.actualDurationSec
          ? session.calculatedDurations.actualDurationSec / 60
          : 0;
        dayData.minutes += minutes;
        dayData.sessionCount += 1;
      }
    });

    // Convert to array and organize by weeks
    const allDays = Array.from(dayMap.values());
    const weeks: DayData[][] = [];
    for (let i = 0; i < allDays.length; i += 7) {
      weeks.push(allDays.slice(i, i + 7));
    }

    // Calculate max minutes for color intensity
    const maxMinutes = Math.max(...allDays.map((d) => d.minutes), 1);

    return { weeks, maxMinutes, referenceDate };
  }, [history, months, monthOffset]);

  // Get color intensity based on minutes meditated
  const getColorIntensity = (minutes: number, maxMinutes: number): string => {
    if (minutes === 0) return '#E7E5E4'; // stone-200 - no meditation

    const intensity = minutes / maxMinutes;

    if (intensity >= 0.75) return '#C89635'; // Darkest gold - 75-100%
    if (intensity >= 0.5) return '#D4A73D'; // Medium-dark gold - 50-75%
    if (intensity >= 0.25) return '#E8B84B'; // Medium gold - 25-50%
    return '#F5D98E'; // Light gold - 1-25%
  };

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const { weeks, maxMinutes, referenceDate } = heatmapData;

  const monthYear = referenceDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  const canGoForward = monthOffset < 0;

  return (
    <View className="overflow-hidden rounded-2xl bg-white p-6 shadow-sm shadow-stone-300/50">
      {/* Header with Navigation */}
      <View className="mb-4 flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-2xl bg-[#E8B84B]/10">
            <Ionicons name="calendar" size={20} color="#E8B84B" />
          </View>
          <View>
            <Text className="text-xl font-semibold text-[#333333]">Activity</Text>
            <Text className="text-sm text-stone-500">{monthYear}</Text>
          </View>
        </View>

        {/* Navigation Arrows */}
        <View className="flex-row gap-2">
          <Pressable
            onPress={() => setMonthOffset(monthOffset - 1)}
            className="h-8 w-8 items-center justify-center rounded-lg bg-stone-100 active:bg-stone-200">
            <Ionicons name="chevron-back" size={18} color="#666666" />
          </Pressable>

          <Pressable
            onPress={() => setMonthOffset(monthOffset + 1)}
            disabled={!canGoForward}
            className={`h-8 w-8 items-center justify-center rounded-lg ${
              canGoForward ? 'bg-stone-100 active:bg-stone-200' : 'bg-stone-50'
            }`}>
            <Ionicons
              name="chevron-forward"
              size={18}
              color={canGoForward ? '#666666' : '#CCCCCC'}
            />
          </Pressable>
        </View>
      </View>

      {/* Heatmap Grid */}
      <View className="flex-row gap-1">
        {/* Day labels column */}
        <View className="mr-1 justify-around py-0.5">
          {weekDays.map((day, index) => (
            <View key={index} className="h-3 items-center justify-center">
              <Text className="text-[9px] font-medium text-stone-400">{day}</Text>
            </View>
          ))}
        </View>

        {/* Weeks columns */}
        <View className="flex-1 flex-row justify-between">
          {weeks.map((week, weekIndex) => (
            <View key={weekIndex} className="gap-1">
              {week.map((day, dayIndex) => {
                const color = getColorIntensity(day.minutes, maxMinutes);
                const isToday =
                  day.date.toISOString().split('T')[0] === new Date().toISOString().split('T')[0];

                return (
                  <View
                    key={dayIndex}
                    className="h-3 w-3 rounded-sm"
                    style={{
                      backgroundColor: color,
                      borderWidth: isToday ? 1.5 : 0,
                      borderColor: isToday ? '#C89635' : 'transparent',
                    }}
                  />
                );
              })}
            </View>
          ))}
        </View>
      </View>

      {/* Legend */}
      <View className="mt-4 flex-row items-center justify-end gap-2">
        <Text className="text-xs text-stone-400">Less</Text>
        <View className="flex-row gap-1">
          <View className="h-3 w-3 rounded-sm bg-[#E7E5E4]" />
          <View className="h-3 w-3 rounded-sm bg-[#F5D98E]" />
          <View className="h-3 w-3 rounded-sm bg-[#E8B84B]" />
          <View className="h-3 w-3 rounded-sm bg-[#D4A73D]" />
          <View className="h-3 w-3 rounded-sm bg-[#C89635]" />
        </View>
        <Text className="text-xs text-stone-400">More</Text>
      </View>
    </View>
  );
}
