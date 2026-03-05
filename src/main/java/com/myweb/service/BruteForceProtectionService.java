package com.myweb.service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.TimeUnit;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Lazy;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.stereotype.Service;

import com.myweb.entity.BlockedIpHistory;
import com.myweb.repository.BlockedIpHistoryRepository;

/**
 * Brute Force Protection Service — Redis-backed login attempt tracking.
 *
 * Features:
 * - Track failed login attempts per IP and per username
 * - Progressive lockout: 3→CAPTCHA, 5→1min, 10→5min, 20→1h
 * - Auto IP blocking with TTL
 * - IP whitelist support
 *
 * Redis Keys:
 * bf:failures:ip:{ip} → failure count (TTL: 1h)
 * bf:failures:user:{username} → failure count (TTL: 1h)
 * bf:blocked:{ip} → "1" (TTL: dynamic)
 * bf:captcha:{ip} → "1" (TTL: 5min)
 */
@Service
public class BruteForceProtectionService {

    private static final Logger log = LoggerFactory.getLogger(BruteForceProtectionService.class);

    private static final String IP_FAILURE_KEY = "bf:failures:ip:";
    private static final String USER_FAILURE_KEY = "bf:failures:user:";
    private static final String BLOCKED_KEY = "bf:blocked:";
    private static final String CAPTCHA_KEY = "bf:captcha:";

    private final StringRedisTemplate redisTemplate;
    private final SecurityEventService securityEventService;
    private final BlockedIpHistoryRepository blockedIpRepo;
    private final boolean redisAvailable;

    @Value("${app.bruteforce.max-attempts}")
    private int maxAttempts;

    @Value("${app.bruteforce.captcha-threshold}")
    private int captchaThreshold;

    @Value("${app.bruteforce.lock-duration-minutes}")
    private int lockDurationMinutes;

    @Value("${app.bruteforce.escalation-multiplier}")
    private int escalationMultiplier;

    @Value("${app.bruteforce.permanent-block-threshold}")
    private int permanentBlockThreshold;

    @Value("${app.bruteforce.whitelist-ips}")
    private String whitelistIps;

    public BruteForceProtectionService(StringRedisTemplate redisTemplate,
            @Lazy SecurityEventService securityEventService,
            BlockedIpHistoryRepository blockedIpRepo) {
        this.redisTemplate = redisTemplate;
        this.securityEventService = securityEventService;
        this.blockedIpRepo = blockedIpRepo;

        boolean available = false;
        try {
            redisTemplate.getConnectionFactory().getConnection().ping();
            available = true;
        } catch (Exception e) {
            log.warn("⚠️ BruteForce: Redis unavailable — brute force protection disabled");
        }
        this.redisAvailable = available;
    }

