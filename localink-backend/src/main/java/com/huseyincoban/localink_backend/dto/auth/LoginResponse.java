package com.huseyincoban.localink_backend.dto.auth;

import com.huseyincoban.localink_backend.dto.user.UserDto;

public record LoginResponse(
        String accessToken,
        String refreshToken,
        UserDto user
) {}
