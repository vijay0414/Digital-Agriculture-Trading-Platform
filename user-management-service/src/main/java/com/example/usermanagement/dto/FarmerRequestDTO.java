package com.example.usermanagement.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

/**
 * Local copy of the DTO used when sending profile data to farmer-service.
 * The original com.agri version is not available at runtime in this module,
 * so we replicate the structure here.
 */
@Data
public class FarmerRequestDTO {
    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Farm name is required")
    private String farmName;

    @NotBlank(message = "Address is required")
    private String address;

    @NotBlank(message = "City is required")
    private String city;

    @NotBlank(message = "State is required")
    private String state;

    @NotBlank(message = "Zip code is required")
    private String zip;

    private Double locationLat;
    private Double locationLng;
}