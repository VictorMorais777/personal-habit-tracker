package com.example.site_web_completo.service;

import java.nio.charset.StandardCharsets;

public final class PasswordPolicy {

    public static final int MIN_LENGTH = 8;
    public static final int MAX_BYTES = 72;

    private PasswordPolicy() {}

    public static String validate(String password) {
        if (password == null || password.length() < MIN_LENGTH) {
            return "A senha precisa ter pelo menos 8 caracteres.";
        }
        if (password.getBytes(StandardCharsets.UTF_8).length > MAX_BYTES) {
            return "A senha é longa demais (máximo de 72 caracteres).";
        }
        return null;
    }
}