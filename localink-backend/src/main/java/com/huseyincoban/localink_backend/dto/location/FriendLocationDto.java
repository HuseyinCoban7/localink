package com.huseyincoban.localink_backend.dto.location;

import java.time.Instant;

public record FriendLocationDto(
        Long friendId,
        String friendName,
        Double latitude,
        Double longitude,
        Instant updatedAt
) {}
