package com.example.site_web_completo.controller;

import com.example.site_web_completo.model.Habit;
import com.example.site_web_completo.service.HabitService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/habits")
public class HabitController {

    @Autowired
    private HabitService habitService;

    @GetMapping("/user/{userId}")
    public List<Habit> listByUser(@PathVariable Long userId) {
        return habitService.listByUser(userId);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Habit> findById(@PathVariable Long id) {
        return habitService.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public Habit create(@RequestBody Habit habit) {
        return habitService.save(habit);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Habit> update(@PathVariable Long id, @RequestBody Habit habit) {
        if (habitService.findById(id).isEmpty()) {
            return ResponseEntity.notFound().build();
        }
        habit.setId(id);
        return ResponseEntity.ok(habitService.save(habit));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        habitService.delete(id);
        return ResponseEntity.noContent().build();
    }
}