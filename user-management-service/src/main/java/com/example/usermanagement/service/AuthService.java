package com.example.usermanagement.service;

import com.example.usermanagement.dto.AuthRequestDTO;
import com.example.usermanagement.dto.AuthResponseDTO;
import com.example.usermanagement.dto.UserRequestDTO;
import com.example.usermanagement.dto.UserResponseDTO;

/**
 * Authentication Service Interface
 * Handles user registration and login operations
 */
public interface AuthService {

    /**
     * Register a new user
     */
    UserResponseDTO register(UserRequestDTO userRequestDTO);

    /**
     * Login user (returns basic response, no token)
     */
    AuthResponseDTO login(AuthRequestDTO authRequestDTO);
}
