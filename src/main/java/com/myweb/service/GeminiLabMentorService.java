package com.myweb.service;

import com.myweb.dto.LabChatRequest;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.Map;

import org.springframework.cache.annotation.Cacheable;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.core.type.TypeReference;

@Service
public class GeminiLabMentorService {

    @Value("${app.ai.gemini.api-key}")
    private String apiKey;

    private static final String GEMINI_URL = "https://generativelanguage.googleapis.com/v1/models/gemini-pro:generateContent?key=";

    private final RestTemplate restTemplate;

    public GeminiLabMentorService() {
        this.restTemplate = new RestTemplate();
    }

    public Map<String, Object> generateMentorResponse(LabChatRequest request) {
        if (apiKey == null || apiKey.isEmpty() || apiKey.contains("your_gemini_api_key_here")) {
            return Map.of("reply", "❌ Lỗi: Chưa cấu hình GEMINI_API_KEY. Vui lòng kiểm tra lại file .env!", "action", "NONE", "payload", "");
        }

        String systemPrompt = """
                Bạn là Chuyên gia An ninh mạng cao cấp của CyberShield — hệ thống SOC thông minh.
                Bạn đóng vai trò là "Lab Mentor" để hướng dẫn học viên thực hành bài thao tác bảo mật.
                
                Nhiệm vụ TUYỆT ĐỐI của bạn:
                1. HƯỚNG DẪN học viên TỰ TÌM RA lỗ hổng, KHÔNG BAO GIỜ đưa câu trả lời/đáp án trực tiếp trừ khi họ yêu cầu bạn hỗ trợ điền form (Auto-fill).
                2. Cung cấp hint (gợi ý) từ từ, từ dễ đến khó tùy theo payload họ đang thử. Tỏa ra sắc bén như một Pentester chuyên nghiệp.
                3. ĐỊNH DẠNG PHẢN HỒI: Bạn PHẢI trả về một JSON object DUY NHẤT với cấu trúc sau:
                   {
                     "reply": "Nội dung giải thích/gợi ý cho user bằng Markdown (KHÔNG chứa bất kỳ JSON nào trong field này)",
                     "action": "FILL_FORM" hoặc "NONE",
                     "payload": "chuỗi cần điền vào input"
                   }
                4. Nếu người dùng yêu cầu "giúp tôi điền", "điền giúp", hãy chọn action là "FILL_FORM".
                5. TUYỆT ĐỐI KHÔNG giải thích lề mề ngoài JSON. Chỉ trả về JSON nguyên bản. KHÔNG dùng ```json.
                
                Ngữ cảnh bài Lab hiện tại (Dữ liệu của học viên đã thao tác):
                %s
                """.formatted(request.labContext() != null && !request.labContext().isEmpty() ? request.labContext() : "Chưa có ngữ cảnh cụ thể.");

        String fullMessage = systemPrompt + "\n\nCâu hỏi/Hành động của học viên:\n" + request.message();

        // Xây dựng payload gửi đến Google Gemini
        Map<String, Object> requestBody = Map.of(
            "contents", List.of(
                Map.of("parts", List.of(
                    Map.of("text", fullMessage)
                ))
            ),
            "generationConfig", Map.of(
                "temperature", 0.7,
                "maxOutputTokens", 1024
            )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> result = restTemplate.postForObject(GEMINI_URL + apiKey, entity, Map.class);
            
            // Parse response body từ Google Gemini JSON
            if (result != null && result.containsKey("candidates")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) result.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    if (content != null && content.containsKey("parts")) {
                        @SuppressWarnings("unchecked")
                        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            String rawResponse = (String) parts.get(0).get("text");
                            try {
                                // Mạnh mẽ hơn trong việc tìm JSON trong chuỗi
                                int firstBrace = rawResponse.indexOf("{");
                                int lastBrace = rawResponse.lastIndexOf("}");
                                if (firstBrace >= 0 && lastBrace > firstBrace) {
                                    rawResponse = rawResponse.substring(firstBrace, lastBrace + 1);
                                }
                                ObjectMapper mapper = new ObjectMapper();
                                return mapper.readValue(rawResponse, new TypeReference<Map<String, Object>>(){});
                            } catch (Exception e) {
                                return Map.of(
                                    "reply", rawResponse,
                                    "action", "NONE",
                                    "payload", ""
                                );
                            }
                        }
                    }
                }
            }
            return Map.of("reply", "🤖 CyberShield Mentor: Hiện tại tôi không thể phân tích yêu cầu này.", "action", "NONE", "payload", "");
        } catch (org.springframework.web.client.HttpClientErrorException.TooManyRequests e) {
            return Map.of("reply", "⏳ Hệ thống Mentor đang quá tải (Rate Limit). Vui lòng thử lại sau vài giây.", "action", "NONE", "payload", "");
        } catch (org.springframework.web.client.RestClientException e) {
            System.err.println("Gemini API Error: " + e.getMessage());
            return Map.of("reply", "🤖 CyberShield Mentor: Mất kết nối đến Google Gemini. Vui lòng kiểm tra lại cấu hình API.", "action", "NONE", "payload", "");
        }
    }

    /**
     * Cache lại kết quả theo loại Lab để tránh gọi AI nhiều lần.
     * Cần cài đặt spring-boot-starter-cache (chạy Redis hoặc in-memory).
     */
    @Cacheable(value = "labSuggestions", key = "#labType + '_' + (#userInput != null ? #userInput : '')")
    public List<String> generateAutoSuggestPayloads(String labType, String userInput) {
        if (apiKey == null || apiKey.isEmpty() || apiKey.contains("your_gemini_api_key_here")) {
            return fallbackPayloads(labType);
        }

        String systemPrompt = """
                Bạn là AI chuyên tạo payload an ninh mạng nâng cao để test các kịch bản đánh giá bảo mật.
                Dựa trên loại bài Lab: '%s' và những gì người dùng đang nhập: '%s'.
                Hãy sinh ra ĐÚNG 3 đoạn payload/chuỗi đầu vào NÂNG CAO và PHÙ HỢP nhất.
                YÊU CẦU BẮT BUỘC:
                1. Trả về DUY NHẤT một mảng JSON array chứa 3 chuỗi. 
                2. KHÔNG giải thích, KHÔNG dùng markdown wrap, KHÔNG có bất kỳ ký tự nào ngoài mảng JSON.
                """.formatted(labType, userInput != null ? userInput : "Trống");

        Map<String, Object> requestBody = Map.of(
            "contents", List.of(Map.of("parts", List.of(Map.of("text", systemPrompt)))),
            "generationConfig", Map.of(
                "temperature", 0.3,
                "maxOutputTokens", 200
            )
        );

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> entity = new HttpEntity<>(requestBody, headers);

        try {
            @SuppressWarnings("unchecked")
            Map<String, Object> result = restTemplate.postForObject(GEMINI_URL + apiKey, entity, Map.class);
            
            if (result != null && result.containsKey("candidates")) {
                @SuppressWarnings("unchecked")
                List<Map<String, Object>> candidates = (List<Map<String, Object>>) result.get("candidates");
                if (candidates != null && !candidates.isEmpty()) {
                    @SuppressWarnings("unchecked")
                    Map<String, Object> content = (Map<String, Object>) candidates.get(0).get("content");
                    if (content != null && content.containsKey("parts")) {
                        @SuppressWarnings("unchecked")
                        List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
                        if (parts != null && !parts.isEmpty()) {
                            String rawJson = (String) parts.get(0).get("text");
                            // Dọn dẹp phòng trường hợp AI vẫn nhét ```json vào
                            rawJson = rawJson.replaceAll("(?s)```json(.*?)```", "$1")
                                             .replaceAll("(?s)```(.*?)```", "$1").trim();
                            ObjectMapper mapper = new ObjectMapper();
                            return mapper.readValue(rawJson, new TypeReference<List<String>>(){});
                        }
                    }
                }
            }
            return fallbackPayloads(labType);
        } catch (Exception e) {
            System.err.println("Gemini Auto-Suggest API Error: " + e.getMessage());
            return fallbackPayloads(labType);
        }
    }

    private List<String> fallbackPayloads(String labType) {
        if ("sqli".equalsIgnoreCase(labType)) {
            return List.of("' OR 1=1 --", "' OR '1'='1", "admin' --");
        } else if ("base64".equalsIgnoreCase(labType)) {
            return List.of("YWRtaW4=", "dGVzdHBhc3N3b3Jk", "c2VjcmV0");
        } else if ("xss".equalsIgnoreCase(labType)) {
            return List.of("<script>alert(1)</script>", "<img src=x onerror=alert(1)>", "\"><svg/onload=alert(1)>");
        } else if ("bruteforce".equalsIgnoreCase(labType)) {
            return List.of("admin", "password123", "dragon");
        } else if ("jwt".equalsIgnoreCase(labType)) {
            return List.of("eyJhbGciOiJub25lIn0", "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9", "eyJyb2xlIjoiYWRtaW4ifQ==");
        } else if ("hashing".equalsIgnoreCase(labType)) {
            return List.of("admin", "pass", "123456");
        } else if ("encryption".equalsIgnoreCase(labType)) {
            return List.of("SecretMessage123", "Key123", "admin");
        } else if ("firewall".equalsIgnoreCase(labType)) {
            return List.of("192.168.1.1", "22", "DROP");
        }
        return List.of("test_1", "test_2", "payload_3");
    }
}
