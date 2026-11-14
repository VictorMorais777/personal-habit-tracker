package com.example.site_web_completo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import java.time.LocalDate;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class AiQuotaService {

    @Value("${ai.daily-limit:5}")
    private int dailyLimit;

    private final Map<String, AtomicInteger> usage = new ConcurrentHashMap<>();

    public int limit() {
        return dailyLimit;
    }

    public int remaining(Long userId) {
        AtomicInteger used = usage.get(userId + ":" + LocalDate.now());
        return Math.max(0, dailyLimit - (used == null ? 0 : used.get()));
    }

    public int consume(Long userId) {
        String suffix = ":" + LocalDate.now();
        usage.keySet().removeIf(key -> !key.endsWith(suffix)); // descarta contadores de dias anteriores

        int used = usage.computeIfAbsent(userId + suffix, key -> new AtomicInteger()).incrementAndGet();
        if (used > dailyLimit) {
            throw new ResponseStatusException(HttpStatus.TOO_MANY_REQUESTS, "Daily AI limit reached");
        }
        return dailyLimit - used;
    }
}