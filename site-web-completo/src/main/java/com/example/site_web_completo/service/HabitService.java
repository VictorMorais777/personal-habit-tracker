package com.example.site_web_completo.service;

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
        if (request.name() == null || request.name().isBlank()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "Name is required");
        }

        Habit habit = new Habit();
        habit.setName(request.name().trim());
        habit.setDescription(request.description());
        habit.setFrequencyType(request.frequencyType());
        habit.setIsPublic(Boolean.TRUE.equals(request.isPublic()));
        habit.setUser(access.requester(ownerEmail));
        return habitRepository.save(habit);
    }

    public Habit update(Long habitId, String ownerEmail, HabitUpdateRequest request) {
        Habit habit = access.requireOwned(habitId, ownerEmail);
        habit.setName(request.name());
        habit.setDescription(request.description());
        habit.setFrequencyType(request.frequencyType());
        habit.setIsPublic(Boolean.TRUE.equals(request.isPublic()));
        return habitRepository.save(habit);
    }

    @Transactional
    public void deleteOwned(Long habitId, String ownerEmail) {
        Habit habit = access.requireOwned(habitId, ownerEmail);
        habitLogRepository.deleteByHabitId(habitId);
        habitRepository.delete(habit);
    }
}