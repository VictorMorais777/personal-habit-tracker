package com.example.site_web_completo.controller;

import com.example.site_web_completo.config.JwtUtil;
import com.example.site_web_completo.model.User;
import com.example.site_web_completo.service.PasswordPolicy;
import com.example.site_web_completo.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;
import java.util.regex.Pattern;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$");

    @Autowired
    private UserService userService;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtUtil jwtUtil;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        String name = request.name() == null ? "" : request.name().trim();
        String email = request.email() == null ? "" : request.email().trim();

        if (name.isEmpty()) {
            return badRequest("Informe seu nome.");
        }
        if (!EMAIL_PATTERN.matcher(email).matches()) {
            return badRequest("Informe um email válido.");
        }
        String passwordProblem = PasswordPolicy.validate(request.password());
        if (passwordProblem != null) {
            return badRequest(passwordProblem);
        }
        if (userService.findByEmail(email).isPresent()) {
            return badRequest("Email já cadastrado");
        }

        User savedUser;
        try {
            savedUser = userService.register(name, email, request.password());
        } catch (DataIntegrityViolationException e) {
            // dois cadastros simultâneos com o mesmo email: o banco barra o segundo
            return badRequest("Email já cadastrado");
        }

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

    private ResponseEntity<Map<String, String>> badRequest(String message) {
        return ResponseEntity.badRequest().body(Map.of("message", message));
    }

    public record RegisterRequest(String name, String email, String password) {}

    public record LoginRequest(String email, String password) {}
}