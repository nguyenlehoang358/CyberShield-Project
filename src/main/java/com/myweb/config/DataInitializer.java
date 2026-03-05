package com.myweb.config;

import java.util.HashSet;
import java.util.Set;

import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import com.myweb.entity.ERole;
import com.myweb.entity.Role;
import com.myweb.entity.User;
import com.myweb.repository.RoleRepository;
import com.myweb.repository.SolutionRepository;
import com.myweb.repository.UserRepository;
import com.myweb.entity.Solution;

@Component
public class DataInitializer implements CommandLineRunner {

        private final UserRepository userRepository;
        private final RoleRepository roleRepository;
        private final SolutionRepository solutionRepository;
        private final PasswordEncoder passwordEncoder;

        public DataInitializer(UserRepository userRepository, RoleRepository roleRepository,
                        SolutionRepository solutionRepository, PasswordEncoder passwordEncoder) {
                this.userRepository = userRepository;
                this.roleRepository = roleRepository;
                this.solutionRepository = solutionRepository;
                this.passwordEncoder = passwordEncoder;
        }

        @Override
        public void run(String... args) {
                System.out.println("=== DataInitializer: Starting... ===");

                // Build roles first to ensure they exist
                Role adminRole = roleRepository.findByName(ERole.ROLE_ADMIN)
                                .orElseGet(() -> roleRepository.save(new Role(ERole.ROLE_ADMIN)));
                Role userRole = roleRepository.findByName(ERole.ROLE_USER)
                                .orElseGet(() -> roleRepository.save(new Role(ERole.ROLE_USER)));

                System.out.println("=== Roles created/found: ADMIN + USER ===");

                // Migrate existing admin from @myweb.com to @gmail.com
                userRepository.findByEmail("admin@myweb.com").ifPresent(existingAdmin -> {
                        existingAdmin.setEmail("admin@gmail.com");
                        existingAdmin.setPassword(passwordEncoder.encode("admin1"));
                        userRepository.save(existingAdmin);
                        System.out.println("=== ADMIN MIGRATED: admin@myweb.com -> admin@gmail.com / admin1 ===");
                });

                if (userRepository.findByEmail("admin@gmail.com").isEmpty()
                                && !userRepository.existsByUsername("admin")) {
                        User admin = new User();
                        admin.setUsername("admin");
                        admin.setEmail("admin@gmail.com");
                        admin.setPassword(passwordEncoder.encode("admin1"));
                        admin.setAccountNonExpired(true);
                        admin.setAccountNonLocked(true);
                        admin.setCredentialsNonExpired(true);
                        admin.setEnabled(true);

                        Set<Role> roles = new HashSet<>();
                        roles.add(adminRole);
                        roles.add(userRole);
                        admin.setRoles(roles);

                        userRepository.save(admin);
                        System.out.println("=== ADMIN CREATED: admin@gmail.com / admin1 ===");
                } else {
                        System.out.println("=== Admin already exists, skipping creation ===");
                }

                seedSolutions();
        }

        private void seedSolutions() {
                if (solutionRepository.count() == 0) {
                        System.out.println("=== Seeding Default Solutions ===");

                        // Web Development
                        solutionRepository.save(new Solution(null,
                                        "Phát triển Web",
                                        "Web Development",
                                        "Phát triển web hiện đại, responsive với công nghệ mới nhất.",
                                        "Modern, responsive web development with the latest technologies.",
                                        "Zap",
                                        "blue",
                                        1,
                                        true));

                        // AI / Data
                        solutionRepository.save(new Solution(null,
                                        "AI / Dữ liệu",
                                        "AI / Data",
                                        "Giải pháp AI và phân tích dữ liệu giúp doanh nghiệp vượt trội.",
                                        "AI and data analytics solutions for business excellence.",
                                        "Database",
                                        "purple",
                                        2,
                                        true));

                        // Security
                        solutionRepository.save(new Solution(null,
                                        "An ninh mạng",
                                        "Cyber Security",
                                        "Bảo mật thông tin, mã hóa dữ liệu hàng đầu.",
                                        "Top-tier information security and data encryption.",
                                        "Shield",
                                        "pink",
                                        3,
                                        true));

                        // Blockchain
                        solutionRepository.save(new Solution(null,
                                        "Blockchain",
                                        "Blockchain",
                                        "Tư vấn và phát triển ứng dụng Blockchain chuyên nghiệp.",
                                        "Professional blockchain application consulting and development.",
                                        "Cpu",
                                        "coral",
                                        4,
                                        true));

                        // Cloud
                        solutionRepository.save(new Solution(null,
                                        "Cloud Solutions",
                                        "Cloud Solutions",
                                        "Hạ tầng đám mây tối ưu chi phí và hiệu năng.",
                                        "Cost-optimized, high-performance cloud infrastructure.",
                                        "Cloud",
                                        "green",
                                        5,
                                        true));

                        // Consulting
                        solutionRepository.save(new Solution(null,
                                        "Tư vấn",
                                        "Consulting",
                                        "Tư vấn chiến lược chuyển đổi số toàn diện.",
                                        "Comprehensive digital transformation consulting strategy.",
                                        "Check",
                                        "cyan",
                                        6,
                                        true));

                        System.out.println("=== Solutions Seeded ===");
                }
        }
}
