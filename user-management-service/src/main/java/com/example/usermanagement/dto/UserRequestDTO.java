package com.example.usermanagement.dto;

import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import com.example.usermanagement.model.Role;
import com.example.usermanagement.dto.ProfileDTO;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * User Registration Request DTO
 * Used for /auth/register endpoint
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRequestDTO {

    @NotBlank(message = "Full name is required")
    @Size(min = 2, max = 100, message = "Full name must be between 2 and 100 characters")
    private String fullName;

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @Pattern(regexp = "^[0-9]{10}$", message = "Phone must be 10 digits")
    private String phone;

    @NotBlank(message = "Password is required")
    @Size(min = 8, max = 20, message = "Password must be between 8 and 20 characters")
    @com.example.usermanagement.validation.PasswordStrength
    private String password;

    @NotNull(message = "Role is required")
    private Role role;

    @Valid
    private ProfileDTO profile;

    // future: add role-specific profile fields if needed (e.g. RetailerProfileDTO)

}
