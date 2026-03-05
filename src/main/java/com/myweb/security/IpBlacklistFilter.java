package com.myweb.security;

import java.io.IOException;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class IpBlacklistFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(IpBlacklistFilter.class);
    private static final String BLOCKED_KEY = "bf:blocked:";

    private final StringRedisTemplate redisTemplate;

    public IpBlacklistFilter(StringRedisTemplate redisTemplate) {
        this.redisTemplate = redisTemplate;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String clientIp = getClientIp(request);

        try {
            // Check if IP exists in Redis Blacklist
            if (Boolean.TRUE.equals(redisTemplate.hasKey(BLOCKED_KEY + clientIp))) {
                log.warn("🚨 SOAR Defense: Blocked IP {} attempted to access {}", clientIp, request.getRequestURI());

                response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                response.setContentType("application/json;charset=UTF-8");
                response.getWriter().write(
                        "{\"error\": \"Quyền truy cập bị từ chối: IP của bạn đã bị khóa do vi phạm bảo mật.\", \"status\": 403}");
                return; // Abort request
            }
        } catch (Exception e) {
            log.error("Redis check failed in IpBlacklistFilter: {}", e.getMessage());
            // Fail open to avoid blocking valid traffic if Redis crashes
        }

        filterChain.doFilter(request, response);
    }

    private String getClientIp(HttpServletRequest request) {
        String xff = request.getHeader("X-Forwarded-For");
        if (xff != null && !xff.isBlank()) {
            return xff.split(",")[0].trim();
        }
        return request.getRemoteAddr();
    }
}
