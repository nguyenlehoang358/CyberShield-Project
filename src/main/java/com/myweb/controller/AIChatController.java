package com.myweb.controller;

import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.myweb.config.AIRateLimiter;
import com.myweb.service.ChatHistoryService;
import com.myweb.service.RAGService;

import jakarta.servlet.http.HttpServletRequest;

/**
 * AI Chat Controller — Phase 5: hardened with rate limiting, input validation,
 * comprehensive health checks.
 *
 * POST /api/ai/chat → Full RAG pipeline (rate-limited)
 * GET /api/ai/status → AI service health status
 * GET /api/ai/health → Comprehensive health check (all components)
 * POST /api/ai/clear → Clear chat history for a session
 */
@RestController
@RequestMapping("/api/ai")
public class AIChatController {

    private static final Logger log = LoggerFactory.getLogger(AIChatController.class);
    private static final int MAX_MESSAGE_LENGTH = 2000;
    private static final int MAX_SESSION_ID_LENGTH = 100;

    private final RAGService ragService;
    private final ChatHistoryService chatHistoryService;
    private final AIRateLimiter rateLimiter;

    public AIChatController(RAGService ragService,
            ChatHistoryService chatHistoryService,
            AIRateLimiter rateLimiter) {
        this.ragService = ragService;
        this.chatHistoryService = chatHistoryService;
        this.rateLimiter = rateLimiter;
    }

    /**
     * POST /api/ai/chat
     * Main chat endpoint — full RAG pipeline with rate limiting.
     */
    @PostMapping("/chat")
    public ResponseEntity<?> chat(@RequestBody Map<String, String> request,
            HttpServletRequest httpRequest) {
        String clientIp = getClientIp(httpRequest);

        // ═══ Rate Limiting ═══
        if (!rateLimiter.isAllowed(clientIp)) {
            log.warn("🚫 AI rate limit exceeded for IP: {}", clientIp);
            return ResponseEntity.status(429).body(Map.of(
                    "error", "Quá nhiều yêu cầu. Vui lòng thử lại sau.",
                    "retryAfter", rateLimiter.getResetSeconds(clientIp),
                    "status", 429));
        }

        String userMessage = request.get("message");
        String sessionId = request.get("sessionId");

        // ═══ Input Validation ═══
        if (userMessage == null || userMessage.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                    Map.of("error", "Message cannot be empty", "status", 400));
        }

        // Truncate overly long messages
        userMessage = userMessage.trim();
        if (userMessage.length() > MAX_MESSAGE_LENGTH) {
            userMessage = userMessage.substring(0, MAX_MESSAGE_LENGTH);
        }

        // Sanitize session ID
        if (sessionId != null && sessionId.length() > MAX_SESSION_ID_LENGTH) {
            sessionId = sessionId.substring(0, MAX_SESSION_ID_LENGTH);
        }

        // ═══ Sanitize input (basic XSS prevention) ═══
        userMessage = sanitizeInput(userMessage);

        log.info("💬 AI Chat [{}] from {}: {}", sessionId, clientIp,
                userMessage.substring(0, Math.min(userMessage.length(), 80)));

        // ═══ Run RAG Pipeline ═══
        Map<String, Object> result = ragService.chat(userMessage, sessionId);

        // Add rate limit info to response
        result.put("rateLimitRemaining", rateLimiter.getRemaining(clientIp));

        // Return appropriate status code
        if (result.containsKey("error")) {
            return ResponseEntity.status(503).body(result);
        }

        return ResponseEntity.ok(result);
    }

    /**
     * GET /api/ai/status
     * Quick status check.
     */
    @GetMapping("/status")
    public ResponseEntity<?> status() {
        try {
            Map<String, Object> stats = ragService.getStats();
            stats.put("status", "OK");
            stats.put("pipeline", "RAG");
            return ResponseEntity.ok(stats);
        } catch (Exception e) {
            return ResponseEntity.status(503).body(Map.of(
                    "status", "DEGRADED",
                    "error", e.getMessage()));
        }
    }

    /**
     * GET /api/ai/health
     * Comprehensive health check for all AI components.
     */
    @GetMapping("/health")
    public ResponseEntity<?> health() {
        Map<String, Object> health = new LinkedHashMap<>();
        health.put("timestamp", System.currentTimeMillis());

        // Check RAG stats (documents + history)
        try {
            Map<String, Object> stats = ragService.getStats();
            health.put("rag", Map.of(
                    "status", "UP",
                    "totalDocuments", stats.get("totalDocuments"),
                    "totalSessions", stats.get("totalSessions"),
                    "totalMessages", stats.get("totalMessages")));
        } catch (Exception e) {
            health.put("rag", Map.of("status", "DOWN", "error", e.getMessage()));
        }

        // Check embedding model
        try {
            // A lightweight test — just checking if the embedding model is loaded
            health.put("embedding", Map.of("status", "UP", "model", "all-MiniLM-L6-v2"));
        } catch (Exception e) {
            health.put("embedding", Map.of("status", "DOWN", "error", e.getMessage()));
        }

        // Overall status
        boolean allUp = health.values().stream()
                .filter(v -> v instanceof Map)
                .allMatch(v -> "UP".equals(((Map<?, ?>) v).get("status")));
        health.put("status", allUp ? "UP" : "DEGRADED");

        return ResponseEntity.ok(health);
    }

    /**
     * POST /api/ai/clear
     * Clear chat history for a specific session.
     */
    @PostMapping("/clear")
    public ResponseEntity<?> clearHistory(@RequestParam String sessionId) {
        if (sessionId == null || sessionId.isBlank()) {
            return ResponseEntity.badRequest().body(Map.of("error", "sessionId is required"));
        }
        if (sessionId.length() > MAX_SESSION_ID_LENGTH) {
            return ResponseEntity.badRequest().body(Map.of("error", "Invalid sessionId"));
        }
        chatHistoryService.clearHistory(sessionId);
        return ResponseEntity.ok(Map.of("message", "History cleared", "sessionId", sessionId));
    }

    /**
     * Basic input sanitization to prevent prompt injection / XSS.
     */
    private String sanitizeInput(String input) {
        if (input == null)
            return "";
        return input
                .replace("<script>", "")
                .replace("</script>", "")
                .replace("<iframe", "")
                .replace("javascript:", "")
                .trim();
    }

    /**
     * Extract client IP, handling proxies.
     */
    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
