package com.example.site_web_completo.controller;

import com.example.site_web_completo.service.AiAssistantService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;

@RestController
@RequestMapping("/ai")
public class AiController {

    @Autowired
    private AiAssistantService assistant;

    @GetMapping("/quota")
    public AiAssistantService.QuotaResponse quota(Authentication authentication) {
        return assistant.quota(authentication.getName());
    }

    @PostMapping("/suggestions")
    public AiAssistantService.SuggestionsResponse suggestions(
            @RequestBody SuggestionsRequest request,
            Authentication authentication
    ) {
        return assistant.suggest(authentication.getName(), request.focus());
    }

    @PostMapping("/summary")
    public AiAssistantService.SummaryResponse summary(
            @RequestBody SummaryRequest request,
            Authentication authentication
    ) {
        return assistant.weeklySummary(authentication.getName(), request.today());
    }

    public record SuggestionsRequest(String focus) {}

    public record SummaryRequest(LocalDate today) {}
}