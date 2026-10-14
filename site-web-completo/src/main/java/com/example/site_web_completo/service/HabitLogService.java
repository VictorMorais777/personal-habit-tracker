package com.example.site_web_completo.service;

import com.example.site_web_completo.model.Habit;
import com.example.site_web_completo.model.HabitLog;
import com.example.site_web_completo.repository.HabitLogRepository;
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
    private HabitAccessService access;

    public List<HabitLog> listByHabit(Long habitId, String requesterEmail) {
        access.requireVisible(habitId, requesterEmail);
        return habitLogRepository.findByHabitId(habitId);
    }

    public HabitLog checkIn(Long habitId, String ownerEmail, LocalDate date, boolean completed) {
        Habit habit = access.requireOwned(habitId, ownerEmail);

        Optional<HabitLog> existing = habitLogRepository.findByHabitIdAndDate(habitId, date);
        if (existing.isPresent()) {
            HabitLog log = existing.get();
            log.setCompleted(completed);
            return habitLogRepository.save(log);
        }

        HabitLog newLog = new HabitLog();
        newLog.setDate(date);
        newLog.setCompleted(completed);
        newLog.setHabit(habit);
        return habitLogRepository.save(newLog);
    }
}