package com.example.usermanagement.service;

import com.example.usermanagement.dto.*;
import com.example.usermanagement.entity.User;
import com.example.usermanagement.entity.FarmerProfile;
import com.example.usermanagement.entity.RetailerProfile;
import com.example.usermanagement.entity.RefreshToken;
import com.example.usermanagement.repository.UserRepository;
import com.example.usermanagement.repository.FarmerProfileRepository;
import com.example.usermanagement.repository.RetailerProfileRepository;
import com.example.usermanagement.repository.RefreshTokenRepository;
import com.example.usermanagement.security.JwtUtil;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final FarmerProfileRepository farmerProfileRepository;
    private final RetailerProfileRepository retailerProfileRepository;
    private final RefreshTokenRepository refreshTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;

    public UserServiceImpl(UserRepository userRepository,
                           FarmerProfileRepository farmerProfileRepository,
                           RetailerProfileRepository retailerProfileRepository,
                           RefreshTokenRepository refreshTokenRepository,
                           PasswordEncoder passwordEncoder,
                           JwtUtil jwtUtil) {
        this.userRepository = userRepository;
        this.farmerProfileRepository = farmerProfileRepository;
        this.retailerProfileRepository = retailerProfileRepository;
        this.refreshTokenRepository = refreshTokenRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtUtil = jwtUtil;
    }

    @Override
    public UserResponseDTO createUser(UserRequestDTO request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole(request.getRole());

        User savedUser = userRepository.save(user);
        return new UserResponseDTO(savedUser);
    }

    @Override
    public UserResponseDTO registerFarmer(UserRequestDTO request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole("FARMER");

        User savedUser = userRepository.save(user);

        FarmerProfile profile = new FarmerProfile();
        profile.setUserId(savedUser.getId());
        profile.setFarmName(request.getFarmName());
        profile.setAddress(request.getAddress());
        profile.setCity(request.getCity());
        profile.setState(request.getState());
        profile.setZip(request.getZip());
        profile.setVerificationStatus("PENDING");

        farmerProfileRepository.save(profile);

        return new UserResponseDTO(savedUser);
    }

    @Override
    public UserResponseDTO registerRetailer(UserRequestDTO request) {
        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setPhone(request.getPhone());
        user.setPasswordHash(passwordEncoder.encode(request.getPassword()));
        user.setRole("RETAILER");

        User savedUser = userRepository.save(user);

        RetailerProfile profile = new RetailerProfile();
        profile.setUserId(savedUser.getId());
        profile.setBusinessName(request.getBusinessName());
        profile.setAddress(request.getAddress());
        profile.setCity(request.getCity());
        profile.setState(request.getState());
        profile.setZip(request.getZip());

        retailerProfileRepository.save(profile);

        return new UserResponseDTO(savedUser);
    }

    @Override
    @Transactional
    public AuthResponseDTO login(LoginRequestDTO request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));

        if (!passwordEncoder.matches(request.getPassword(), user.getPasswordHash())) {
            throw new RuntimeException("Invalid email or password");
        }

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new RuntimeException("Account is deactivated");
        }

        String accessToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String refreshTokenStr = jwtUtil.generateRefreshToken(user.getId(), user.getEmail());

        // Revoke old refresh tokens and save new one
        refreshTokenRepository.revokeAllByUserId(user.getId());

        RefreshToken refreshToken = new RefreshToken();
        refreshToken.setToken(refreshTokenStr);
        refreshToken.setUserId(user.getId());
        refreshToken.setExpiryDate(Instant.now().plus(7, ChronoUnit.DAYS));
        refreshTokenRepository.save(refreshToken);

        return new AuthResponseDTO(accessToken, refreshTokenStr, new UserResponseDTO(user));
    }

    @Override
    @Transactional
    public AuthResponseDTO refreshToken(RefreshRequestDTO request) {
        String token = request.getRefreshToken();

        if (!jwtUtil.isTokenValid(token) || !jwtUtil.isRefreshToken(token)) {
            throw new RuntimeException("Invalid refresh token");
        }

        RefreshToken storedToken = refreshTokenRepository.findByTokenAndRevokedFalse(token)
                .orElseThrow(() -> new RuntimeException("Refresh token not found or revoked"));

        if (storedToken.getExpiryDate().isBefore(Instant.now())) {
            storedToken.setRevoked(true);
            refreshTokenRepository.save(storedToken);
            throw new RuntimeException("Refresh token expired");
        }

        User user = userRepository.findById(storedToken.getUserId())
                .orElseThrow(() -> new RuntimeException("User not found"));

        // Revoke old token
        storedToken.setRevoked(true);
        refreshTokenRepository.save(storedToken);

        // Generate new tokens
        String newAccessToken = jwtUtil.generateAccessToken(user.getId(), user.getEmail(), user.getRole());
        String newRefreshTokenStr = jwtUtil.generateRefreshToken(user.getId(), user.getEmail());

        RefreshToken newRefreshToken = new RefreshToken();
        newRefreshToken.setToken(newRefreshTokenStr);
        newRefreshToken.setUserId(user.getId());
        newRefreshToken.setExpiryDate(Instant.now().plus(7, ChronoUnit.DAYS));
        refreshTokenRepository.save(newRefreshToken);

        return new AuthResponseDTO(newAccessToken, newRefreshTokenStr, new UserResponseDTO(user));
    }

    @Override
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(UserResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponseDTO> getFarmers() {
        return userRepository.findByRole("FARMER")
                .stream()
                .map(UserResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public List<UserResponseDTO> getRetailers() {
        return userRepository.findByRole("RETAILER")
                .stream()
                .map(UserResponseDTO::new)
                .collect(Collectors.toList());
    }

    @Override
    public UserResponseDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return new UserResponseDTO(user);
    }

    @Override
    public void deleteUser(Long id) {
        userRepository.deleteById(id);
    }
}
