package com.example.usermanagement.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.tags.Tag;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Digital Agriculture Trading Platform API")
                        .version("1.0.0")
                        .description("API Documentation for Farmers and Retailers Marketplace"))
                .addSecurityItem(new SecurityRequirement().addList("Bearer Authentication"))
                .components(new Components()
                        .addSecuritySchemes("Bearer Authentication", createSecurityScheme()))
                .tags(List.of(
                        new Tag().name("Auth").description("Operations related to Authentication and User Management"),
                        new Tag().name("Farmers").description("Operations related to Farmers"),
                        new Tag().name("Retailers").description("Operations related to Retailers"),
                        new Tag().name("Products").description("Operations related to Products"),
                        new Tag().name("Orders").description("Operations related to Orders"),
                        new Tag().name("Notifications").description("Operations related to Notifications")));
    }

    private SecurityScheme createSecurityScheme() {
        return new SecurityScheme()
                .name("Bearer Authentication")
                .type(SecurityScheme.Type.HTTP)
                .scheme("bearer")
                .bearerFormat("JWT");
    }
}
