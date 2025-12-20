package com.huseyincoban.localink_backend.dto.user;

import java.time.Instant;

public record UserDto(
        Long id,
        String name,
        String username,
        String email,
        String bio,
        String avatarUrl,
        Instant lastOnline
) {
}
