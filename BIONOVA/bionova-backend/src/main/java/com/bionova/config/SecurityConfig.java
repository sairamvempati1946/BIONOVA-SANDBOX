package com.bionova.config;

import com.bionova.security.JwtAuthFilter;
import com.bionova.security.RbacGuardFilter;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.http.HttpMethod;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.stream.Collectors;

@Configuration
public class SecurityConfig {

    @Value("${app.cors.allowed-origins:http://localhost:5173,https://bionova-sandbox.vercel.app,https://*.vercel.app}")
    private String allowedOrigins;

    private final JwtAuthFilter jwtAuthFilter;
    private final RbacGuardFilter rbacGuardFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter, RbacGuardFilter rbacGuardFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
        this.rbacGuardFilter = rbacGuardFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {

        http
            .cors(cors -> cors.configurationSource(corsConfigurationSource()))
            .csrf(csrf -> csrf.disable())
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Explicitly allow all preflight OPTIONS requests
                .requestMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                // Public endpoints – no token needed
                .requestMatchers(
                    "/api/auth/**",
                    "/api/external-tasks/**",
                    "/api/storage/view",
                    "/api/storage/download",
                    // Swagger UI
                    "/swagger-ui.html",
                    "/swagger-ui/**",
                    "/api-docs",
                    "/api-docs/**",
                    "/v3/api-docs",
                    "/v3/api-docs/**"
                ).permitAll()
                // Everything else requires a valid JWT
                .anyRequest().authenticated()
            )

            .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class)
            .addFilterAfter(rbacGuardFilter, JwtAuthFilter.class);

        return http.build();
    }

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {
        CorsConfiguration configuration = new CorsConfiguration();

        List<String> origins = new ArrayList<>();
        if (allowedOrigins != null && !allowedOrigins.isBlank()) {
            origins.addAll(
                Arrays.stream(allowedOrigins.split(","))
                    .map(String::trim)
                    .filter(s -> !s.isEmpty())
                    .collect(Collectors.toList())
            );
        }

        // Always guarantee essential development & production domains are allowed
        List<String> fallbackPatterns = List.of(
            "https://bionova-sandbox.vercel.app",
            "https://bionova-sable.vercel.app",
            "https://*.vercel.app",
            "http://localhost:[*]",
            "http://127.0.0.1:[*]"
        );
        for (String pattern : fallbackPatterns) {
            if (!origins.contains(pattern)) {
                origins.add(pattern);
            }
        }

        configuration.setAllowedOriginPatterns(origins);
        configuration.setAllowedMethods(Arrays.asList("GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS", "HEAD"));
        configuration.setAllowedHeaders(List.of("*"));
        configuration.setExposedHeaders(List.of("Authorization", "Content-Type", "Accept", "Content-Disposition"));
        configuration.setAllowCredentials(true);
        configuration.setMaxAge(3600L);

        UrlBasedCorsConfigurationSource source = new UrlBasedCorsConfigurationSource();
        source.registerCorsConfiguration("/**", configuration);
        return source;
    }
}