package com.example.site_web_completo.model.dto;

import com.example.site_web_completo.model.HabitLog;

import java.time.LocalDate;

public record HabitLogResponse(
        Long id,
        LocalDate date,
        boolean completed
) {
    public static HabitLogResponse from(HabitLog log) {
        return new HabitLogResponse(log.getId(), log.getDate(), log.isCompleted());
    }
}