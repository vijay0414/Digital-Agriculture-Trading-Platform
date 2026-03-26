package com.example.usermanagement.service;

import com.example.usermanagement.dto.*;

import java.util.List;

public interface UserService {

    UserResponseDTO createUser(UserRequestDTO request);

    UserResponseDTO registerFarmer(UserRequestDTO request);

    UserResponseDTO registerRetailer(UserRequestDTO request);

    AuthResponseDTO login(LoginRequestDTO request);

    AuthResponseDTO refreshToken(RefreshRequestDTO request);

    List<UserResponseDTO> getAllUsers();

    List<UserResponseDTO> getFarmers();

    List<UserResponseDTO> getRetailers();

    UserResponseDTO getUserById(Long id);

    void deleteUser(Long id);
}
