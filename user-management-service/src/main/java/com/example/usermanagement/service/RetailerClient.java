package com.example.usermanagement.service;

import com.example.usermanagement.dto.RetailerRequestDTO;

/**
 * Interface for communicating with the retailer-service.
 */
public interface RetailerClient {
    void createRetailerProfile(RetailerRequestDTO retailerRequestDTO);
}
