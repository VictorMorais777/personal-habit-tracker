package com.example.site_web_completo.service;

import com.example.site_web_completo.model.FrequencyType;
import com.example.site_web_completo.model.Habit;
import com.example.site_web_completo.model.HabitLog;
import com.example.site_web_completo.model.User;
import com.example.site_web_completo.model.dto.HabitStatsResponse;
import com.example.site_web_completo.repository.HabitLogRepository;
import com.example.site_web_completo.repository.HabitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.temporal.TemporalAdjusters;
import java.util.EnumSet;
import java.util.List;
import java.util.Map;
import java.util.NavigableSet;
import java.util.Set;
import java.util.TreeSet;
import java.util.stream.Collectors;

@Service
public class HabitStatsService {

    private static final int WINDOW_DAYS = 56;

    private record Streak(int current, int longest) {}

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
        List<LocalDate> recent = dates.tailSet(today.minusDays(WINDOW_DAYS - 1), true).stream().toList();

        Streak streak = habit.getFrequencyType() == FrequencyType.WEEKLY
                ? weeklyStreak(dates, today, goalPerWeek(habit))
                : scheduledStreak(dates, today, scheduledDays(habit));

        Set<Integer> weekDays = habit.getWeekDays() == null
                ? new TreeSet<>()
                : new TreeSet<>(habit.getWeekDays());

        return new HabitStatsResponse(
                habit.getId(),
                habit.getName(),
                habit.getFrequencyType(),
                habit.getTimesPerWeek(),
                weekDays,
                streak.current(),
                streak.longest(),
                dates.size(),
                recent
        );
    }

    private Streak scheduledStreak(NavigableSet<LocalDate> dates, LocalDate today, Set<DayOfWeek> scheduled) {
        if (dates.isEmpty()) {
            return new Streak(0, 0);
        }

        int run = 0;
        int longest = 0;

        for (LocalDate day = dates.first(); !day.isAfter(today); day = day.plusDays(1)) {
            if (!scheduled.contains(day.getDayOfWeek())) {
                continue;
            }
            if (dates.contains(day)) {
                run++;
                longest = Math.max(longest, run);
            } else if (!day.equals(today)) {
                run = 0;
            }
        }
        return new Streak(run, longest);
    }

    private Streak weeklyStreak(NavigableSet<LocalDate> dates, LocalDate today, int goal) {
        if (dates.isEmpty()) {
            return new Streak(0, 0);
        }

        Map<LocalDate, Long> perWeek = dates.stream()
                .collect(Collectors.groupingBy(this::weekStart, Collectors.counting()));
        LocalDate currentWeek = weekStart(today);

        int run = 0;
        int longest = 0;

        for (LocalDate week = weekStart(dates.first()); !week.isAfter(currentWeek); week = week.plusWeeks(1)) {
            long count = perWeek.getOrDefault(week, 0L);
            if (count >= goal) {
                run++;
                longest = Math.max(longest, run);
            } else if (!week.equals(currentWeek)) {
                run = 0;
            }

        }
        return new Streak(run, longest);
    }

    private Set<DayOfWeek> scheduledDays(Habit habit) {
        boolean noCustomDays = habit.getFrequencyType() != FrequencyType.CUSTOM
                || habit.getWeekDays() == null
                || habit.getWeekDays().isEmpty();
        if (noCustomDays) {
            return EnumSet.allOf(DayOfWeek.class);
        }
        return habit.getWeekDays().stream()
                .map(DayOfWeek::of)
                .collect(Collectors.toCollection(() -> EnumSet.noneOf(DayOfWeek.class)));
    }

    private int goalPerWeek(Habit habit) {
        Integer times = habit.getTimesPerWeek();
        return (times == null || times < 1) ? 1 : times;
    }

    private LocalDate weekStart(LocalDate date) {
        return date.with(TemporalAdjusters.previousOrSame(DayOfWeek.MONDAY));
    }
}