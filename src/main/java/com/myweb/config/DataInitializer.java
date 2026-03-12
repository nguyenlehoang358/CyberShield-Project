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
import com.myweb.repository.UserRepository;

@Component
public class DataInitializer implements CommandLineRunner {

        private final UserRepository userRepository;
        private final RoleRepository roleRepository;
        private final PasswordEncoder passwordEncoder;

        public DataInitializer(UserRepository userRepository, RoleRepository roleRepository,
                        PasswordEncoder passwordEncoder) {
                this.userRepository = userRepository;
                this.roleRepository = roleRepository;
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
                // Delegated to SolutionSeeder
        }
}
