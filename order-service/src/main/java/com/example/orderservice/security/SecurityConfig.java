package com.example.orderservice.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private final JwtAuthFilter jwtAuthFilter;

    public SecurityConfig(JwtAuthFilter jwtAuthFilter) {
        this.jwtAuthFilter = jwtAuthFilter;
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable())
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authorizeHttpRequests(auth -> auth
                        // Only RETAILER can place orders
                        .requestMatchers(HttpMethod.POST, "/api/v1/retailers/me/orders").hasRole("RETAILER")
                        // Only RETAILER can view their own orders
                        .requestMatchers(HttpMethod.GET, "/api/v1/retailers/me/orders/retailer").hasRole("RETAILER")
                        // Only FARMER can view orders placed to them
                        .requestMatchers(HttpMethod.GET, "/api/v1/retailers/me/orders/farmer").hasRole("FARMER")
                        // FARMER can confirm or cancel orders
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/retailers/me/orders/*/confirm").hasRole("FARMER")
                        .requestMatchers(HttpMethod.PATCH, "/api/v1/retailers/me/orders/*/cancel").hasAnyRole("FARMER", "RETAILER")
                        // Actuator endpoints open
                        .requestMatchers("/actuator/**").permitAll()
                        // All other requests require authentication
                        .anyRequest().authenticated()
                )
                .addFilterBefore(jwtAuthFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
