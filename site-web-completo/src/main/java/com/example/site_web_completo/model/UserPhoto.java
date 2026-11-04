package com.example.site_web_completo.model;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.Instant;

@Entity
@Table(name = "user_photos")
@Getter
@Setter
public class UserPhoto {

    @Id
    private Long userId;

    @Column(nullable = false, columnDefinition = "bytea")
    private byte[] data;

    @Column(nullable = false)
    private Instant updatedAt;
}