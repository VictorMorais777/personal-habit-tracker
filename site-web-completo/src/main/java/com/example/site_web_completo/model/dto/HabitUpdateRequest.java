package com.example.site_web_completo.model.dto;

import com.example.site_web_completo.model.FrequencyType;

public record HabitUpdateRequest(
        String name,
        String description,
        FrequencyType frequencyType,
        Boolean isPublic
) {}