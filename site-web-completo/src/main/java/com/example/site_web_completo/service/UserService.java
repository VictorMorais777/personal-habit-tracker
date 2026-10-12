package com.example.site_web_completo.service;

import com.example.site_web_completo.model.User;
import com.example.site_web_completo.model.dto.ProfileUpdateRequest;
import com.example.site_web_completo.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;
import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public List<User> listAll() {
        return userRepository.findAll();
    }

    public Optional<User> findById(Long id) {
        return userRepository.findById(id);
    }

    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    public User register(User user) {
        user.setPassword(passwordEncoder.encode(user.getPassword()));
        return userRepository.save(user);
    }

    public User save(User user) {
        return userRepository.save(user);
    }

    public User updateProfile(Long userId, String requesterEmail, ProfileUpdateRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "User not found"));

        if (!user.getEmail().equals(requesterEmail)) {
            throw new ResponseStatusException(HttpStatus.FORBIDDEN, "Not your profile");
        }

        user.setBio(request.bio());
        user.setLocation(request.location());
        user.setMainGoal(request.mainGoal());
        user.setInstagramUrl(request.instagramUrl());
        user.setTwitterUrl(request.twitterUrl());
        user.setLinkedinUrl(request.linkedinUrl());
        user.setGithubUrl(request.githubUrl());

        return userRepository.save(user);
    }

    public void delete(Long id) {
        userRepository.deleteById(id);
    }

    public List<User> searchByName(String query, String requesterEmail) {
        if (query == null || query.trim().length() < 2) {
            return List.of();
        }
        return userRepository.findByNameContainingIgnoreCase(query.trim()).stream()
                .filter(user -> !user.getEmail().equals(requesterEmail))
                .limit(20)
                .toList();
    }
}