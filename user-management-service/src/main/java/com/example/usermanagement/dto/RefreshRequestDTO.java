package com.example.usermanagement.dto;

import jakarta.validation.constraints.NotBlank;

public class RefreshRequestDTO {

    @NotBlank(message = "Refresh token must not be blank")
    private String refreshToken;

    public RefreshRequestDTO() {}

    public String getRefreshToken() { return refreshToken; }
    public void setRefreshToken(String refreshToken) { this.refreshToken = refreshToken; }
}
