package com.example.usermanagement.dto;

import com.example.usermanagement.model.Role;
import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * User Response DTO
 * Used for user profile responses and registration success
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonInclude(JsonInclude.Include.NON_NULL)
public class UserResponseDTO {

    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private Role role;
    private Boolean isActive;
    private ProfileDTO profile;  // user profile (farm or business details)
    private String message;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
