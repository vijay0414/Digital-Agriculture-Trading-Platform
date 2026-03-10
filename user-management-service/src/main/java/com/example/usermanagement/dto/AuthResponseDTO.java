package com.example.usermanagement.dto;

import com.example.usermanagement.model.Role;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Authentication Response DTO
 * Returned after successful login with user info (token field small/unused)
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuthResponseDTO {

    private Long userId;
    private String fullName;
    private String email;
    private String phone;
    private Role role;
    private String accessToken;
    @Builder.Default
    private String tokenType = "Bearer";
    @JsonProperty("expiresIn")
    private Long expiresIn;
    private String message;
}