    /**
     * Check if an IP is currently blocked.
     */
    public boolean isBlocked(String ip) {
        if (!redisAvailable || isWhitelisted(ip))
            return false;
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(BLOCKED_KEY + ip));
        } catch (Exception e) {
            log.error("Redis error checking blocked IP: {}", e.getMessage());
            return false;
        }
    }

    /**
     * Check if CAPTCHA should be required for this IP.
     */
    public boolean isCaptchaRequired(String ip) {
        if (!redisAvailable)
            return false;
        try {
            return Boolean.TRUE.equals(redisTemplate.hasKey(CAPTCHA_KEY + ip));
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Record a failed login attempt. Returns the current failure count.
     * Automatically escalates blocking based on thresholds.
     */
    public long recordFailure(String ip, String username) {
        if (!redisAvailable || isWhitelisted(ip))
            return 0;

        try {
            // Increment IP failure counter
            String ipKey = IP_FAILURE_KEY + ip;
            Long ipFailures = redisTemplate.opsForValue().increment(ipKey);
            redisTemplate.expire(ipKey, 1, TimeUnit.HOURS);

            // Increment user failure counter (if username provided)
            if (username != null && !username.isEmpty()) {
                String userKey = USER_FAILURE_KEY + username;
                redisTemplate.opsForValue().increment(userKey);
                redisTemplate.expire(userKey, 1, TimeUnit.HOURS);
            }

            long failures = ipFailures != null ? ipFailures : 0;

            // Apply progressive lockout
            if (failures >= permanentBlockThreshold) {
                // 50+ failures → block for 24h
                blockIP(ip, 24 * 60, "BRUTE_FORCE_AUTO_BLOCK_PERMANENT");
                log.error("🚨 PERMANENT BLOCK: IP {} blocked for 24h ({} failures)", ip, failures);
                securityEventService.logIpBlocked(ip,
                        String.format("Permanent block: %d failures in 1h (blocked 24h)", failures));
            } else if (failures >= maxAttempts * 4) {
                // 20+ failures → block for 1h
                blockIP(ip, 60, "BRUTE_FORCE_AUTO_BLOCK_1H");
                log.warn("🔴 BLOCK 1H: IP {} ({} failures)", ip, failures);
                securityEventService.logBruteForce(ip,
                        String.format("Escalated block: %d failures (blocked 1h)", failures));
            } else if (failures >= maxAttempts * 2) {
                // 10+ failures → block for 5min
                blockIP(ip, lockDurationMinutes * escalationMultiplier, "BRUTE_FORCE_AUTO_BLOCK_MED");
                log.warn("🟡 BLOCK 5MIN: IP {} ({} failures)", ip, failures);
                securityEventService.logBruteForce(ip,
                        String.format("Medium block: %d failures (blocked %dmin)", failures,
                                lockDurationMinutes * escalationMultiplier));
            } else if (failures >= maxAttempts) {
                // 5+ failures → block for 1min
                blockIP(ip, lockDurationMinutes, "BRUTE_FORCE_AUTO_BLOCK_INIT");
                log.warn("🟠 BLOCK 1MIN: IP {} ({} failures)", ip, failures);
                securityEventService.logRateLimit(ip,
                        String.format("Initial block: %d failures (blocked %dmin)", failures, lockDurationMinutes));
            } else if (failures >= captchaThreshold) {
                // 3+ failures → require CAPTCHA
                redisTemplate.opsForValue().set(CAPTCHA_KEY + ip, "1", 5, TimeUnit.MINUTES);
                log.info("🔐 CAPTCHA required for IP: {} ({} failures)", ip, failures);
            }

            return failures;
        } catch (Exception e) {
            log.error("Redis error recording failure: {}", e.getMessage());
            return 0;
        }
    }

    /**
     * Record a successful login — resets failure counters.
     */
    public void recordSuccess(String ip, String username) {
        if (!redisAvailable)
            return;
        try {
            redisTemplate.delete(IP_FAILURE_KEY + ip);
            redisTemplate.delete(CAPTCHA_KEY + ip);
            if (username != null) {
                redisTemplate.delete(USER_FAILURE_KEY + username);
            }
            log.debug("✅ Login success, counters reset for IP: {}", ip);
        } catch (Exception e) {
            log.error("Redis error recording success: {}", e.getMessage());
        }
    }

    /**
     * Manually block an IP for specified duration.
     */
    public void blockIP(String ip, long durationMinutes, String reason) {
        if (!redisAvailable)
            return;
        try {
            redisTemplate.opsForValue().set(BLOCKED_KEY + ip, "1", durationMinutes, TimeUnit.MINUTES);
            blockedIpRepo.save(new BlockedIpHistory(ip, reason != null ? reason : "UNKNOWN"));
        } catch (Exception e) {
            log.error("Redis error blocking IP: {}", e.getMessage());
        }
    }

    /**
     * Manually unblock an IP.
     */
    public void unblockIP(String ip) {
        if (!redisAvailable)
            return;
        try {
            redisTemplate.delete(BLOCKED_KEY + ip);
            redisTemplate.delete(IP_FAILURE_KEY + ip);
            redisTemplate.delete(CAPTCHA_KEY + ip);
            log.info("🔓 IP unblocked: {}", ip);
        } catch (Exception e) {
            log.error("Redis error unblocking IP: {}", e.getMessage());
        }
    }

    /**
     * Get current failure count for an IP.
     */
    public long getFailureCount(String ip) {
        if (!redisAvailable)
            return 0;
        try {
            String val = redisTemplate.opsForValue().get(IP_FAILURE_KEY + ip);
            return val != null ? Long.parseLong(val) : 0;
        } catch (Exception e) {
            return 0;
        }
    }

    private boolean isWhitelisted(String ip) {
        if (whitelistIps == null)
            return false;
        for (String wip : whitelistIps.split(",")) {
            if (wip.trim().equals(ip))
                return true;
        }
        return false;
    }

    /**
     * Get all currently blocked IPs with their TTL and failure counts.
     * Used by Admin Security Dashboard.
     */
    public List<Map<String, Object>> getBlockedIPsDetails() {
        List<Map<String, Object>> result = new ArrayList<>();
        if (!redisAvailable)
            return result;
        try {
            Set<String> keys = redisTemplate.keys(BLOCKED_KEY + "*");
            if (keys == null)
                return result;
            for (String key : keys) {
                String ip = key.replace(BLOCKED_KEY, "");
                Map<String, Object> entry = new HashMap<>();
                entry.put("ip", ip);
                Long ttl = redisTemplate.getExpire(key, TimeUnit.SECONDS);
                entry.put("remainingSeconds", ttl != null ? ttl : -1);
                entry.put("failureCount", getFailureCount(ip));
                entry.put("captchaRequired", isCaptchaRequired(ip));
                result.add(entry);
            }
        } catch (Exception e) {
            log.error("Error getting blocked IPs: {}", e.getMessage());
        }
        return result;
    }

    /**
     * Get remaining block time for an IP (in seconds).
     */
    public long getRemainingBlockTTL(String ip) {
        if (!redisAvailable)
            return 0;
        try {
            Long ttl = redisTemplate.getExpire(BLOCKED_KEY + ip, TimeUnit.SECONDS);
            return ttl != null && ttl > 0 ? ttl : 0;
        } catch (Exception e) {
            return 0;
        }
    }

    /**
     * Get max attempts config value.
     */
    public int getMaxAttempts() {
        return maxAttempts;
    }

    /**
     * Check if Redis is available.
     */
    public boolean isRedisAvailable() {
        return redisAvailable;
    }
}
