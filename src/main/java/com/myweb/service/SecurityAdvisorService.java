package com.myweb.service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;

import com.myweb.entity.SecurityEvent;

import dev.langchain4j.model.chat.ChatLanguageModel;

/**
 * AI Security Advisor — uses LLM to analyze security events
 * and generate threat reports and recommendations.
 */
@Service
public class SecurityAdvisorService {

    private static final Logger log = LoggerFactory.getLogger(SecurityAdvisorService.class);

    private final ChatLanguageModel chatModel;
    private final SecurityEventService securityEventService;

    private static final String ADVISOR_SYSTEM_PROMPT = """
            Bạn là chuyên gia bảo mật AI của phòng LAB bảo mật mạng. Nhiệm vụ:

            1. PHÂN TÍCH các sự kiện bảo mật được cung cấp
            2. ĐÁNH GIÁ mức độ rủi ro tổng thể
            3. PHÁT HIỆN các pattern tấn công (brute force, scanning, DDoS, etc.)
            4. ĐỀ XUẤT biện pháp khắc phục cụ thể

            Quy tắc:
            - Trả lời bằng tiếng Việt, rõ ràng, có cấu trúc
            - Sử dụng emoji để đánh dấu mức độ: 🟢 An toàn, 🟡 Cảnh báo, 🟠 Nguy hiểm, 🔴 Nghiêm trọng
            - Liệt kê ĐỀ XUẤT theo thứ tự ưu tiên
            - Nếu phát hiện pattern bất thường, mô tả rõ ràng
            """;

    public SecurityAdvisorService(ChatLanguageModel chatModel,
            SecurityEventService securityEventService) {
        this.chatModel = chatModel;
        this.securityEventService = securityEventService;
    }

    /**
     * Generate a comprehensive AI threat analysis report based on recent events.
     */
    public Map<String, Object> generateThreatReport() {
        Map<String, Object> report = new LinkedHashMap<>();
        long startTime = System.currentTimeMillis();

        try {
            // 1. Get event summary
            String eventSummary = securityEventService.buildEventSummaryForAI();

            // 2. Get dashboard stats
            Map<String, Object> stats = securityEventService.getDashboardStats();

            // 3. Build AI prompt
            String prompt = ADVISOR_SYSTEM_PROMPT + "\n\n"
                    + eventSummary + "\n\n"
                    + "Thống kê bổ sung:\n"
                    + "- Risk Score hiện tại: " + stats.get("riskScore") + "/100\n"
                    + "- Sự kiện chưa xử lý: " + stats.get("unresolvedCount") + "\n"
                    + "- Sự kiện CRITICAL: " + stats.get("criticalCount") + "\n"
                    + "- Sự kiện HIGH: " + stats.get("highCount") + "\n"
                    + "- Sự kiện trong 1 giờ qua: " + stats.get("eventsLastHour") + "\n\n"
                    + "Hãy phân tích và đưa ra báo cáo bảo mật bao gồm:\n"
                    + "1. Đánh giá tổng quan\n"
                    + "2. Các mối đe dọa đang hoạt động\n"
                    + "3. Pattern tấn công phát hiện được\n"
                    + "4. Đề xuất biện pháp ứng phó (theo thứ tự ưu tiên)\n"
                    + "5. Kết luận và mức cảnh báo\n";

            // 4. Call LLM
            String aiAnalysis = chatModel.generate(prompt);

            long elapsed = System.currentTimeMillis() - startTime;

            report.put("analysis", aiAnalysis);
            report.put("stats", stats);
            report.put("riskScore", stats.get("riskScore"));
            report.put("generatedAt", System.currentTimeMillis());
            report.put("responseTimeMs", elapsed);
            report.put("status", "OK");

            log.info("AI Threat Report generated in {}ms", elapsed);

        } catch (Exception e) {
            log.error("AI Threat Report failed: {}", e.getMessage());

            // Fallback: generate report without AI
            Map<String, Object> stats = securityEventService.getDashboardStats();
            report.put("analysis", generateFallbackAnalysis(stats));
            report.put("stats", stats);
            report.put("riskScore", stats.get("riskScore"));
            report.put("generatedAt", System.currentTimeMillis());
            report.put("status", "FALLBACK");
            report.put("error", "AI service unavailable. Showing rule-based analysis.");
        }

        return report;
    }

    /**
     * Analyze a specific security event using AI.
     */
    public String analyzeEvent(SecurityEvent event) {
        try {
            String prompt = ADVISOR_SYSTEM_PROMPT + "\n\n"
                    + "Phân tích sự kiện bảo mật sau:\n"
                    + "- Loại: " + event.getEventType() + "\n"
                    + "- Mức độ: " + event.getSeverity() + "\n"
                    + "- Nguồn: " + event.getSource() + "\n"
                    + "- IP: " + event.getSourceIp() + "\n"
                    + "- Mô tả: " + event.getDescription() + "\n"
                    + (event.getRawData() != null ? "- Dữ liệu thô: " + event.getRawData() + "\n" : "")
                    + "\nHãy phân tích ngắn gọn (3-5 dòng): mức độ nguy hiểm, khả năng tấn công, đề xuất xử lý.";

            return chatModel.generate(prompt);
        } catch (Exception e) {
            log.error("Event analysis failed: {}", e.getMessage());
            return "Không thể phân tích tự động. AI Service unavailable.";
        }
    }

