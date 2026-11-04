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
import com.example.site_web_completo.model.UserPhoto;
import com.example.site_web_completo.service.UserPhotoService;
import org.springframework.http.CacheControl;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;
import java.time.Duration;
import java.util.Map;


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

    @Autowired
    private UserPhotoService userPhotoService;

    @PostMapping(value = "/me/photo", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public Map<String, Long> uploadPhoto(
            @RequestParam("file") MultipartFile file,
            Authentication authentication
    ) {
        long version = userPhotoService.save(authentication.getName(), file);
        return Map.of("photoVersion", version);
    }

    @DeleteMapping("/me/photo")
    public ResponseEntity<Void> deletePhoto(Authentication authentication) {
        userPhotoService.delete(authentication.getName());
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/photo")
    public ResponseEntity<byte[]> getPhoto(@PathVariable Long id) {
        UserPhoto photo = userPhotoService.get(id);
        return ResponseEntity.ok()
                .contentType(MediaType.IMAGE_JPEG)
                .cacheControl(CacheControl.maxAge(Duration.ofDays(1)).cachePrivate())
                .body(photo.getData());
    }
}