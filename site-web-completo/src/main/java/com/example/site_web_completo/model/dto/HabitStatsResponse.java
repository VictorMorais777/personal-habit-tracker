package com.example.site_web_completo.model.dto;

import com.example.site_web_completo.model.FrequencyType;

import java.time.LocalDate;
import java.util.List;
import java.util.Set;

public record HabitStatsResponse(
        Long habitId,
        String name,
        FrequencyType frequencyType,
        Integer timesPerWeek,
        Set<Integer> weekDays,
        int currentStreak,
        int longestStreak,
        int totalCompleted,
        List<LocalDate> recentDates
) {}