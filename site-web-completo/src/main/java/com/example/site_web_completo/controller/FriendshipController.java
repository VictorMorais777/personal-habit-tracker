package com.example.site_web_completo.controller;

import com.example.site_web_completo.model.Friendship;
import com.example.site_web_completo.model.User;
import com.example.site_web_completo.model.dto.FriendshipResponse;
import com.example.site_web_completo.model.dto.PublicUserResponse;
import com.example.site_web_completo.service.FriendshipService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/friends")
public class FriendshipController {

    @Autowired
    private FriendshipService friendshipService;

    private FriendshipResponse toResponse(Friendship friendship, String myEmail) {
        User other = friendship.getRequester().getEmail().equals(myEmail)
                ? friendship.getAddressee()
                : friendship.getRequester();
        return new FriendshipResponse(friendship.getId(), PublicUserResponse.from(other), friendship.getStatus());
    }

    @GetMapping
    public List<FriendshipResponse> listFriends(Authentication authentication) {
        String email = authentication.getName();
        return friendshipService.listFriends(email).stream()
                .map(f -> toResponse(f, email))
                .toList();
    }

    @GetMapping("/requests")
    public List<FriendshipResponse> listReceivedRequests(Authentication authentication) {
        String email = authentication.getName();
        return friendshipService.listReceivedRequests(email).stream()
                .map(f -> toResponse(f, email))
                .toList();
    }

    @PostMapping("/requests/{userId}")
    public FriendshipResponse sendRequest(@PathVariable Long userId, Authentication authentication) {
        String email = authentication.getName();
        return toResponse(friendshipService.sendRequest(email, userId), email);
    }

    @PutMapping("/requests/{id}/accept")
    public FriendshipResponse accept(@PathVariable Long id, Authentication authentication) {
        String email = authentication.getName();
        return toResponse(friendshipService.accept(email, id), email);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> remove(@PathVariable Long id, Authentication authentication) {
        friendshipService.remove(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}