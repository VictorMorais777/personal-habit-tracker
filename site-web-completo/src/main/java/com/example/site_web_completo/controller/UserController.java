package com.example.site_web_completo.controller;

import com.example.site_web_completo.model.User;
import com.example.site_web_completo.model.dto.ProfileUpdateRequest;
import com.example.site_web_completo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import com.example.site_web_completo.model.dto.PublicUserResponse;
import java.util.List;


@RestController
@RequestMapping("/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping("/{id}")
    public ResponseEntity<User> findById(@PathVariable Long id, Authentication authentication) {
        return userService.findById(id)
                .filter(user -> user.getEmail().equals(authentication.getName()))
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.status(HttpStatus.FORBIDDEN).build());
    }

    @PutMapping("/{id}/profile")
    public User updateProfile(
            @PathVariable Long id,
            @RequestBody ProfileUpdateRequest request,
            Authentication authentication
    ) {
        return userService.updateProfile(id, authentication.getName(), request);
    }

    @GetMapping("/search")
    public List<PublicUserResponse> search(@RequestParam String q, Authentication authentication) {
        return userService.searchByName(q, authentication.getName()).stream()
                .map(PublicUserResponse::from)
                .toList();
    }
}