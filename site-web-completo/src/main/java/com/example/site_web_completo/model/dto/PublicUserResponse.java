package com.example.site_web_completo.model.dto;

import com.example.site_web_completo.model.User;

public record PublicUserResponse(
        Long id,
        String name,
        String bio,
        String location,
        String mainGoal,
        String instagramUrl,
        String twitterUrl,
        String linkedinUrl,
        String githubUrl
) {
    public static PublicUserResponse from(User user) {
        return new PublicUserResponse(
                user.getId(),
                user.getName(),
                user.getBio(),
                user.getLocation(),
                user.getMainGoal(),
                user.getInstagramUrl(),
                user.getTwitterUrl(),
                user.getLinkedinUrl(),
                user.getGithubUrl()
        );
    }
}