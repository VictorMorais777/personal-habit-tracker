package com.example.site_web_completo.controller;

import com.example.site_web_completo.model.dto.HabitCreateRequest;
import com.example.site_web_completo.model.dto.HabitResponse;
import com.example.site_web_completo.model.dto.HabitUpdateRequest;
import com.example.site_web_completo.service.HabitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/habits")
public class HabitController {

    @Autowired
    private HabitService habitService;

    @GetMapping("/user/{userId}")
    public List<HabitResponse> listByUser(@PathVariable Long userId, Authentication authentication) {
        return habitService.listVisibleByUser(userId, authentication.getName()).stream()
                .map(HabitResponse::from)
                .toList();
    }

    @PostMapping
    public HabitResponse create(@RequestBody HabitCreateRequest request, Authentication authentication) {
        return HabitResponse.from(habitService.create(authentication.getName(), request));
    }

    @PutMapping("/{id}")
    public HabitResponse update(
            @PathVariable Long id,
            @RequestBody HabitUpdateRequest request,
            Authentication authentication
    ) {
        return HabitResponse.from(habitService.update(id, authentication.getName(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id, Authentication authentication) {
        habitService.deleteOwned(id, authentication.getName());
        return ResponseEntity.noContent().build();
    }
}