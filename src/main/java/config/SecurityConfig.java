package com.inventory.inventory.config;

import com.inventory.inventory.security.JwtFilter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
public class SecurityConfig {

    @Autowired
    private JwtFilter jwtFilter;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {

        http
                // Disable CSRF
                .csrf(csrf -> csrf.disable())

                // Stateless session (JWT)
                .sessionManagement(session ->
                        session.sessionCreationPolicy(SessionCreationPolicy.STATELESS)
                )

                // Authorization rules
                .authorizeHttpRequests(auth -> auth

                        // PUBLIC
                        .requestMatchers("/auth/**").permitAll()

                        .requestMatchers(
                                "/v3/api-docs/**",
                                "/swagger-ui/**",
                                "/swagger-ui.html"
                        ).permitAll()

                        // ✅ ADMIN ONLY
                        .requestMatchers(HttpMethod.POST, "/products/add").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.PUT, "/products/update/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers(HttpMethod.DELETE, "/products/delete/**").hasAuthority("ROLE_ADMIN")
                        .requestMatchers("/categories/**").hasAuthority("ROLE_ADMIN")

                        // ✅ USER + ADMIN (READ PRODUCTS)
                        .requestMatchers(HttpMethod.GET, "/products/**")
                        .hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")

                        // ✅ ORDERS (USER + ADMIN)
                        .requestMatchers("/orders/**")
                        .hasAnyAuthority("ROLE_USER", "ROLE_ADMIN")

                        // EVERYTHING ELSE
                        .anyRequest().authenticated()
                )

                // Add JWT filter
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}