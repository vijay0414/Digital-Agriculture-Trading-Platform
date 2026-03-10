package com.example.usermanagement;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * User Management Service Application
 * 
 * This service handles all user CRUD operations and authentication.
 * Fetches DB credentials from Config Server at startup.
 * Registers with Eureka for service discovery.
 * 
 * Service Port: http://localhost:8081
 */
@SpringBootApplication
@EnableDiscoveryClient
public class UserManagementApplication {

    public static void main(String[] args) {
        SpringApplication.run(UserManagementApplication.class, args);
    }
}
