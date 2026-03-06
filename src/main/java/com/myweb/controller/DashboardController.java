package com.myweb.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.myweb.dto.UserResponse;
import com.myweb.repository.UserRepository;

@RestController
@RequestMapping("/api/dashboard")
@PreAuthorize("hasRole('ADMIN')")
public class DashboardController {

        private final UserRepository userRepository;
        private final com.myweb.repository.SolutionRepository solutionRepository;
        private final com.myweb.repository.ContactMessageRepository contactMessageRepository;
        private final com.myweb.repository.BlogPostRepository blogPostRepository;
        private final com.myweb.repository.AuditLogRepository auditLogRepository;

        private final JdbcTemplate jdbcTemplate;

        public DashboardController(UserRepository userRepository,
                        com.myweb.repository.SolutionRepository solutionRepository,
                        com.myweb.repository.ContactMessageRepository contactMessageRepository,
                        com.myweb.repository.BlogPostRepository blogPostRepository,
                        com.myweb.repository.AuditLogRepository auditLogRepository,
                        JdbcTemplate jdbcTemplate) {
                this.userRepository = userRepository;
                this.solutionRepository = solutionRepository;
                this.contactMessageRepository = contactMessageRepository;
                this.blogPostRepository = blogPostRepository;
                this.auditLogRepository = auditLogRepository;
                this.jdbcTemplate = jdbcTemplate;
        }

        @GetMapping("/stats")
        public ResponseEntity<Map<String, Object>> getStats() {
                // Safe, real-time query reading from Postgres statistical view using
                // JdbcTemplate
                List<Map<String, Object>> tables = jdbcTemplate.query(
                                "SELECT relname AS table_name, COALESCE(n_live_tup, 0) AS row_count FROM pg_stat_user_tables ORDER BY n_live_tup DESC",
                                (rs, rowNum) -> {
                                        String tableName = rs.getString("table_name");
                                        long rowsCount = rs.getLong("row_count");
                                        return Map.<String, Object>of(
                                                        "name", tableName,
                                                        "rows", rowsCount,
                                                        "description", getTableDescription(tableName));
                                });

                // Specific aggregated charts — each wrapped separately so one failure
                // doesn't kill all charts. Using HashMap to tolerate potential null values.
                java.util.Map<String, Object> charts = new java.util.HashMap<>();
                try {
                        long contactCount2 = contactMessageRepository.count();
                        long unreadCount = contactMessageRepository
                                        .countByStatus(com.myweb.entity.ContactMessage.Status.UNREAD);
                        java.util.Map<String, Object> contactChart = new java.util.HashMap<>();
                        contactChart.put("total", contactCount2);
                        contactChart.put("unread", unreadCount);
                        contactChart.put("read", contactCount2 - unreadCount);
                        charts.put("contacts", contactChart);
                } catch (Exception e) {
                        charts.put("contacts", java.util.Map.of("total", 0L, "unread", 0L, "read", 0L));
                }
                try {
                        long blogTotal = blogPostRepository.count();
                        long publishedCount = blogPostRepository.countByPublishedTrue();
                        java.util.Map<String, Object> blogChart = new java.util.HashMap<>();
                        blogChart.put("total", blogTotal);
                        blogChart.put("published", publishedCount);
                        blogChart.put("draft", blogTotal - publishedCount);
                        charts.put("blogs", blogChart);
                } catch (Exception e) {
                        charts.put("blogs", java.util.Map.of("total", 0L, "published", 0L, "draft", 0L));
                }
                try {
                        long auditTotal = auditLogRepository.count();
                        long dangerCount = auditLogRepository
                                        .countBySeverity(com.myweb.entity.AuditLog.Severity.DANGER);
                        java.util.Map<String, Object> securityChart = new java.util.HashMap<>();
                        securityChart.put("total", auditTotal);
                        securityChart.put("danger", dangerCount);
                        securityChart.put("safe", auditTotal - dangerCount);
                        charts.put("security", securityChart);
                } catch (Exception e) {
                        charts.put("security", java.util.Map.of("total", 0L, "danger", 0L, "safe", 0L));
                }

                // Recent audit logs (10 most recent) — wrapped in try-catch
                // so chart/stats data still returns even if audit query fails
                List<?> recentLogs;
                try {
                        recentLogs = auditLogRepository.findTop20ByOrderByTimestampDesc()
                                        .stream().limit(10).toList();
                } catch (Exception e) {
                        recentLogs = List.of();
                }

                // Use HashMap (tolerates null values, unlike Map.of)
                java.util.Map<String, Object> response = new java.util.HashMap<>();
                response.put("userCount", userRepository.count());
                response.put("contactCount", contactMessageRepository.count());
                response.put("tables", tables);
                response.put("charts", charts);
                response.put("recentLogs", recentLogs);

                return ResponseEntity.ok(response);
        }

        private String getTableDescription(String tableName) {
                return switch (tableName.toLowerCase()) {
                        case "users" -> "Bảng quản lý người dùng hệ thống";
                        case "solutions" -> "Giải pháp & Dịch vụ web cung cấp";
                        case "contact_messages" -> "Phản hồi/Tin nhắn từ khách hàng";
                        case "blog_posts" -> "Cơ sở dữ liệu tin tức & bài viết";
                        case "audit_logs" -> "Nhật ký truy cập và bảo mật";
                        case "security_events" -> "Các sự kiện giám sát an ninh (Security AI)";
                        case "login_attempts" -> "Ghi nhận tiến trình đăng nhập sai biệt";
                        case "blocked_ips" -> "Danh sách IP bị khóa (Brute Force)";
                        case "user_roles", "roles" -> "Cấu trúc phân quyền quyền (RBAC)";
                        case "lab_documents" -> "Tài liệu phòng thí nghiệm CyberSec";
                        case "chat_conversations" -> "Lịch sử Chat AI với học viên";
                        default -> "Bảng hệ thống mở rộng";
                };
        }

        @GetMapping("/database/users")
        public ResponseEntity<List<UserResponse>> getUsers() {
                return ResponseEntity.ok(
                                userRepository.findAll().stream()
                                                .map(UserResponse::from)
                                                .toList());
        }
}
