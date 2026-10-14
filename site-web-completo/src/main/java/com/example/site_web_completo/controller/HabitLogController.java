package com.example.site_web_completo.controller;

import com.example.site_web_completo.model.dto.HabitLogResponse;
import com.example.site_web_completo.service.HabitLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/habits/{habitId}/logs")
public class HabitLogController {

    @Autowired
    private HabitLogService habitLogService;

    @GetMapping
    public List<HabitLogResponse> listByHabit(@PathVariable Long habitId, Authentication authentication) {
        return habitLogService.listByHabit(habitId, authentication.getName()).stream()
                .map(HabitLogResponse::from)
                .toList();
    }

    @PostMapping
    public HabitLogResponse checkIn(
            @PathVariable Long habitId,
            @RequestBody CheckInRequest request,
            Authentication authentication
    ) {
        return HabitLogResponse.from(
                habitLogService.checkIn(habitId, authentication.getName(), request.date(), request.completed())
        );
    }

    public record CheckInRequest(LocalDate date, boolean completed) {}
}