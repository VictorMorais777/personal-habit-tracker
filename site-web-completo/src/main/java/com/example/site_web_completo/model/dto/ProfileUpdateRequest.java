package com.example.site_web_completo.model.dto;

public record ProfileUpdateRequest(
        String bio,
        String location,
        String mainGoal,
        String instagramUrl,
        String twitterUrl,
        String linkedinUrl,
        String githubUrl
) {}