package com.example.site_web_completo.service;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.annotation.PostConstruct;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestClientResponseException;
import org.springframework.web.server.ResponseStatusException;

import java.time.Duration;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class GeminiClient {

    private static final Logger log = LoggerFactory.getLogger(GeminiClient.class);

    @JsonIgnoreProperties(ignoreUnknown = true)
    record GeminiResponse(List<Candidate> candidates) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Candidate(Content content, String finishReason) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Content(List<Part> parts) {}

    @JsonIgnoreProperties(ignoreUnknown = true)
    record Part(String text) {}

    @Value("${gemini.api-key:}")
    private String apiKey;

    @Value("${gemini.model:gemini-3.5-flash-lite}")
    private String model;

    @Value("${gemini.base-url:https://generativelanguage.googleapis.com/v1beta}")
    private String baseUrl;

    private RestClient restClient;

    @PostConstruct
    void init() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(Duration.ofSeconds(5));
        factory.setReadTimeout(Duration.ofSeconds(30));
        restClient = RestClient.builder().baseUrl(baseUrl).requestFactory(factory).build();
    }

    public String generate(String systemPrompt, String userPrompt, int maxOutputTokens,
                           Map<String, Object> responseSchema) {
        if (apiKey == null || apiKey.isBlank()) {
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "AI is not configured");
        }

        Map<String, Object> generationConfig = new HashMap<>();
        generationConfig.put("temperature", 0.8);
        generationConfig.put("maxOutputTokens", maxOutputTokens);
        if (responseSchema != null) {
            generationConfig.put("responseMimeType", "application/json");
            generationConfig.put("responseSchema", responseSchema);
        }

        Map<String, Object> body = Map.of(
                "systemInstruction", Map.of("parts", List.of(Map.of("text", systemPrompt))),
                "contents", List.of(Map.of("role", "user", "parts", List.of(Map.of("text", userPrompt)))),
                "generationConfig", generationConfig
        );

        try {
            GeminiResponse response = restClient.post()
                    .uri("/models/{model}:generateContent", model)
                    .header("x-goog-api-key", apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .body(body)
                    .retrieve()
                    .body(GeminiResponse.class);
            return extractText(response);
        } catch (RestClientResponseException e) {
            log.warn("Gemini returned HTTP {}: {}", e.getStatusCode().value(), truncate(e.getResponseBodyAsString()));
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "AI service unavailable");
        } catch (RestClientException e) {
            log.warn("Could not reach Gemini: {}", e.getMessage());
            throw new ResponseStatusException(HttpStatus.SERVICE_UNAVAILABLE, "AI service unavailable");
        }
    }

    private String extractText(GeminiResponse response) {
        if (response == null || response.candidates() == null || response.candidates().isEmpty()) {
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Empty AI response");
        }

        Candidate candidate = response.candidates().get(0);
        if (candidate.content() == null || candidate.content().parts() == null) {
            log.warn("Gemini returned no content (finishReason={})", candidate.finishReason());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Empty AI response");
        }

        String text = candidate.content().parts().stream()
                .map(Part::text)
                .filter(Objects::nonNull)
                .collect(Collectors.joining())
                .trim();

        if (text.isEmpty()) {
            log.warn("Gemini returned empty text (finishReason={})", candidate.finishReason());
            throw new ResponseStatusException(HttpStatus.BAD_GATEWAY, "Empty AI response");
        }
        return text;
    }

    private String truncate(String text) {
        if (text == null) return "";
        return text.length() > 300 ? text.substring(0, 300) + "..." : text;
    }
}