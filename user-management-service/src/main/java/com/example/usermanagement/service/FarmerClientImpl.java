package com.example.usermanagement.service;

import com.example.usermanagement.dto.FarmerRequestDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
@RequiredArgsConstructor
public class FarmerClientImpl implements FarmerClient {

    private final RestTemplate restTemplate;

    @Value("${farmer.service.url}")
    private String farmerServiceUrl;

    @Override
    public void createFarmerProfile(FarmerRequestDTO farmerRequestDTO) {
        try {
            String url = farmerServiceUrl + "/api/v1/farmers";
            restTemplate.postForEntity(url, farmerRequestDTO, Void.class);
            log.info("Farmer profile forwarded to farmer-service (userId={})", farmerRequestDTO.getUserId());
        } catch (RestClientException ex) {
            log.error("Error sending profile to farmer-service", ex);
            throw ex;
        }
    }
} 
