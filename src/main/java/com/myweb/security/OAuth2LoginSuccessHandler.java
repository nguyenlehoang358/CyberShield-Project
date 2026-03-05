package com.myweb.security;

import java.io.IOException;
import java.util.Optional;
import java.util.stream.Collectors;

import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.AuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import com.myweb.entity.User;
import com.myweb.repository.UserRepository;

import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class OAuth2LoginSuccessHandler implements AuthenticationSuccessHandler {

    private final JwtUtil jwtUtil;
    private final UserRepository userRepository;

    public OAuth2LoginSuccessHandler(JwtUtil jwtUtil, UserRepository userRepository) {
        this.jwtUtil = jwtUtil;
        this.userRepository = userRepository;
    }

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException, ServletException {

        OAuth2User oauth2User = (OAuth2User) authentication.getPrincipal();
        String email = oauth2User.getAttribute("email");

        if (email == null || email.isEmpty()) {
            if (oauth2User.getAttribute("login") != null) {
                // Xử lý cho GitHub ẩn email
                email = oauth2User.getAttribute("login") + "@github.com";
            } else if (oauth2User.getAttribute("id") != null) {
                // Xử lý cho Facebook không có email (dùng ID của Facebook tạo email giả)
                email = oauth2User.getAttribute("id") + "@facebook.com";
            } else {
                // Đường lùi cuối cùng
                email = oauth2User.getName() + "@social.com";
            }
        }

        Optional<User> userOptional = userRepository.findByEmail(email);

        if (userOptional.isPresent()) {
            User user = userOptional.get();

            // Xử lý Role an toàn chống crash (500)
            String rolesStr = "ROLE_USER"; // Mặc định nếu không có quyền
            try {
                if (user.getRoles() != null && !user.getRoles().isEmpty()) {
                    rolesStr = user.getRoles().stream()
                            .filter(role -> role != null && role.getName() != null)
                            .map(role -> role.getName().name())
                            .collect(Collectors.joining(","));
                }
            } catch (Exception e) {
                System.err.println("Lỗi parse role trong OAuth2: " + e.getMessage());
            }

            String token = jwtUtil.generateToken(
                    user.getUsername(),
                    user.getEmail(),
                    rolesStr);

            // Create HttpOnly Cookie for JWT
            org.springframework.http.ResponseCookie springCookie = org.springframework.http.ResponseCookie
                    .from("jwt", token)
                    .httpOnly(true)
                    .secure(true)
                    .path("/")
                    .sameSite("None")
                    .maxAge(86400) // 1 day
                    .build();
            response.addHeader(org.springframework.http.HttpHeaders.SET_COOKIE, springCookie.toString());

            // Cleanly redirect to localhost:5173/dashboard (NO token in URL)
            response.sendRedirect("http://localhost:5173/dashboard");

        } else {
            // Nếu email chưa có trong Database, chuyển về trang báo lỗi
            response.sendRedirect("http://localhost:5173/login?error=oauth_user_not_found");
        }
    }
}