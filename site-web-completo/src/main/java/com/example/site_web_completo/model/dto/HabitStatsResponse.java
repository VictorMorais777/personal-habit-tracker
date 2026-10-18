package com.example.site_web_completo.model.dto;

import java.time.LocalDate;
import java.util.List;

public record HabitStatsResponse(
        Long habitId,
        String name,
        int currentStreak,
        int longestStreak,
        int totalCompleted,
        List<LocalDate> recentDates
) {}