package com.example.site_web_completo.service;

import com.example.site_web_completo.model.Habit;
import com.example.site_web_completo.repository.HabitRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class HabitService {

    @Autowired
    private HabitRepository habitRepository;

    public List<Habit> listByUser(Long userId) {
        return habitRepository.findByUserId(userId);
    }

    public Optional<Habit> findById(Long id) {
        return habitRepository.findById(id);
    }

    public Habit save(Habit habit) {
        return habitRepository.save(habit);
    }

    public void delete(Long id) {
        habitRepository.deleteById(id);
    }
}
