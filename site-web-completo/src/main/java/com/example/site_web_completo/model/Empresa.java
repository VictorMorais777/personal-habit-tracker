package com.example.site_web_completo.model;

import jakarta.persistence.*;
import lombok.Data;

@Entity
@Table(name="empresa")
@Data
public class Empresa {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String nome;

    @Column(nullable = false, unique = true)
    private String cnpj;

    @Column(nullable = false)
    private String nomeFantasia;
}
