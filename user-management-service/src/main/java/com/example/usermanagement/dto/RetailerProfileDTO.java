package com.example.usermanagement.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Profile DTO specific to retailers.  This is separate from the
 * FarmerProfileDTO/profileDTO simply to meet the user's request.
 * Fields mirror those expected by the system.
 */
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RetailerProfileDTO {

    @NotBlank(message = "Business name is required")
    @Size(min = 2, max = 100, message = "Name must be between 2 and 100 characters")
    private String businessName;

    @NotBlank(message = "Address is required")
    @Size(min = 5, max = 200, message = "Address must be between 5 and 200 characters")
    private String address;

    @NotBlank(message = "City is required")
    @Size(min = 2, max = 50, message = "City must be between 2 and 50 characters")
    private String city;

    @NotBlank(message = "State is required")
    @Size(min = 2, max = 50, message = "State must be between 2 and 50 characters")
    private String state;

    @NotBlank(message = "Zip code is required")
    @Size(min = 5, max = 10, message = "Zip code must be between 5 and 10 characters")
    private String zip;
}