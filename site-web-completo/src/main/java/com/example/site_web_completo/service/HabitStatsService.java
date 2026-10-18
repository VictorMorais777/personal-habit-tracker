package com.example.site_web_completo.service;

import com.example.site_web_completo.model.Habit;
import com.example.site_web_completo.model.HabitLog;
import com.example.site_web_completo.model.User;
import com.example.site_web_completo.model.dto.HabitStatsResponse;
import com.example.site_web_completo.repository.HabitLogRepository;
import com.example.site_web_completo.repository.HabitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;
import java.util.NavigableSet;
import java.util.TreeSet;
import java.util.stream.Collectors;

@Service
public class HabitStatsService {

    private static final int WINDOW_DAYS = 56;

    @Autowired
    private HabitRepository habitRepository;

    @Autowired
    private HabitLogRepository habitLogRepository;

    @Autowired
    private HabitAccessService access;

    public List<HabitStatsResponse> statsFor(String email, LocalDate today) {
        User user = access.requester(email);
        List<Habit> habits = habitRepository.findByUserId(user.getId());

        Map<Long, TreeSet<LocalDate>> datesByHabit = habitLogRepository
                .findByHabitUserIdAndCompletedTrue(user.getId()).stream()
                .collect(Collectors.groupingBy(
                        log -> log.getHabit().getId(),
                        Collectors.mapping(HabitLog::getDate, Collectors.toCollection(TreeSet::new))
                ));

        return habits.stream()
                .map(habit -> build(habit, datesByHabit.getOrDefault(habit.getId(), new TreeSet<>()), today))
                .toList();
    }

    private HabitStatsResponse build(Habit habit, TreeSet<LocalDate> allDates, LocalDate today) {
        NavigableSet<LocalDate> dates = allDates.headSet(today, true);
        LocalDate windowStart = today.minusDays(WINDOW_DAYS - 1);
        List<LocalDate> recent = dates.tailSet(windowStart, true).stream().toList();

        return new HabitStatsResponse(
                habit.getId(),
                habit.getName(),
                currentStreak(dates, today),
                longestStreak(dates),
                dates.size(),
                recent
        );
    }

    private int currentStreak(NavigableSet<LocalDate> dates, LocalDate today) {
        LocalDate cursor = dates.contains(today) ? today : today.minusDays(1);
        int streak = 0;
        while (dates.contains(cursor)) {
            streak++;
            cursor = cursor.minusDays(1);
        }
        return streak;
    }

    private int longestStreak(NavigableSet<LocalDate> dates) {
        int longest = 0;
        int run = 0;
        LocalDate previous = null;

        for (LocalDate date : dates) {
            run = (previous != null && previous.plusDays(1).equals(date)) ? run + 1 : 1;
            longest = Math.max(longest, run);
            previous = date;
        }
        return longest;
    }
}