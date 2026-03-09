package com.example.apigateway.config;

import org.springframework.cloud.gateway.route.RouteLocator;
import org.springframework.cloud.gateway.route.builder.RouteLocatorBuilder;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;

/**
 * Basic route configuration for API Gateway with no security
 */
@Configuration
public class RouteConfig {

    @Bean
    public RouteLocator routeLocator(RouteLocatorBuilder builder) {
        return builder.routes()

                // public auth endpoints forwarded to user-management-service
                .route("auth", r -> r
                        .path("/api/v1/auth/**")
                        .uri("lb://user-management-service")
                )

                // user management
                .route("users", r -> r
                        .path("/api/v1/users/**")
                        .uri("lb://user-management-service")
                )

                // farmer
                .route("farmers", r -> r
                        .path("/api/v1/farmers/**")
                        .uri("lb://farmer-service")
                )

                // retailers
                .route("retailers", r -> r
                        .path("/api/v1/retailers/**")
                        .uri("lb://retailer-service")
                )

                // products
                .route("products", r -> r
                        .path("/api/v1/products/**")
                        .uri("lb://product-service")
                )

                .build();
    }
}