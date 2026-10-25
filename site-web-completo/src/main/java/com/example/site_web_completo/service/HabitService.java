package com.example.site_web_completo.service;

import com.example.site_web_completo.model.FrequencyType;
import com.example.site_web_completo.model.Habit;
import com.example.site_web_completo.model.User;
import com.example.site_web_completo.model.dto.HabitCreateRequest;
import com.example.site_web_completo.model.dto.HabitUpdateRequest;
import com.example.site_web_completo.repository.HabitLogRepository;
import com.example.site_web_completo.repository.HabitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Set;

@Service
public class HabitService {

    @Autowired
    private HabitRepository habitRepository;

    @Autowired
    private HabitLogRepository habitLogRepository;

    @Autowired
    private HabitAccessService access;

    public List<Habit> listVisibleByUser(Long targetUserId, String requesterEmail) {
        User requester = access.requester(requesterEmail);

        if (requester.getId().equals(targetUserId)) {
            return habitRepository.findByUserId(targetUserId);
        }
        if (access.areFriends(requester.getId(), targetUserId)) {
            return habitRepository.findByUserIdAndIsPublicTrue(targetUserId);
        }
        throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Only friends can see these habits");
    }

    public Habit create(String ownerEmail, HabitCreateRequest request) {
        requireName(request.name());

        Habit habit = new Habit();
        habit.setName(request.name().trim());
        habit.setDescription(request.description());
        habit.setIsPublic(Boolean.TRUE.equals(request.isPublic()));
        applyGoal(habit, request.frequencyType(), request.timesPerWeek(), request.weekDays());
        habit.setUser(access.requester(ownerEmail));
        return habitRepository.save(habit);
    }

    public Habit update(Long habitId, String ownerEmail, HabitUpdateRequest request) {
        requireName(request.name());

        Habit habit = access.requireOwned(habitId, ownerEmail);
        habit.setName(request.name().trim());
        habit.setDescription(request.description());
        habit.setIsPublic(Boolean.TRUE.equals(request.isPublic()));
        applyGoal(habit, request.frequencyType(), request.timesPerWeek(), request.weekDays());
        return habitRepository.save(habit);
    }

    @Transactional
    public void deleteOwned(Long habitId, String ownerEmail) {
        Habit habit = access.requireOwned(habitId, ownerEmail);
        habitLogRepository.deleteByHabitId(habitId);
        habitRepository.delete(habit);
    }

    private void requireName(String name) {
        if (name == null || name.isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required");
        }
    }

    private void applyGoal(Habit habit, FrequencyType type, Integer timesPerWeek, Set<Integer> weekDays) {
        if (type == null) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Frequency is required");
        }
        habit.setFrequencyType(type);

        switch (type) {
            case DAILY -> {
                habit.setTimesPerWeek(null);
                habit.getWeekDays().clear();
            }
            case WEEKLY -> {
                if (timesPerWeek == null || timesPerWeek < 1 || timesPerWeek > 7) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Times per week must be between 1 and 7");
                }
                habit.setTimesPerWeek(timesPerWeek);
                habit.getWeekDays().clear();
            }
            case CUSTOM -> {
                boolean invalid = weekDays == null
                        || weekDays.isEmpty()
                        || weekDays.stream().anyMatch(day -> day == null || day < 1 || day > 7);
                if (invalid) {
                    throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Choose at least one valid weekday");
                }
                habit.setTimesPerWeek(null);
                habit.getWeekDays().clear();
                habit.getWeekDays().addAll(weekDays);
            }
        }
    }
}