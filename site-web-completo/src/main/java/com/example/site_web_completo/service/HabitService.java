package com.example.site_web_completo.service;

import com.example.site_web_completo.model.Habit;
import com.example.site_web_completo.repository.HabitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import com.example.site_web_completo.model.dto.HabitUpdateRequest;
import com.example.site_web_completo.repository.HabitLogRepository;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class HabitService {

    @Autowired
    private HabitRepository habitRepository;

    @Autowired
    private HabitLogRepository habitLogRepository;

    public List<Habit> listByUser(Long userId) {
        return habitRepository.findByUserId(userId);
    }

    public Optional<Habit> findById(Long id) {
        return habitRepository.findById(id);
    }

    public Habit save(Habit habit) {
        return habitRepository.save(habit);
    }

    public List<Habit> listPublicByUser(Long userId) {
        return habitRepository.findByUserIdAndIsPublicTrue(userId);
    }

    private Habit getOwnedHabit(Long habitId, String ownerEmail) {
        Habit habit = habitRepository.findById(habitId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Habit not found"));

        if (!habit.getUser().getEmail().equals(ownerEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your habit");
        }
        return habit;
    }

    public Habit update(Long habitId, String ownerEmail, HabitUpdateRequest request) {
        Habit habit = getOwnedHabit(habitId, ownerEmail);
        habit.setName(request.name());
        habit.setDescription(request.description());
        habit.setFrequencyType(request.frequencyType());
        habit.setIsPublic(request.isPublic());
        return habitRepository.save(habit);
    }

    @Transactional
    public void deleteOwned(Long habitId, String ownerEmail) {
        Habit habit = getOwnedHabit(habitId, ownerEmail);
        habitLogRepository.deleteByHabitId(habitId);
        habitRepository.delete(habit);
    }
}
