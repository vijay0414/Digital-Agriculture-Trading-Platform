package com.example.usermanagement.service;

import com.example.usermanagement.dto.FarmerRequestDTO;
import com.example.usermanagement.dto.RetailerRequestDTO;
import com.example.usermanagement.dto.*;
import com.example.usermanagement.exception.InvalidCredentialsException;
import com.example.usermanagement.model.Role;
import com.example.usermanagement.model.User;
import com.example.usermanagement.repository.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final UserService userService;
    private final UserRepository userRepository;
    private final ObjectMapper objectMapper;
    private final FarmerClient farmerClient;
    private final RetailerClient retailerClient;
    private final org.springframework.security.authentication.AuthenticationManager authenticationManager;
    private final com.example.usermanagement.security.JwtTokenProvider tokenProvider;

    /**
     * ==============================
     * REGISTER USER
     * ==============================
     */
    @Override
    public UserResponseDTO register(UserRequestDTO request) {

        log.info("Register request received for email: {}", request.getEmail());

        // ✅ Validate role
        if (request.getRole() == null) {
            throw new RuntimeException("Role is required");
        }

        // 1️⃣ Create USER (this method is @Transactional, so it commits here)
        UserResponseDTO createdUser = userService.createUser(request);
        Long userId = createdUser.getId();

        // ✅ Check profile exists according to role
        if (request.getProfile() == null) {
            throw new RuntimeException("Profile data is required");
        }

        // 2️⃣ Create PROFILE based on ROLE (happens OUTSIDE user-management
        // transaction)
        try {
            switch (request.getRole()) {

                case FARMER -> {
                    FarmerRequestDTO farmerProfile = objectMapper.convertValue(
                            request.getProfile(),
                            FarmerRequestDTO.class);

                    // Ensure farmName is set even if sent as businessName
                    if (farmerProfile.getFarmName() == null) {
                        farmerProfile.setFarmName(request.getProfile().getBusinessName());
                    }

                    farmerProfile.setUserId(userId);
                    farmerClient.createFarmerProfile(farmerProfile);
                    log.info("Farmer profile created for userId={}", userId);
                }

                case RETAILER -> {
                    RetailerRequestDTO retailerProfile = objectMapper.convertValue(
                            request.getProfile(),
                            RetailerRequestDTO.class);

                    // Ensure businessName is set even if sent as farmName
                    if (retailerProfile.getBusinessName() == null) {
                        retailerProfile.setBusinessName(request.getProfile().getFarmName());
                    }

                    retailerProfile.setUserId(userId);
                    retailerClient.createRetailerProfile(retailerProfile);
                    log.info("Retailer profile created for userId={}", userId);
                }

                default -> throw new RuntimeException("Invalid role provided");
            }

        } catch (Exception ex) {
            log.error("Profile creation failed", ex);
            throw new RuntimeException("Registration failed while creating profile");
        }

        createdUser.setMessage("Registered successfully");

        log.info("User registration completed: {}", request.getEmail());

        return createdUser;
    }

    /**
     * ==============================
     * LOGIN USER (WITH JWT)
     * ==============================
     */
    @Override
    @Transactional(readOnly = true)
    public AuthResponseDTO login(AuthRequestDTO authRequestDTO) {

        log.info("Login attempt for email: {}", authRequestDTO.getEmail());

        org.springframework.security.core.Authentication authentication;
        try {
            authentication = authenticationManager.authenticate(
                new org.springframework.security.authentication.UsernamePasswordAuthenticationToken(
                    authRequestDTO.getEmail(),
                    authRequestDTO.getPassword()));
        } catch (org.springframework.security.core.AuthenticationException ex) {
            log.warn("Authentication failed for email {}: {}", authRequestDTO.getEmail(), ex.getMessage());
            throw new InvalidCredentialsException("Invalid email or password", ex);
        }

        org.springframework.security.core.context.SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = tokenProvider.generateToken(authentication);

        User user = userRepository.findByEmail(authRequestDTO.getEmail())
                .orElseThrow(() -> new InvalidCredentialsException("Invalid email or password"));

        long expiresMs = tokenProvider.getJwtExpirationInMs();
        long expiresSeconds = expiresMs / 1000;
        return AuthResponseDTO.builder()
                .userId(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .accessToken(jwt)
                .tokenType("Bearer")
                .expiresIn(expiresSeconds) // in seconds
                .message("Login successful")
                .build();
    }
}