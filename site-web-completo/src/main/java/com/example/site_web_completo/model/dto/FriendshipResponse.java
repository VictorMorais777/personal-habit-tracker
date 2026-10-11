package com.example.site_web_completo.model.dto;

import com.example.site_web_completo.model.FriendshipStatus;

public record FriendshipResponse(
        Long id,
        PublicUserResponse user,
        FriendshipStatus status
) {}