    /**
     * Analyze a specific IP address for threat indicators.
     */
    public Map<String, Object> analyzeIP(String ip) {
        Map<String, Object> result = new LinkedHashMap<>();

        try {
            List<SecurityEvent> events = securityEventService.getEventsForIp(ip);
            result.put("ip", ip);
            result.put("totalEvents", events.size());

            if (events.isEmpty()) {
                result.put("analysis", "Không tìm thấy sự kiện bảo mật nào cho IP: " + ip);
                result.put("threatLevel", "SAFE");
                return result;
            }

            // Build event summary for this IP
            StringBuilder sb = new StringBuilder();
            sb.append("Các sự kiện từ IP ").append(ip).append(":\n");
            events.stream().limit(20).forEach(e -> sb.append("  [").append(e.getSeverity()).append("] ")
                    .append(e.getEventType()).append(" - ")
                    .append(e.getDescription()).append(" (")
                    .append(e.getCreatedAt()).append(")\n"));

            String prompt = ADVISOR_SYSTEM_PROMPT + "\n\n"
                    + sb.toString() + "\n"
                    + "Tổng số sự kiện từ IP này: " + events.size() + "\n\n"
                    + "Hãy phân tích IP này:\n"
                    + "1. Mức độ đe dọa (SAFE/LOW/MEDIUM/HIGH/CRITICAL)\n"
                    + "2. Loại tấn công nghi ngờ\n"
                    + "3. Đề xuất xử lý (block, monitor, safe)";

            String analysis = chatModel.generate(prompt);
            result.put("analysis", analysis);
            result.put("threatLevel", determineThreatLevel(events));

        } catch (Exception e) {
            log.error("IP analysis failed: {}", e.getMessage());
            List<SecurityEvent> events = securityEventService.getEventsForIp(ip);
            result.put("analysis", "AI analysis unavailable. Events: " + events.size());
            result.put("threatLevel", determineThreatLevel(events));
        }

        return result;
    }

    /**
     * Determine threat level based on event history (rule-based fallback).
     */
    private String determineThreatLevel(List<SecurityEvent> events) {
        if (events.isEmpty())
            return "SAFE";

        long critical = events.stream().filter(e -> e.getSeverity() == SecurityEvent.Severity.CRITICAL).count();
        long high = events.stream().filter(e -> e.getSeverity() == SecurityEvent.Severity.HIGH).count();

        if (critical > 0)
            return "CRITICAL";
        if (high >= 5)
            return "HIGH";
        if (high >= 1 || events.size() >= 10)
            return "MEDIUM";
        return "LOW";
    }

    /**
     * Rule-based fallback analysis when AI is unavailable.
     */
    private String generateFallbackAnalysis(Map<String, Object> stats) {
        int riskScore = (int) stats.getOrDefault("riskScore", 0);
        long unresolved = (long) stats.getOrDefault("unresolvedCount", 0L);
        long critical = (long) stats.getOrDefault("criticalCount", 0L);

        StringBuilder sb = new StringBuilder();

        if (riskScore == 0 && unresolved == 0) {
            sb.append("🟢 **ĐÁNH GIÁ: AN TOÀN**\n\n");
            sb.append("Không phát hiện mối đe dọa nào. Hệ thống đang hoạt động bình thường.\n");
        } else if (riskScore < 30) {
            sb.append("🟡 **ĐÁNH GIÁ: CẢNH BÁO NHẸ**\n\n");
            sb.append("Phát hiện một số hoạt động bất thường nhưng chưa ở mức nguy hiểm.\n");
            sb.append("- Sự kiện chưa xử lý: ").append(unresolved).append("\n");
            sb.append("- Đề xuất: Giám sát và xem xét các sự kiện.\n");
        } else if (riskScore < 60) {
            sb.append("🟠 **ĐÁNH GIÁ: NGUY HIỂM**\n\n");
            sb.append("Phát hiện hoạt động tấn công đáng kể.\n");
            sb.append("- Risk Score: ").append(riskScore).append("/100\n");
            sb.append("- Sự kiện chưa xử lý: ").append(unresolved).append("\n");
            sb.append("- Đề xuất: Kiểm tra ngay các IP nguồn và cân nhắc block.\n");
        } else {
            sb.append("🔴 **ĐÁNH GIÁ: NGHIÊM TRỌNG**\n\n");
            sb.append("Hệ thống đang bị tấn công ở mức cao!\n");
            sb.append("- Risk Score: ").append(riskScore).append("/100\n");
            sb.append("- Critical events: ").append(critical).append("\n");
            sb.append("- Sự kiện chưa xử lý: ").append(unresolved).append("\n");
            sb.append("- **ĐỀ XUẤT KHẨN CẤP**: Block tất cả IP đáng ngờ, review firewall rules.\n");
        }

        sb.append("\n⚠️ *Phân tích tự động (rule-based). Kết nối Ollama để có phân tích AI chi tiết hơn.*");
        return sb.toString();
    }
}
