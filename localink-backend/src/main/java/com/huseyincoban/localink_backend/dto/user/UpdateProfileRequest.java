package com.huseyincoban.localink_backend.dto.user;

public record UpdateProfileRequest(
        String name,
        String bio,
        String avatarUrl
) {}
