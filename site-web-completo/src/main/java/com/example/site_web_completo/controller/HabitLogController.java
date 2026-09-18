package com.example.site_web_completo.controller;

import com.example.site_web_completo.model.HabitLog;
import com.example.site_web_completo.service.HabitLogService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;

@RestController
@RequestMapping("/habits/{habitId}/logs")
public class HabitLogController {

    @Autowired
    private HabitLogService habitLogService;

    @GetMapping
    public List<HabitLog> listByHabit(@PathVariable Long habitId) {
        return habitLogService.listByHabit(habitId);
    }

    @PostMapping
    public HabitLog checkIn(@PathVariable Long habitId, @RequestBody CheckInRequest request) {
        return habitLogService.checkIn(habitId, request.date(), request.completed());
    }

    public record CheckInRequest(LocalDate date, boolean completed) {}
}