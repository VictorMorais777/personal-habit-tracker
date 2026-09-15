package com.example.site_web_completo.service;

import com.example.site_web_completo.model.Habit;
import com.example.site_web_completo.model.HabitLog;
import com.example.site_web_completo.repository.HabitLogRepository;
import com.example.site_web_completo.repository.HabitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@Service
public class HabitLogService {

    @Autowired
    private HabitLogRepository habitLogRepository;

    @Autowired
    private HabitRepository habitRepository;

    public List<HabitLog> listByHabit(Long habitId) {
        return habitLogRepository.findByHabitId(habitId);
    }

    public HabitLog checkIn(Long habitId, LocalDate date, boolean completed) {
        Optional<HabitLog> existing = habitLogRepository.findByHabitIdAndDate(habitId, date);

        if (existing.isPresent()) {
            HabitLog log = existing.get();
            log.setCompleted(completed);
            return habitLogRepository.save(log);
        }

        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new RuntimeException("Habit not found with id: " + habitId));

        HabitLog newLog = new HabitLog();
        newLog.setDate(date);
        newLog.setCompleted(completed);
        newLog.setHabit(habit);

        return habitLogRepository.save(newLog);
    }
}