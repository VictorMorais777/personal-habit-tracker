package com.example.site_web_completo.model.dto;

import com.example.site_web_completo.model.FrequencyType;

import java.util.Set;

public record HabitCreateRequest(
        String name,
        String description,
        FrequencyType frequencyType,
        Boolean isPublic,
        Integer timesPerWeek,
        Set<Integer> weekDays
) {}