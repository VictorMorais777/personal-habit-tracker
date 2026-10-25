package com.example.site_web_completo.model.dto;

import com.example.site_web_completo.model.FrequencyType;
import com.example.site_web_completo.model.Habit;

import java.util.Set;
import java.util.TreeSet;

public record HabitResponse(
        Long id,
        String name,
        String description,
        FrequencyType frequencyType,
        Boolean isPublic,
        Integer timesPerWeek,
        Set<Integer> weekDays
) {
    public static HabitResponse from(Habit habit) {
        Set<Integer> days = habit.getWeekDays() == null
                ? new TreeSet<>()
                : new TreeSet<>(habit.getWeekDays());

        return new HabitResponse(
                habit.getId(),
                habit.getName(),
                habit.getDescription(),
                habit.getFrequencyType(),
                habit.getIsPublic(),
                habit.getTimesPerWeek(),
                days
        );
    }
}