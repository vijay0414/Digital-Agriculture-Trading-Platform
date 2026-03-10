package com.example.usermanagement.service;

import com.example.usermanagement.dto.FarmerRequestDTO;

/**
 * Interface for communicating with the farmer-service.
 * A real implementation (e.g. Feign client) should be provided in
 * a production configuration. This stub is used during local testing.
 */
public interface FarmerClient {
    void createFarmerProfile(FarmerRequestDTO farmerRequestDTO);
}
