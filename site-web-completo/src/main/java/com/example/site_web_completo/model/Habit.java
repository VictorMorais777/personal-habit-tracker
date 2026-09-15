package com.example.site_web_completo.model;

import jakarta.persistence.*;
import lombok.Data;

import java.util.Set;

@Entity
@Table(name = "habits")
@Data
public class Habit {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String name;

    private String description;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private FrequencyType frequencyType;

    @ElementCollection
    private Set<Integer> weekDays;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;
}
