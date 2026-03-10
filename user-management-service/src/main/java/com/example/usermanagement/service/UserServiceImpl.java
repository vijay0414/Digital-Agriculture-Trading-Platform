package com.example.usermanagement.service;

import com.example.usermanagement.dto.UserRequestDTO;
import com.example.usermanagement.dto.UserResponseDTO;
import com.example.usermanagement.exception.EmailAlreadyExistsException;

import com.example.usermanagement.exception.UserNotFoundException;
import com.example.usermanagement.model.User;
import com.example.usermanagement.model.UserProfile;
import com.example.usermanagement.repository.UserRepository;
import com.example.usermanagement.repository.UserProfileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

/**
 * User Service Implementation
 * Implements user management operations
 */
@Slf4j
@Service
@RequiredArgsConstructor
@Transactional
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponseDTO createUser(UserRequestDTO userRequestDTO) {
        // Check if email already exists
        if (userRepository.findByEmail(userRequestDTO.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Email already exists: " + userRequestDTO.getEmail());
        }

        // Check if phone already exists
        if (userRequestDTO.getPhone() != null && userRepository.findByPhone(userRequestDTO.getPhone()).isPresent()) {
            throw new EmailAlreadyExistsException("Phone number already exists: " + userRequestDTO.getPhone());
        }

        User user = User.builder()
                .fullName(userRequestDTO.getFullName())
                .email(userRequestDTO.getEmail())
                .phone(userRequestDTO.getPhone())
                .address("") // Default empty address; profile data stored separately
                .city("") // Default empty city; profile data stored separately
                // Hash the password using BCrypt
                .passwordHash(passwordEncoder.encode(userRequestDTO.getPassword()))
                .role(userRequestDTO.getRole())
                .isActive(true)
                .build();

        User savedUser = userRepository.save(user);

        // Create user profile if provided
        if (userRequestDTO.getProfile() != null) {
            String name = userRequestDTO.getProfile().getFarmName();
            if (name == null || name.isBlank()) {
                name = userRequestDTO.getProfile().getBusinessName();
            }

            UserProfile profile = UserProfile.builder()
                    .user(savedUser)
                    .farmName(name) // This is mandatory in DB
                    .businessName(userRequestDTO.getProfile().getBusinessName())
                    .address(userRequestDTO.getProfile().getAddress())
                    .city(userRequestDTO.getProfile().getCity())
                    .state(userRequestDTO.getProfile().getState())
                    .zip(userRequestDTO.getProfile().getZip())
                    .build();
            userProfileRepository.save(profile);
            savedUser.setProfile(profile);
        }

        log.info("User created successfully: {}", savedUser.getEmail());
        return convertToResponseDTO(savedUser);
    }

    @Override
    @Transactional(readOnly = true)
    public List<UserResponseDTO> getAllUsers() {
        return userRepository.findAll()
                .stream()
                .map(this::convertToResponseDTO)
                .collect(Collectors.toList());
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponseDTO getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", id);
                    return new UserNotFoundException("User not found with ID: " + id);
                });
        return convertToResponseDTO(user);
    }

    @Override
    @Transactional(readOnly = true)
    public UserResponseDTO getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> {
                    log.error("User not found with email: {}", email);
                    return new UserNotFoundException("User not found with email: " + email);
                });
        return convertToResponseDTO(user);
    }

    @Override
    @Transactional(readOnly = true)
    public Optional<User> findByEmail(String email) {
        return userRepository.findByEmail(email);
    }

    @Override
    public UserResponseDTO updateUser(Long id, UserRequestDTO userRequestDTO) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> {
                    log.error("User not found with ID: {}", id);
                    return new UserNotFoundException("User not found with ID: " + id);
                });

        // Check if email is being changed and if new email already exists
        if (!user.getEmail().equals(userRequestDTO.getEmail()) &&
                userRepository.findByEmail(userRequestDTO.getEmail()).isPresent()) {
            throw new EmailAlreadyExistsException("Email already exists: " + userRequestDTO.getEmail());
        }

        user.setFullName(userRequestDTO.getFullName());
        user.setEmail(userRequestDTO.getEmail());
        user.setPhone(userRequestDTO.getPhone());
        user.setRole(userRequestDTO.getRole());

        if (userRequestDTO.getPassword() != null && !userRequestDTO.getPassword().isBlank()) {
            // just overwrite raw password when security disabled
            user.setPasswordHash(userRequestDTO.getPassword());
        }

        User updatedUser = userRepository.save(user);
        log.info("User updated successfully: {}", updatedUser.getEmail());
        return convertToResponseDTO(updatedUser);
    }

    @Override
    public void deleteUser(Long userid) {
        if (!userRepository.existsById(userid)) {
            log.error("User not found with ID: {}", userid);
            throw new UserNotFoundException("User not found with ID: " + userid);
        }
        userRepository.deleteById(userid);
        log.info("User deleted successfully with ID: {}", userid);
    }

    private UserResponseDTO convertToResponseDTO(User user) {
        UserResponseDTO dto = UserResponseDTO.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .role(user.getRole())
                .isActive(user.getIsActive())
                .createdAt(user.getCreatedAt())
                .updatedAt(user.getUpdatedAt())
                .build();

        // Include profile if it exists
        if (user.getProfile() != null) {
            dto.setProfile(com.example.usermanagement.dto.ProfileDTO.builder()
                    .farmName(user.getProfile().getFarmName())
                    .businessName(user.getProfile().getBusinessName())
                    .address(user.getProfile().getAddress())
                    .city(user.getProfile().getCity())
                    .state(user.getProfile().getState())
                    .zip(user.getProfile().getZip())
                    .build());
        }

        return dto;
    }
}
