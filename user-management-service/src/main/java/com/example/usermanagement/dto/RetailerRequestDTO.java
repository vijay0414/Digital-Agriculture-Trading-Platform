package com.example.usermanagement.dto;

import lombok.Data;
import jakarta.validation.constraints.*;

/**
 * DTO used when the user-management-service needs to
 * send profile information to the retailer-service.
 * This mirrors the fields of the original com.agri
 * dto, but resides locally so that the module doesn't
 * need to depend on the other service at runtime.
 */
@Data
public class RetailerRequestDTO {
    @NotNull(message = "User ID is required")
    private Long userId;

    @NotBlank(message = "Business name is required")
    private String businessName;

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