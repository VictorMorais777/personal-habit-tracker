package com.example.site_web_completo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name = "users")
@Data
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    @Column(nullable = false, unique = true)
    private String email;

    @Column(nullable = false)
    private String password;

    @Column(length = 500)
    private String bio;

    private String location;

    private String mainGoal;

    private String instagramUrl;
    private String twitterUrl;
    private String linkedinUrl;
    private String githubUrl;
}