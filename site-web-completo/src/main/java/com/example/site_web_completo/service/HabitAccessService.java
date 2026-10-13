package com.example.site_web_completo.service;

import com.example.site_web_completo.model.FriendshipStatus;
import com.example.site_web_completo.model.Habit;
import com.example.site_web_completo.model.User;
import com.example.site_web_completo.repository.FriendshipRepository;
import com.example.site_web_completo.repository.HabitRepository;
import com.example.site_web_completo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

@Service
public class HabitAccessService {

    @Autowired
    private HabitRepository habitRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private FriendshipRepository friendshipRepository;

    public User requester(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED, "User not found"));
    }

    public boolean areFriends(Long userA, Long userB) {
        return friendshipRepository.findBetween(userA, userB)
                .map(f -> f.getStatus() == FriendshipStatus.ACCEPTED)
                .orElse(false);
    }

    private Habit findHabit(Long habitId) {
        return habitRepository.findById(habitId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Habit not found"));
    }

    public Habit requireOwned(Long habitId, String email) {
        Habit habit = findHabit(habitId);
        if (!habit.getUser().getEmail().equals(email)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Habit not found");
        }
        return habit;
    }

    public Habit requireVisible(Long habitId, String email) {
        Habit habit = findHabit(habitId);
        if (habit.getUser().getEmail().equals(email)) {
            return habit;
        }

        boolean publicToFriend = Boolean.TRUE.equals(habit.getIsPublic())
                && areFriends(requester(email).getId(), habit.getUser().getId());
        if (!publicToFriend) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Habit not found");
        }
        return habit;
    }
}