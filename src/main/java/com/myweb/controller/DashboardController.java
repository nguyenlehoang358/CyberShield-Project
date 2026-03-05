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

                // Specific aggregated charts
                long contactCount = contactMessageRepository.count();
                long unreadContactCount = contactMessageRepository
                                .countByStatus(com.myweb.entity.ContactMessage.Status.UNREAD);
                long blogCount = blogPostRepository.count();
                long publishedBlogCount = blogPostRepository.countByPublishedTrue();
                long auditCount = auditLogRepository.count();
                long defectCount = auditLogRepository.countBySeverity(com.myweb.entity.AuditLog.Severity.DANGER);

                Map<String, Object> charts = Map.of(
                                "contacts",
                                Map.of("total", contactCount, "unread", unreadContactCount, "read",
                                                contactCount - unreadContactCount),
                                "blogs",
                                Map.of("total", blogCount, "published", publishedBlogCount, "draft",
                                                blogCount - publishedBlogCount),
                                "security",
                                Map.of("total", auditCount, "danger", defectCount, "safe", auditCount - defectCount));

                return ResponseEntity.ok(Map.of(
                                "userCount", userRepository.count(),
                                "tables", tables,
                                "charts", charts,
                                "recentLogs", java.util.List.of()));
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
