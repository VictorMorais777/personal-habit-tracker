package com.example.site_web_completo.model.dto;

import com.example.site_web_completo.model.FrequencyType;
import com.example.site_web_completo.model.Habit;

public record HabitResponse(
        Long id,
        String name,
        String description,
        FrequencyType frequencyType,
        Boolean isPublic
) {
    public static HabitResponse from(Habit habit) {
        return new HabitResponse(
                habit.getId(),
                habit.getName(),
                habit.getDescription(),
                habit.getFrequencyType(),
                habit.getIsPublic()
        );
    }
}