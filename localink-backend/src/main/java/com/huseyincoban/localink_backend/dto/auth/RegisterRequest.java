package com.huseyincoban.localink_backend.dto.auth;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Email;

public record RegisterRequest(
        @NotBlank String name,
        @NotBlank String username,
        @Email String email,
        @NotBlank String password
){}
