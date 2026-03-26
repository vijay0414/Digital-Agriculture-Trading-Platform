package com.example.usermanagement.controller;

import com.example.usermanagement.dto.*;
import com.example.usermanagement.service.UserService;
import jakarta.validation.Valid;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/auth")
public class AuthController {

    private final UserService userService;

    public AuthController(UserService userService) {
        this.userService = userService;
    }

    @PostMapping("/register/farmer")
    public UserResponseDTO registerFarmer(@Valid @RequestBody UserRequestDTO request) {
        return userService.registerFarmer(request);
    }

    @PostMapping("/register/retailer")
    public UserResponseDTO registerRetailer(@Valid @RequestBody UserRequestDTO request) {
        return userService.registerRetailer(request);
    }

    @PostMapping("/login")
    public AuthResponseDTO login(@Valid @RequestBody LoginRequestDTO request) {
        return userService.login(request);
    }

    @PostMapping("/refresh")
    public AuthResponseDTO refresh(@Valid @RequestBody RefreshRequestDTO request) {
        return userService.refreshToken(request);
    }

    @GetMapping("/users/{id}")
    public UserResponseDTO getUserById(@PathVariable Long id) {
        return userService.getUserById(id);
    }

    @GetMapping("/users/farmers")
    public java.util.List<UserResponseDTO> getFarmers() {
        return userService.getFarmers();
    }

    @GetMapping("/users/retailers")
    public java.util.List<UserResponseDTO> getRetailers() {
        return userService.getRetailers();
    }

    @GetMapping("/users")
    public java.util.List<UserResponseDTO> getAllUsers() {
        return userService.getAllUsers();
    }
}
