package com.example.usermanagement.service;

import com.example.usermanagement.dto.RetailerRequestDTO;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClientException;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Component
@RequiredArgsConstructor
public class RetailerClientImpl implements RetailerClient {

    private final RestTemplate restTemplate;

    @Value("${retailer.service.url}")
    private String retailerServiceUrl;

    @Override
    public void createRetailerProfile(RetailerRequestDTO retailerRequestDTO) {
        try {
            String url = retailerServiceUrl + "/api/v1/retailers";
            restTemplate.postForEntity(url, retailerRequestDTO, Void.class);
            log.info("Retailer profile forwarded to retailer-service (userId={})", retailerRequestDTO.getUserId());
        } catch (RestClientException ex) {
            log.error("Error sending profile to retailer-service", ex);
            throw ex;
        }
    }
}
