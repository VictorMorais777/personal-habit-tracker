package com.example.site_web_completo.controller;

import com.example.site_web_completo.config.JwtUtil;
import com.example.site_web_completo.model.User;
import com.example.site_web_completo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
public class AuthController {

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody User user) {
        if (userService.findByEmail(user.getEmail()).isPresent()) {
            return ResponseEntity.badRequest().body(Map.of("message", "Email já cadastrado"));
        }

        User savedUser = userService.register(user);
        String token = jwtUtil.generateToken(savedUser.getEmail());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "userId", savedUser.getId(),
                "name", savedUser.getName()
        ));
    }

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        Optional<User> userOpt = userService.findByEmail(request.email());

        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "Credenciais inválidas"));
        }

        User user = userOpt.get();

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            return ResponseEntity.status(401).body(Map.of("message", "Credenciais inválidas"));
        }

        String token = jwtUtil.generateToken(user.getEmail());

        return ResponseEntity.ok(Map.of(
                "token", token,
                "userId", user.getId(),
                "name", user.getName()
        ));
    }

    public record LoginRequest(String email, String password) {}
}