package com.inventory.inventory.service;

import com.inventory.inventory.entity.User;
import com.inventory.inventory.repository.UserRepository;
import com.inventory.inventory.security.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    @Autowired
    UserRepository repo;

    @Autowired
    JwtUtil jwtUtil;

    BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

    // REGISTER
    public String register(User user) {

        // 🔐 Encrypt password
        user.setPassword(encoder.encode(user.getPassword()));

        // Safely add ROLE_ prefix
        String role = user.getRole();
        if (role != null) {
            if (role.startsWith("ROLE_ROLE_")) {
                user.setRole(role.substring(5)); // Fix double prefix if sent from old UI
            } else if (!role.startsWith("ROLE_")) {
                user.setRole("ROLE_" + role);
            }
        } else {
            user.setRole("ROLE_USER"); // default fallback
        }

        repo.save(user);

        return "User Registered Successfully";
    }

    // LOGIN (JWT)
    public String login(String email, String password) {

        User user = repo.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (!encoder.matches(password, user.getPassword())) {
            throw new RuntimeException("Invalid password");
        }

        return jwtUtil.generateToken(email, user.getRole());
    }
}